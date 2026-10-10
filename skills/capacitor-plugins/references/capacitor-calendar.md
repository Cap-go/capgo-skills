# Calendar

Create, find, modify, and remove device calendar events. Official plugin, 1.x (requires `@capacitor/core` 8+).

**Platforms:** Android, iOS (no Web)

## Installation

```bash
npm install @capacitor/calendar
npx cap sync
```

## Configuration

### iOS

Add to `ios/App/App/Info.plist` (iOS crashes on first calendar access without them). iOS 17 split access into full and write-only; keep the pre-17 key too:

```xml
<key>NSCalendarsFullAccessUsageDescription</key>
<string>We need access to your calendar to search, create and remove events.</string>
<key>NSCalendarsWriteOnlyAccessUsageDescription</key>
<string>We need access to your calendar to create events.</string>
<key>NSCalendarsUsageDescription</key>
<string>We need access to your calendar to search, create and remove events.</string>
```

### Android

`READ_CALENDAR` / `WRITE_CALENDAR` are merged from the plugin manifest. Methods request the runtime permission they need on first use.

## Usage

```typescript
import { Calendar } from '@capacitor/calendar';

const status = await Calendar.requestPermissions(); // { readCalendar, writeCalendar }

const { id } = await Calendar.createEvent({
  title: 'Standup',
  startDate: Date.now() + 3600_000,
  endDate: Date.now() + 5400_000,
  firstReminderMinutes: 10,
});
```

Methods: `checkPermissions`, `requestPermissions`, `createEvent`, `createEventInteractively`, `modifyEvent`, `findEvents`, `deleteEvent`, `listCalendars`, `createCalendar`, `deleteCalendar`, `openCalendar`.

## Notes

- `writeCalendar` is satisfied by iOS write-only access; `readCalendar` needs full access.
- `createEventInteractively` opens the system editor (no permission on iOS 17+). On Android it resolves with an empty result and cannot report save vs cancel.
- `CreateEventOptions.url` is ignored on Android. iOS truncates dates to seconds.
- Errors: `OS-PLUG-CLDR-0020` permission denied, `OS-PLUG-CLDR-0001` invalid argument, `OS-PLUG-CLDR-0006` editor cancelled, `OS-PLUG-CLDR-0003` editor already open.
- Alternative with iOS reminders support: `@capgo/capacitor-calendar`.
