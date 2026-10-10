# Web-Layer Unit and Component Tests

Most app logic lives in the web layer. Test it in Node with Vitest (or the Jest setup the project already has) and mock the native boundary.

## Setup (Vitest)

```bash
npm install -D vitest jsdom @vitest/coverage-v8
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
});
```

If the project uses Vite, put the `test` block in `vite.config.ts` instead, so aliases and plugins match the app build.

## Mock the Capacitor boundary

Mock the exact module specifiers the app imports. Mocks in `setupFiles` apply to every test.

```ts
// src/test/setup.ts
import { vi } from 'vitest';

vi.mock('@capacitor/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@capacitor/core')>();
  return {
    ...actual,
    Capacitor: {
      ...actual.Capacitor,
      isNativePlatform: vi.fn(() => true),
      getPlatform: vi.fn(() => 'ios'),
      isPluginAvailable: vi.fn(() => true),
    },
  };
});

vi.mock('@capacitor/preferences', () => {
  const store = new Map<string, string>();
  return {
    Preferences: {
      get: vi.fn(async ({ key }: { key: string }) => ({ value: store.get(key) ?? null })),
      set: vi.fn(async ({ key, value }: { key: string; value: string }) => { store.set(key, value); }),
      remove: vi.fn(async ({ key }: { key: string }) => { store.delete(key); }),
      clear: vi.fn(async () => { store.clear(); }),
    },
  };
});

vi.mock('@capgo/capacitor-native-biometric', () => ({
  NativeBiometric: {
    isAvailable: vi.fn().mockResolvedValue({ isAvailable: true, biometryType: 1 }),
    verifyIdentity: vi.fn().mockResolvedValue(undefined),
  },
}));
```

Notes:
- Spreading `importOriginal()` keeps `registerPlugin`, `WebPlugin` and other exports working for code you did not mock.
- Keep mock return shapes identical to the plugin's TypeScript definitions (`node_modules/<plugin>/dist/esm/definitions.d.ts`). A mock that drifts from the real API hides bugs. Check enum values (such as `biometryType`) there.
- An in-memory fake (like the `Map` above) is usually better than bare `vi.fn()` stubs for storage plugins.
- For listener APIs (`App.addListener('appUrlOpen', cb)`), capture `cb` in the mock and call it in the test to simulate the native event.

## Test platform branches

```ts
import { Capacitor } from '@capacitor/core';
import { vi } from 'vitest';

export function mockPlatform(platform: 'ios' | 'android' | 'web') {
  vi.mocked(Capacitor.getPlatform).mockReturnValue(platform);
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(platform !== 'web');
}
```

## Example

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { biometricLogin } from './auth';

describe('biometricLogin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns false when the user cancels', async () => {
    vi.mocked(NativeBiometric.verifyIdentity).mockRejectedValueOnce(new Error('User cancelled'));
    await expect(biometricLogin()).resolves.toBe(false);
  });
});
```

## Components

Use the Testing Library for the app's framework (`@testing-library/react`, `@testing-library/vue`, `@testing-library/svelte`, Angular's `TestBed`) on top of the same setup file. Query by role and label, the same way users and screen readers find elements. That also keeps selectors stable for E2E.

Ionic web components (`ion-*`) render through Stencil custom elements. In jsdom, some behavior (overlays, gestures) does not run. Test Ionic-heavy flows in Playwright instead.

## Network

Mock HTTP at the network layer (MSW) rather than mocking your own API module, so request building and error handling are exercised too. If the app uses `CapacitorHttp` patching, its fetch/XHR patch is not active in jsdom, so MSW sees normal `fetch` calls.
