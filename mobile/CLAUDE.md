# CLAUDE.md — omre-mobile Test Suite

## Project Overview
Maestro end-to-end test suite for the **OMRE Android app** (`com.omre.app.posh`).

## Tech Stack
- **Test framework:** Maestro 2.6.1
- **Language:** YAML
- **Auth:** Manual Google login on device → `clearState: false` preserves session
- **Platform:** Android (iOS to be added later)
- **Device:** Physical Android device via ADB (`RZCX32483YX`)

## Prerequisites
- Maestro installed via Scoop (`scoop install maestro`)
- OpenJDK installed via Scoop (`scoop install java/openjdk`)
- ADB installed via Scoop (`scoop install adb`)
- JAVA_HOME permanently set: `C:\Users\manis\scoop\apps\openjdk\current`
- Android device connected via USB with USB Debugging enabled
- Manually logged into OMRE app on device via Google before running tests

## Running Tests

### Single flow
```powershell
.\run-flow.ps1 -Flow flows/home/home_feed.yaml
```

### All flows
```powershell
maestro test flows/
```

### Check device connection
```powershell
C:\Users\manis\scoop\shims\adb.exe devices
```

### Keep screen awake during tests
```powershell
C:\Users\manis\scoop\shims\adb.exe shell settings put global stay_on_while_plugged_in 3
C:\Users\manis\scoop\shims\adb.exe shell settings put system screen_off_timeout 600000
```

## Key Conventions
- **All flows start with `launchApp: clearState: false`** — preserves Google auth session
- Never use plain `launchApp` (clears state and requires re-login)
- Element selectors use visible text — Maestro finds Flutter Semantics labels
- Tap input fields by their placeholder text, not label text
- Button text is case-sensitive: "Log in" not "Login"
- Never use `hideKeyboard` — sends Android Back key and may exit the app
- Use `eraseText: 200` not `clearText` (clearText is not a valid Maestro command)
- Use `tapOn: "Log in"` directly — Flutter accessibility tree works even behind keyboard

## Navigation Patterns

### Module Switcher (12 modules)
From Social home feed:
```yaml
- tapOn: "View all"               # under "Explore OMRE Modules"
- assertVisible: "Switch to Module"
- tapOn: "Games"                  # or any module name
```
Modules: Social, Chat, Biz, Link, Learn, Studio, News, Video, Orbit, Games, Meeting, Mart

**Note:** Chat module = Messages (same screen as top-bar chat icon)
**Note:** Link module = Jobs portal (Jobs + Marketplace tabs)

### Drawer Navigation
```yaml
- tapOn: "Open navigation menu"   # hamburger ≡ icon — Flutter label
- tapOn: "Pages"                  # or any drawer item
```
Drawer items: Reputation, Business Suite, Settings, OmniKnow, Happy Corner, Virtual World, Digital Citizen, Omni AI, Pages, Groups, Town Hall, Birthday, Blogs, Weather, Friends, Logout

### Bottom Navigation (Social module)
Home / Orbit / + (create) / Camera / Profile

### Games Module Drawer
Separate drawer inside GameVerse: HTML5 Games / Tournaments / LFG Squad Finder / My Library / Gaming Activity / Notifications / Categories

### Studio Module Drawer
CREATE: Overview / Omre AI / Idea Lab / Script Gen
MANAGE: View Videos / Video Editor / Image Editor / Scheduler
SETTINGS: Analytics / Safety Check / Settings / AI Credits (350/500 used)

## Auth Strategy
Google OAuth cannot be automated. Workflow:
1. Manually log in via Google on the device once
2. Session persists in app storage
3. All flows reuse the session via `clearState: false`

## Known Issues
- Backend returns HTTP 502 intermittently
- Device has work profile (user 150) — use `--user 0` flag with ADB commands
- Email/password login hangs when backend is down
- `hideKeyboard` sends Android Back key — if keyboard already closed it exits the app
- Logo "OMRE" is Flutter canvas-rendered — NOT assertable via Maestro
- `assertNotVisible: "Home"` fails — "Home" is always in bottom nav even on login screen

## App ID
`com.omre.app.posh`

## Test Credentials
- TEST_EMAIL: w4f01@web-library.net
- TEST_PASSWORD: H@ppy7878
- (stored in `.env` — not used in current auth strategy)

## Directory Structure
```
omre-mobile/
├── CLAUDE.md
├── run-flow.ps1                  # Single flow runner
├── run-all.ps1                   # All flows + report generation
├── generate-report.js            # JSON/JUnit XML/HTML/Excel output
├── package.json                  # ExcelJS 4.4.0
├── .env                          # TEST_EMAIL, TEST_PASSWORD
└── flows/
    ├── auth/                     # Pre-login tests (email_field ✅, empty_submit 🔧, password_field 🔧, invalid_email 🔧)
    ├── smoke/                    # pre_login.yaml ✅
    ├── home/                     # home_feed
    ├── social/                   # create_post, profile
    ├── inbox/                    # inbox
    ├── messages/                 # chat_messages
    ├── games/                    # gameverse_home, gameverse_tournaments
    ├── biz/                      # biz_module
    ├── meetings/                 # meetings
    ├── mart/                     # mart
    ├── video/                    # video
    ├── link/                     # link_jobs, link_marketplace
    ├── learn/                    # learn_home
    ├── studio/                   # studio_overview
    ├── news/                     # news_feed
    ├── orbit/                    # orbit_feed
    ├── pages/                    # pages_discover, pages_create
    ├── groups/                   # groups_discover, groups_create
    ├── birthdays/                # birthdays
    ├── blogs/                    # blogs
    ├── weather/                  # weather
    ├── friends/                  # friends
    ├── town_hall/                # town_hall
    ├── settings/                 # settings
    ├── reputation/               # reputation
    ├── business_suite/           # business_suite
    ├── omniknow/                 # omniknow
    ├── happy_corner/             # happy_corner
    ├── virtual_world/            # virtual_world
    ├── digital_citizenship/      # digital_citizenship
    └── omni_ai/                  # omni_ai
```

## Flow Status
- ✅ Passing: `smoke/pre_login.yaml`, `auth/email_field.yaml`
- 🔧 Fix needed (need charged device): `auth/empty_submit.yaml`, `auth/password_field.yaml`, `auth/invalid_email.yaml`
- 📝 Written, not yet run: all 34 authenticated module flows

## Expected First-Run Fixes
Labels that may need adjustment on first run:
- `tapOn: "Open navigation menu"` — hamburger icon Flutter label
- `tapOn: "View all"` — module switcher entry point
- `tapOn: "Profile"` — bottom nav profile icon label
- `tapOn: "Notifications"` — bell icon label
- `tapOn: "Messages"` — chat icon label
- `tapOn: "+"` — FAB create button label
- `tapOn: "X"` — modal close button label (may be "Close")
- `tapOn: "Back to GameVerse"` — exact back button text in Tournaments
