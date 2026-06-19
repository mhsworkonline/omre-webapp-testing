# CLAUDE.md — omre-mobile Test Suite

## Behavioral Rules (MANDATORY)
1. **No permission/confirmation requests.** Proceed directly. Report afterward.
2. **Minimal output only.** Results only — no explanations, no preamble.
3. **No probe flows.** Write YAML directly; fix from failure screenshot only.
4. **BATCH-FIX ONLY.** After any failure: read screenshot, audit the ENTIRE remaining YAML, fix ALL issues in ONE edit, then run once. Never fix one issue per run — this wastes 3-4 min per run and is unacceptable.
5. **No new module without user approval.** Complete current module, report summary, wait.
6. **NO SHALLOW TESTING. FULL CRUD ONLY.** Every flow must exercise the complete create → read → update → delete lifecycle. Assertions must verify real state changes (count increments, text appears/disappears, button state changes) — not just "no crash". A test that only taps and asserts "no error" is rejected.

## Project
Maestro 2.6.1 e2e suite — OMRE Android app `com.omre.app.posh`.
- **Emulator:** `omre_test` (emulator-5554) — used for general module flows
- **Physical device:** Samsung SM-M115F (M11, 720x1560) — current test device for all flows

## Running
```powershell
maestro test flows/<module>/android_<name>.yaml   # single flow
maestro test flows/                               # all flows
node generate-report.js                          # generate Excel/HTML/JSON/XML report
```

## Key Conventions
- All flows: `stopApp` → `launchApp: clearState: false` (preserves Google session)
- **DEVICE-AGNOSTIC ONLY: NEVER use coordinate taps (`tapOn: point`). Always use content-desc labels (`tapOn: "label"`). Tests must work on any device.**
- If an element has no content-desc, do a UI dump to find its label. Never fall back to coordinates.
- **Back from any module content (video/article/comment) → Social Home, NOT back to module**
- Re-nav pattern after Back: `swipe DOWN` → `tapOn: "View all"` → `tapOn: "ModuleName"`
- `View all` only exists on Social Home feed, not inside module screens
- Module switcher label ≠ screen heading (e.g. "Biz" label, heading unknown)
- `eraseText: 200` not `clearText`; never use `hideKeyboard`

## Navigation
```yaml
# Module switcher (from Social Home only)
- tapOn: "View all"
- tapOn: "ModuleName"

# Drawer
- tapOn: "Open navigation menu"
- tapOn: "ItemName"
```
Modules: Social, Chat, Biz, Link, Learn, Studio, News, Video, Orbit, Games, Meeting, Mart
Drawer: Reputation, Business Suite, Settings, OmniKnow, Happy Corner, Virtual World, Digital Citizen, Omni AI, Pages, Groups, Town Hall, Birthday, Blogs, Weather, Friends

## Known Issues
- Back from content detail → Social Home (universal pattern across all modules)
- Flutter canvas renders logo/icons — not assertable
- HTTP 502 from backend is transient — re-run if seen
- Google OAuth cannot be automated — log in manually once; session persists via `clearState: false`
- Emulator session loss: restart AVD in Android Studio; re-login via Google manually
