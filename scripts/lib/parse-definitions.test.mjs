import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  configKeyFromPackage,
  extractMethods,
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

describe('extractMethods', () => {
  it('collects adjacent single-line and multi-line Promise methods without skipping', () => {
    assert.deepEqual(extractMethods(adjacentSignatures), ['alpha', 'beta', 'delta', 'gamma']);
  });

  it('ignores Promise methods on non-Plugin interfaces', () => {
    assert.deepEqual(extractMethods(helperInterface), ['pluginOnly']);
  });
});

describe('configKeyFromPackage', () => {
  it('uses CapacitorUpdater for capacitor-updater package', () => {
    assert.equal(configKeyFromPackage('@capgo/capacitor-updater'), 'CapacitorUpdater');
  });
});
