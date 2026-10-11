# Contacts

Find, pick, create, update, and remove device contacts. Official plugin, 1.x (requires `@capacitor/core` 8+).

**Platforms:** Android, iOS (no Web)

## Installation

```bash
npm install @capacitor/contacts
npx cap sync
```

## Configuration

### iOS

```xml
<key>NSContactsUsageDescription</key>
<string>We need access to contacts to search, save and remove them.</string>
```

Missing key = crash on first access. Uses `CNContactStore`, so iOS 18 Limited Access works (`find`/`save`/`remove` see only the shared subset).

### Android

`READ_CONTACTS` / `WRITE_CONTACTS` are merged from the plugin manifest; each method requests its runtime permission on first use.

## Usage

```typescript
import { Contacts } from '@capacitor/contacts';

const { contacts } = await Contacts.find({ fields: ['*'], filter: 'ada', multiple: true, hasPhoneNumber: true });

const saved = await Contacts.save({
  contact: { name: { givenName: 'Ada', familyName: 'Lovelace' }, phoneNumbers: [{ type: 'mobile', value: '+351910000000' }] },
});
await Contacts.save({ contact: { ...saved, nickname: 'Countess' } }); // id present -> update

const picked = await Contacts.pickContact(); // system picker, no permission needed on iOS
await Contacts.remove({ id: saved.id! });
```

## Notes

- No `checkPermissions()` / `requestPermissions()`: permissions are implicit. Denial rejects with `OS-PLUG-CONT-0020`.
- `note` field is unsupported on iOS (restricted entitlement).
- Contact ids from the old AddressBook-based Cordova plugin do not resolve after migration.
- Other errors: `OS-PLUG-CONT-0006` picker closed, `OS-PLUG-CONT-0003` picker already open.
- Alternative: `@capgo/capacitor-contacts`.
