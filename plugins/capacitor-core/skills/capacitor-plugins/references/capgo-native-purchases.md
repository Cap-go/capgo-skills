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

Call `configure()` before other APIs. Set `autoFinishTransactions: false` in `capacitor.config` or in `configure()` when you validate on your backend before finishing. On Android, consumables need `consumePurchase({ purchaseToken })` after delivery; `finishTransaction()` alone does not consume.

```typescript
import { NativePurchases } from '@capgo/native-purchases';

await NativePurchases.configure({ autoFinishTransactions: false });
const { transactions } = await NativePurchases.getUnfinishedTransactions();
for (const tx of transactions) {
  await grantEntitlement(tx);
  if (tx.transactionId) {
    await NativePurchases.finishTransaction({ transactionId: tx.transactionId });
  }
}
```

Revenue strategy and paywall placement: `subscription-app-revenue`.

## Docs

https://capgo.app/docs/plugins/native-purchases/
