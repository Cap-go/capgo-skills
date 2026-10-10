# Barcode Scanner

Barcode/QR scanning using OutSystems barcode libraries.

**Platforms:** Android, iOS

## Installation

```bash
npm install @capacitor/barcode-scanner
npx cap sync
```

## Configuration

### Android

Requires `minSdkVersion = 26` in `android/variables.gradle`. Two scanning libraries: `ZXING` (all formats) or `MLKIT` (all except `MAXICODE`, `RSS_14`, `RSS_EXPANDED`, `UPC_EAN_EXTENSION`).

### iOS

Add to `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required to scan barcodes.</string>
```

## Usage

```typescript
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';

const result = await CapacitorBarcodeScanner.scanBarcode({
  hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
  cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
});
console.log(result.ScanResult, result.format);
```

## Notes

- Supported formats: QR_CODE, AZTEC, CODABAR, CODE_39, CODE_93, CODE_128, DATA_MATRIX, EAN_13, EAN_8, ITF, PDF_417, UPC_A, UPC_E, and more.
- iOS: `MAXICODE` and `UPC_EAN_EXTENSION` unsupported (fall back to any format); Apple Vision does not distinguish `UPC_A` from `EAN_13`.
- Other options: `scanInstructions`, `scanButton`, `scanText`, `scanOrientation`. `scanOrientation` is ignored on Android 16+ large screens (targetSdk 36).
- Continuous scanning or a custom preview UI is out of scope; check `references/capgo-plugin-catalog.md` or a dedicated scanner plugin.
