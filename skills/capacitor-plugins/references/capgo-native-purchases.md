# Native Purchases (@capgo/native-purchases)

StoreKit and Play Billing subscriptions and one-time purchases.

**Platforms:** iOS, Android  
**Package:** `@capgo/native-purchases`

## Installation

```bash
npm install @capgo/native-purchases
npx cap sync
```

## Versions reviewed

`8.7.0` to `8.9.8` (since 2026-09-11).

## API added in window

**Methods:** `configure()`, `getUnfinishedTransactions()`, `finishTransaction()`.

Always call `configure()` before other APIs. Finish every purchase with `finishTransaction()` after you grant entitlement.

```typescript
import { NativePurchases } from '@capgo/native-purchases';

await NativePurchases.configure({ appUserID: user.id });
const pending = await NativePurchases.getUnfinishedTransactions();
for (const tx of pending.transactions) {
  await grantEntitlement(tx);
  await NativePurchases.finishTransaction({ transaction: tx });
}
```

Revenue strategy and paywall placement: `subscription-app-revenue`.

## Docs

https://capgo.app/docs/plugins/native-purchases/
