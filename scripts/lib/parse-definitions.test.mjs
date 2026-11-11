import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  configKeyFromPackage,
  extractConfigKeys,
  extractMethods,
  extractMethodsFromSources,
  loadApiSources,
} from './parse-definitions.mjs';
import {
  changelogReadOutcome,
  classifyRawHttpStatus,
  findCachedDiff,
} from './fetch-results.mjs';

const adjacentSignatures = `export interface SamplePlugin {
  /** single line a */
  alpha(): Promise<void>;
  /** single line b */
  beta(options: { id: string }): Promise<{ ok: boolean }>;
  /**
   * multiline c
   */
  gamma(
    options: { value: number },
  ): Promise<void>;
  /** single line d */
  delta(): Promise<number>;
  addListener(eventName: string, listenerFunc: () => void): Promise<void>;
  removeAllListeners(): Promise<void>;
}
`;

const helperInterface = `export interface SamplePlugin {
  pluginOnly(): Promise<void>;
}
export interface SampleHelper {
  helperOnly(): Promise<void>;
}
`;

const extendsPlugin = `export interface CapacitorSamplePlugin extends Plugin {
  alpha(): Promise<void>;
  optional?(options?: { id: string }): Promise<void>;
}
export interface ScanDocumentResponse {
  getPluginVersion(): Promise<{ version: string }>;
}
`;

describe('extractMethods', () => {
  it('collects adjacent single-line and multi-line Promise methods without skipping', () => {
    assert.deepEqual(extractMethods(adjacentSignatures), ['alpha', 'beta', 'delta', 'gamma']);
  });

  it('collects adjacent generic Promise methods with constrained and unconstrained type parameters', () => {
    const genericSignatures = `export interface SamplePlugin {
  /** unconstrained generic */
  login<T>(options: { provider: T }): Promise<{ provider: T }>;
  /**
   * constrained generic, single line
   */
  adCreate<O extends MobileAdOptions>(opts: O): Promise<void>;
  /** multi-line constrained generic */
  providerSpecificCall<T extends ProviderSpecificCall>(options: {
    call: T;
  }): Promise<{ call: T }>;
  /**
   * nested angle brackets, default type, and function constraint
   */
  mapped<T extends Record<string, Array<number>> = Record<string, number[]>>(
    opts: T,
    transform?: (value: string) => number,
  ): Promise<void>;
  split<
    T extends Foo,
    U extends (value: T) => Bar = (value: T) => Bar,
  >(
    opts: T,
  ): Promise<U>;
  optional?<U extends string>(id: U): Promise<void>;
  adjacent(): Promise<void>;
}
`;
    assert.deepEqual(extractMethods(genericSignatures), [
      'adCreate',
      'adjacent',
      'login',
      'mapped',
      'optional',
      'providerSpecificCall',
      'split',
    ]);
  });

  it('ignores Promise methods on non-Plugin interfaces', () => {
    assert.deepEqual(extractMethods(helperInterface), ['pluginOnly']);
  });

  it('parses extends Plugin and optional Promise methods', () => {
    assert.deepEqual(extractMethods(extendsPlugin), ['alpha', 'optional']);
  });

  it('returns no methods for an empty PatchPlugin type alias', () => {
    const emptyPlugin = `export interface CapacitorPatchConfig {
  recommended?: boolean;
}
export type PatchPlugin = Record<string, never>;
`;
    assert.deepEqual(extractMethods(emptyPlugin), []);
  });

  it('falls back to Interface methods when no Plugin interface exists', () => {
    const ifaceOnly = `export interface NativeMapInterface {
  create(options: { id: string }): Promise<void>;
  addMarker(marker: { id: string }): Promise<string>;
}
export class LatLngBounds {
  async contains(point: { lat: number }): Promise<boolean> {
    return true;
  }
}
`;
    assert.deepEqual(extractMethods(ifaceOnly), ['addMarker', 'create']);
  });

  it('parses NativeAudio interface without looping', () => {
    const nativeAudio = `export interface CompletedEvent {
  assetId: string;
}
export interface NativeAudio {
  play(options: { assetId: string }): Promise<void>;
  pause(options: { assetId: string }): Promise<void>;
}
`;
    assert.deepEqual(extractMethods(nativeAudio), ['pause', 'play']);
  });

  it('prefers Plugin methods from a later source file over helper classes', () => {
    const definitionsOnly = `export interface LatLngBoundsInterface {
  southwest: { lat: number; lng: number };
}
export class LatLngBounds {
  async contains(point: { lat: number }): Promise<boolean> {
    return true;
  }
}
`;
    const implementation = `export interface NativeMapPlugin extends Plugin {
  create(options: { id: string }): Promise<void>;
  addMarker(args: { id: string }): Promise<{ id: string }>;
}
`;
    assert.deepEqual(extractMethods(definitionsOnly), []);
    assert.deepEqual(extractMethodsFromSources([definitionsOnly, implementation]), [
      'addMarker',
      'create',
    ]);
  });

  it('includes methods inherited through a StripeDefinitions type alias', () => {
    const stripe = `type StripeDefinitions = PaymentSheetDefinitions & ApplePayDefinitions;
export interface PaymentSheetDefinitions {
  createPaymentSheet(options: { id: string }): Promise<void>;
  presentPaymentSheet(): Promise<{ ok: boolean }>;
}
export interface ApplePayDefinitions {
  isApplePayAvailable(): Promise<void>;
}
export interface StripePlugin extends StripeDefinitions {
  initialize(opts: { publishableKey: string }): Promise<void>;
  handleURLCallback?(opts: { url: string }): Promise<void>;
}
`;
    assert.deepEqual(extractMethods(stripe), [
      'createPaymentSheet',
      'handleURLCallback',
      'initialize',
      'isApplePayAvailable',
      'presentPaymentSheet',
    ]);
  });

  it('follows relative imports when loading API sources', async () => {
    const files = {
      'src/definitions.ts': `import type { PaymentSheetDefinitions } from './paymentsheet';
type StripeDefinitions = PaymentSheetDefinitions;
export interface StripePlugin extends StripeDefinitions {
  initialize(opts: { key: string }): Promise<void>;
}
`,
      'src/paymentsheet.ts': `export interface PaymentSheetDefinitions {
  createPaymentSheet(options: { id: string }): Promise<void>;
}
`,
    };
    const sources = await loadApiSources(async (file) => files[file] ?? null);
    assert.deepEqual(extractMethodsFromSources(sources), ['createPaymentSheet', 'initialize']);
  });

  it('resolves .js import specifiers to TypeScript sources', async () => {
    const files = {
      'src/definitions.ts': `import type { PaymentSheetDefinitions } from './paymentsheet.js';
type StripeDefinitions = PaymentSheetDefinitions;
export interface StripePlugin extends StripeDefinitions {
  initialize(opts: { key: string }): Promise<void>;
}
`,
      'src/paymentsheet.ts': `export interface PaymentSheetDefinitions {
  createPaymentSheet(options: { id: string }): Promise<void>;
}
`,
    };
    const sources = await loadApiSources(async (file) => files[file] ?? null);
    assert.deepEqual(extractMethodsFromSources(sources), ['createPaymentSheet', 'initialize']);
  });

  it('keeps loading until a Plugin interface is found instead of stopping on fallback methods', async () => {
    const files = {
      'src/definitions.ts': `export interface NativeMapInterface {
  helperOnly(): Promise<void>;
}
`,
      'src/implementation.ts': `export interface NativeMapPlugin extends Plugin {
  create(options: { id: string }): Promise<void>;
  addMarker(args: { id: string }): Promise<{ id: string }>;
}
`,
    };
    const sources = await loadApiSources(async (file) => files[file] ?? null);
    assert.deepEqual(extractMethodsFromSources(sources), ['addMarker', 'create']);
  });
});

describe('configKeyFromPackage', () => {
  it('uses CapacitorUpdater for capacitor-updater package', () => {
    assert.equal(configKeyFromPackage('@capgo/capacitor-updater'), 'CapacitorUpdater');
  });
});

describe('extractConfigKeys', () => {
  it('reads optional PluginsConfig keys', () => {
    const text = `declare module '@capacitor/cli' {
  export interface PluginsConfig {
    NavigationBar?: {
      color?: string;
      dividerColor?: string;
      style?: 'DARK' | 'LIGHT';
    };
  }
}
`;
    assert.deepEqual(extractConfigKeys(text, 'NavigationBar'), [
      'color',
      'dividerColor',
      'style',
    ]);
  });
});

describe('classifyRawHttpStatus', () => {
  it('returns missing only for 404 and fail after a final retryable error', () => {
    assert.equal(classifyRawHttpStatus(200, false), 'ok');
    assert.equal(classifyRawHttpStatus(404, false), 'missing');
    assert.equal(classifyRawHttpStatus(403, true), 'retry');
    assert.equal(classifyRawHttpStatus(429, true), 'retry');
    assert.equal(classifyRawHttpStatus(503, true), 'retry');
    assert.equal(classifyRawHttpStatus(403, false), 'fail');
    assert.equal(classifyRawHttpStatus(500, false), 'fail');
    assert.equal(classifyRawHttpStatus(401, true), 'fail');
  });
});

describe('changelogReadOutcome', () => {
  it('skips a failed candidate when another changelog can be compared', () => {
    assert.deepEqual(
      changelogReadOutcome([
        { name: 'CHANGELOG.md', oldStatus: 'error', newStatus: 'ok', oldError: 'HTTP 503' },
        { name: 'CHANGELOG', oldStatus: 'ok', newStatus: 'ok' },
      ]),
      { status: 'compared' },
    );
  });

  it('fails when every changelog read failed', () => {
    const outcome = changelogReadOutcome([
      { name: 'CHANGELOG.md', oldStatus: 'error', newStatus: 'error', oldError: 'HTTP 503', newError: 'HTTP 503' },
      { name: 'CHANGELOG', oldStatus: 'error', newStatus: 'missing', oldError: 'HTTP 429' },
      { name: 'changelog.md', oldStatus: 'missing', newStatus: 'error', newError: 'HTTP 500' },
    ]);
    assert.equal(outcome.status, 'failed');
    assert.match(outcome.error, /changelog reads failed/);
  });

  it('returns none when every changelog candidate is missing', () => {
    assert.deepEqual(
      changelogReadOutcome([
        { name: 'CHANGELOG.md', oldStatus: 'missing', newStatus: 'missing' },
        { name: 'CHANGELOG', oldStatus: 'missing', newStatus: 'missing' },
      ]),
      { status: 'none' },
    );
  });
});

describe('findCachedDiff', () => {
  it('prefers a package-keyed diff over a repo-level fallback', () => {
    const diffs = [
      { repo: 'capacitor-firebase', package: '@capgo/capacitor-firebase', methods: { added: [] } },
      { repo: 'capacitor-firebase', package: '@capgo/capacitor-firebase-analytics', pkgPath: 'packages/analytics', methods: { added: ['logEvent'] } },
    ];
    assert.deepEqual(
      findCachedDiff(diffs, '@capgo/capacitor-firebase-analytics', 'capacitor-firebase').methods.added,
      ['logEvent'],
    );
    assert.equal(
      findCachedDiff(diffs, '@capgo/capacitor-admob', 'capacitor-admob'),
      null,
    );
  });
});
