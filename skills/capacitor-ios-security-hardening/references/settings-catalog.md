# Security Settings Catalog

The settings this skill tracks. Keep this file and `scripts/audit-build-settings.mjs` in sync.

"Scope" is the language that must be present in the target for the setting to matter. Do not propose clang-only settings for a pure Swift target such as the stock Capacitor App target.

## Stage A: compiler warnings (every build)

| Setting | Hardened value | Flag | Scope | Why |
|---|---|---|---|---|
| `GCC_WARN_ABOUT_RETURN_TYPE` | `YES_ERROR` | `-Werror=return-type` | C, ObjC, C++ | A missing return is undefined behavior. `YES_ERROR` promotes only this warning |
| `GCC_WARN_UNINITIALIZED_AUTOS` | `YES_AGGRESSIVE` | `-Wuninitialized -Wconditional-uninitialized` | C, ObjC, C++ | Reading stale stack data leaks memory and lets attackers steer control flow |
| `CLANG_WARN_IMPLICIT_FALLTHROUGH` | `YES` | `-Wimplicit-fallthrough` | C, ObjC, C++ | Forces explicit fallthrough annotations |
| `GCC_WARN_64_TO_32_BIT_CONVERSION` | `YES` | `-Wshorten-64-to-32` | C, ObjC, C++ | Truncated lengths are a classic overflow source |
| `GCC_TREAT_IMPLICIT_FUNCTION_DECLARATIONS_AS_ERRORS` | `YES` | `-Werror=implicit-function-declaration` | C, ObjC | Implicit declarations give wrong return types |

## Stage B: static analyzer (Analyze only, no build risk)

| Setting | Hardened value | Checker | Scope |
|---|---|---|---|
| `CLANG_ANALYZER_SECURITY_FLOATLOOPCOUNTER` | `YES` | `security.FloatLoopCounter` | C, ObjC, C++ |
| `CLANG_ANALYZER_SECURITY_INSECUREAPI_RAND` | `YES` | `security.insecureAPI.rand` | C, ObjC, C++ |
| `CLANG_ANALYZER_SECURITY_INSECUREAPI_STRCPY` | `YES` | `security.insecureAPI.strcpy` | C, ObjC, C++ |
| `CLANG_TIDY_BUGPRONE_REDUNDANT_BRANCH_CONDITION` | `YES` | `bugprone-redundant-branch-condition` | C, ObjC, C++ |

Default-on checkers. Do not set them; flag them only if someone set them to `NO`:
`CLANG_ANALYZER_SECURITY_KEYCHAIN_API`, `CLANG_ANALYZER_SECURITY_INSECUREAPI_UNCHECKEDRETURN`, `CLANG_ANALYZER_SECURITY_INSECUREAPI_GETPW_GETS`, `CLANG_ANALYZER_SECURITY_INSECUREAPI_MKSTEMP`, `CLANG_ANALYZER_SECURITY_INSECUREAPI_VFORK`, `GCC_WARN_TYPECHECK_CALLS_TO_PRINTF`.

## Stage C: Enhanced Security

| Setting | Value | Note |
|---|---|---|
| `ENABLE_ENHANCED_SECURITY` | `YES` | Set at project level. Cascades the settings below |
| `ENABLE_POINTER_AUTHENTICATION` | `YES` (cascaded) | Adds `arm64e` to device builds. The only cascaded setting that can break linking |
| `ENABLE_HARDWARE_CHECKED_POINTER_ARITHMETIC_SLICE` | `NO` by default | Adds `arm64e.x1`. Not cascaded. Only after memory tagging is rolled out |

Cascaded by `ENABLE_ENHANCED_SECURITY`. Do not set by hand:
`GCC_WARN_SHADOW`, `CLANG_WARN_EMPTY_BODY`, `ENABLE_SECURITY_COMPILER_WARNINGS`, `CLANG_CXX_STANDARD_LIBRARY_HARDENING` (`fast` in Release, `debug` in Debug), `CLANG_ENABLE_C_TYPED_ALLOCATOR_SUPPORT`, `CLANG_ENABLE_CPLUSPLUS_TYPED_ALLOCATOR_SUPPORT`.

Entitlements are in [enhanced-security.md](enhanced-security.md).

## Stage E: extra diagnostics (noisier, opt-in)

| Setting | Value | Scope | Note |
|---|---|---|---|
| `CLANG_WARN_SUSPICIOUS_IMPLICIT_CONVERSION` | `YES` | C, ObjC, C++ | `-Wconversion`, can be noisy |
| `CLANG_ANALYZER_SECURITY_BUFFER_OVERFLOW_EXPERIMENTAL` | `YES` | C, ObjC, C++ | More false positives |
| `CLANG_WARN_ASSIGN_ENUM` | `YES` | C, ObjC, C++ | Code quality |
| `GCC_WARN_SIGN_COMPARE` | `YES` | C, ObjC, C++ | Code quality |
| `CLANG_WARN_COMPLETION_HANDLER_MISUSE` | `YES` | ObjC, blocks | Useful in older ObjC plugins |
| `CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF` | `YES` | ObjC | |
| `CLANG_WARN_OBJC_REPEATED_USE_OF_WEAK` | `YES` | ObjC | |

## Not auto-enabled (mention only)

| Setting | Why |
|---|---|
| `ENABLE_C_BOUNDS_SAFETY` | Needs source annotations. Changes language semantics |
| `ENABLE_CPLUSPLUS_BOUNDS_SAFE_BUFFERS` | Needs buffer rewrites. See https://clang.llvm.org/docs/SafeBuffers.html |
| `SWIFT_STRICT_CONCURRENCY = complete` / Swift 6 language mode | Data-race safety. A separate migration, not a flag flip. Capacitor 9 builds with the Swift 6 compiler, but the language mode can stay 5 |

## Capacitor-specific settings to report

| Setting | Guidance |
|---|---|
| `ENABLE_USER_SCRIPT_SANDBOXING` | `YES` is safer, but CocoaPods script phases fail under it. Keep `NO` on CocoaPods projects with a recorded reason. Revisit after moving to SPM |
| `ONLY_ACTIVE_ARCH` | Must be `NO` in Release. Matters for plugins shipped as xcframeworks |
| `CODE_SIGN_ENTITLEMENTS` | Path to the entitlements plist. Empty in the stock template until a capability is added |
| `IPHONEOS_DEPLOYMENT_TARGET` | 15.0 for Capacitor 8, 16.0 for Capacitor 9. Report it; do not change it here |
