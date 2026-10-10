#!/usr/bin/env node
// Filter `xcodebuild -showBuildSettings -json` output to security-relevant settings.
// Usage:
//   node audit-build-settings.mjs <settings.json> [--pbxproj path/to/project.pbxproj] [--target App] [--unhardened]
// Read-only: never writes files.
import { readFileSync } from 'node:fs';

// key -> expected hardened value(s). `null` means informational only.
const TRACKED = {
  // Stage A: compiler warnings
  GCC_WARN_ABOUT_RETURN_TYPE: ['YES_ERROR'],
  GCC_WARN_UNINITIALIZED_AUTOS: ['YES_AGGRESSIVE'],
  CLANG_WARN_IMPLICIT_FALLTHROUGH: ['YES'],
  GCC_WARN_64_TO_32_BIT_CONVERSION: ['YES'],
  GCC_TREAT_IMPLICIT_FUNCTION_DECLARATIONS_AS_ERRORS: ['YES'],
  // Stage B: static analyzer
  CLANG_ANALYZER_SECURITY_FLOATLOOPCOUNTER: ['YES'],
  CLANG_ANALYZER_SECURITY_INSECUREAPI_RAND: ['YES'],
  CLANG_ANALYZER_SECURITY_INSECUREAPI_STRCPY: ['YES'],
  CLANG_TIDY_BUGPRONE_REDUNDANT_BRANCH_CONDITION: ['YES'],
  // Default-on checkers (flag only if disabled)
  CLANG_ANALYZER_SECURITY_KEYCHAIN_API: ['YES'],
  CLANG_ANALYZER_SECURITY_INSECUREAPI_UNCHECKEDRETURN: ['YES'],
  CLANG_ANALYZER_SECURITY_INSECUREAPI_GETPW_GETS: ['YES'],
  CLANG_ANALYZER_SECURITY_INSECUREAPI_MKSTEMP: ['YES'],
  CLANG_ANALYZER_SECURITY_INSECUREAPI_VFORK: ['YES'],
  GCC_WARN_TYPECHECK_CALLS_TO_PRINTF: ['YES'],
  // Stage C: Enhanced Security
  ENABLE_ENHANCED_SECURITY: ['YES'],
  ENABLE_POINTER_AUTHENTICATION: ['YES'],
  ENABLE_HARDWARE_CHECKED_POINTER_ARITHMETIC_SLICE: ['YES'],
  GCC_WARN_SHADOW: ['YES'],
  CLANG_WARN_EMPTY_BODY: ['YES'],
  ENABLE_SECURITY_COMPILER_WARNINGS: ['YES'],
  CLANG_CXX_STANDARD_LIBRARY_HARDENING: ['fast', 'debug', 'extensive'],
  CLANG_ENABLE_C_TYPED_ALLOCATOR_SUPPORT: ['YES'],
  CLANG_ENABLE_CPLUSPLUS_TYPED_ALLOCATOR_SUPPORT: ['YES'],
  // Stage E: extra diagnostics
  CLANG_WARN_SUSPICIOUS_IMPLICIT_CONVERSION: ['YES'],
  CLANG_ANALYZER_SECURITY_BUFFER_OVERFLOW_EXPERIMENTAL: ['YES'],
  CLANG_WARN_ASSIGN_ENUM: ['YES'],
  GCC_WARN_SIGN_COMPARE: ['YES'],
  CLANG_WARN_COMPLETION_HANDLER_MISUSE: ['YES'],
  CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF: ['YES'],
  CLANG_WARN_OBJC_REPEATED_USE_OF_WEAK: ['YES'],
  ENABLE_USER_SCRIPT_SANDBOXING: ['YES'],
  // Context
  CODE_SIGN_ENTITLEMENTS: null,
  IPHONEOS_DEPLOYMENT_TARGET: null,
  SDKROOT: null,
  SUPPORTED_PLATFORMS: null,
  SWIFT_VERSION: null,
  ONLY_ACTIVE_ARCH: null,
  ARCHS: null,
  CONFIGURATION: null,
};

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--pbxproj' && args[args.indexOf(a) - 1] !== '--target');
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const pbxPath = opt('--pbxproj');
const targetFilter = opt('--target');
const unhardenedOnly = args.includes('--unhardened');

if (!file) {
  console.error('usage: audit-build-settings.mjs <settings.json> [--pbxproj file] [--target App] [--unhardened]');
  process.exit(2);
}

let entries;
try {
  entries = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`Cannot parse ${file} as JSON. Did you pass -json to xcodebuild -showBuildSettings? (${e.message})`);
  process.exit(1);
}
if (!Array.isArray(entries)) entries = [entries];

const pbxLines = pbxPath ? readFileSync(pbxPath, 'utf8').split('\n') : [];
const explicitLines = (key) => {
  const rx = new RegExp(`\\b${key}\\s*=`);
  const hits = [];
  pbxLines.forEach((line, i) => {
    if (rx.test(line)) hits.push(i + 1);
  });
  return hits;
};

for (const entry of entries) {
  const target = entry.target ?? '(unknown target)';
  if (targetFilter && target !== targetFilter) continue;
  const bs = entry.buildSettings ?? {};
  console.log(`\n# target: ${target}  configuration: ${bs.CONFIGURATION ?? '?'}`);
  for (const [key, expected] of Object.entries(TRACKED)) {
    const value = bs[key] ?? '';
    const lines = pbxPath ? explicitLines(key) : [];
    let status;
    if (expected === null) status = 'info';
    else if (expected.includes(value)) status = 'hardened';
    else if (lines.length > 0) status = 'DISABLED';
    else status = 'default-off';
    if (unhardenedOnly && (status === 'hardened' || status === 'info')) continue;
    const where = lines.length ? `  [explicit: pbxproj ${lines.join(',')}]` : '';
    console.log(`${status.padEnd(12)} ${key}=${value}${where}`);
  }
}
