# Registering SceneDelegate.swift in project.pbxproj

A file on disk is not compiled until the App target knows about it. Symptom of a missing registration: `Cannot find 'SceneDelegate' in scope` in `AppDelegate.swift`, or a black screen because the class named in `Info.plist` does not exist at runtime.

## Preferred: let a tool do it

1. `npx cap migrate` (CLI 8.5+) registers it when the project is eligible (logs "Registering SceneDelegate.swift with the Xcode App target").
2. Xcode: right-click the `App` group -> Add Files to "App" -> select `SceneDelegate.swift`, tick the `App` target.

## Check first

```bash
grep -c 'SceneDelegate.swift' ios/App/App.xcodeproj/project.pbxproj
grep -n 'PBXFileSystemSynchronizedRootGroup' ios/App/App.xcodeproj/project.pbxproj
```

- Count 4 -> registered (file reference, build file, group child, Sources phase entry).
- If the App folder is a synchronized folder (`PBXFileSystemSynchronizedRootGroup`, Xcode 16+ projects), files inside it are compiled automatically; do not add explicit entries.

## Manual edit (only when Xcode is unavailable)

Four edits, two new 24-character hex IDs that do not already appear in the file (generate with `openssl rand -hex 12 | tr a-f A-F`). Shown with the IDs from the Capacitor 8.5 template; use your own.

```text
/* Begin PBXBuildFile section */
		9582B6832FE993A70072D4E8 /* SceneDelegate.swift in Sources */ = {isa = PBXBuildFile; fileRef = 9582B6822FE993A50072D4E8 /* SceneDelegate.swift */; };

/* Begin PBXFileReference section */
		9582B6822FE993A50072D4E8 /* SceneDelegate.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SceneDelegate.swift; sourceTree = "<group>"; };

/* the PBXGroup whose comment is "App" (the one listing AppDelegate.swift), children = ( */
				9582B6822FE993A50072D4E8 /* SceneDelegate.swift */,

/* the App target's PBXSourcesBuildPhase, files = ( next to AppDelegate.swift in Sources */
				9582B6832FE993A70072D4E8 /* SceneDelegate.swift in Sources */,
```

Rules:
- Group child and file reference use the file-reference ID; Sources phase uses the build-file ID.
- Use tabs, matching the surrounding lines.
- Add to the App target only, not to extension targets (widgets, notification service).

Validate:

```bash
plutil -lint ios/App/App.xcodeproj/project.pbxproj
xcodebuild -project ios/App/App.xcodeproj -list
```

If either fails, revert the file (`git checkout -- ios/App/App.xcodeproj/project.pbxproj`) after confirming with the user, and register through Xcode.
