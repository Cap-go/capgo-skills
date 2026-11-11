import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  configKeyFromPackage,
  extractConfigKeys,
  extractMethods,
  extractMethodsFromSources,
} from './parse-definitions.mjs';

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
