#!/usr/bin/env bash
# Read-only scan for iOS APIs that assume one full-screen window.
# Usage: scan-legacy-apis.sh [project-root]   (default: current directory)
# Scans the app's native code (ios/App/App) and installed plugins (node_modules/**/ios).
set -euo pipefail

ROOT="${1:-.}"
PATTERN='UIScreen\.main\b|UIScreen\.mainScreen|\[UIScreen mainScreen\]|statusBarOrientation|\.interfaceOrientation\b|UIDevice\.current\.orientation|\[\[UIDevice currentDevice\] orientation\]|userInterfaceIdiom|UI_USER_INTERFACE_IDIOM|UIApplication\.shared\.windows|\.keyWindow\b|UIApplication\.shared\.statusBarFrame|statusBarFrame|topLayoutGuide|bottomLayoutGuide|applicationDidBecomeActive|applicationWillResignActive|applicationDidEnterBackground|applicationWillEnterForeground|UIApplication\.shared\.applicationState|traitCollectionDidChange|windowScene\(_:didUpdate:interfaceOrientation'

scan() {
  local label="$1"; shift
  local hits
  hits=$(grep -rnE "$PATTERN" "$@" --include='*.swift' --include='*.m' --include='*.mm' --include='*.h' 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "== $label"
    echo "$hits"
    echo
  fi
}

if [ -d "$ROOT/ios/App/App" ]; then
  scan "app native code (ios/App/App)" "$ROOT/ios/App/App"
fi

if [ -d "$ROOT/node_modules" ]; then
  # Each plugin's ios folder, scoped (@scope/name/ios) and unscoped (name/ios)
  for dir in "$ROOT"/node_modules/@*/*/ios "$ROOT"/node_modules/*/ios; do
    [ -d "$dir" ] || continue
    pkg="${dir#"$ROOT"/node_modules/}"
    pkg="${pkg%/ios}"
    scan "plugin $pkg" "$dir"
  done
fi

# Info.plist keys that control resizing
PLIST="$ROOT/ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  echo "== Info.plist keys"
  grep -nE 'UIRequiresFullScreen|UIRequiresFullScreenIgnoredStartingWithVersion|UIApplicationSceneManifest|UIApplicationSupportsMultipleScenes|UISupportedInterfaceOrientations|UILaunchStoryboardName|UILaunchScreen' "$PLIST" || echo "(none of the tracked keys found)"
fi
