# CLAUDE.md — omre-mobile Test Suite

## Behavioral Rules (MANDATORY)
1. **No permission/confirmation requests.** Proceed directly. Report afterward.
2. **Minimal output only.** Results only — no explanations, no preamble.
3. **No probe flows.** Write YAML directly; fix from failure screenshot only.
4. **BATCH-FIX ONLY.** After any failure: read screenshot, audit the ENTIRE remaining YAML, fix ALL issues in ONE edit, then run once. Never fix one issue per run — this wastes 3-4 min per run and is unacceptable.
5. **No new module without user approval.** Complete current module, report summary, wait.

## Project
Maestro 2.6.1 e2e suite — OMRE Android app `com.omre.app.posh` — emulator `omre_test`.

## Running
```powershell
maestro test flows/<module>/android_<name>.yaml   # single flow
maestro test flows/                               # all flows
node generate-report.js                          # generate Excel/HTML/JSON/XML report
```

## Key Conventions
- All flows: `stopApp` → `launchApp: clearState: false` (preserves Google session)
- Flutter semantic tree: coordinate taps (`tapOn: point: "x%,y%"`) for icon-only buttons
- Tab row sits at y≈14%; tabs not in semantic tree — use coordinate taps
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
