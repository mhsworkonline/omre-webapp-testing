# Claude Session State — Social Module Deep-Dive
**Date:** 2026-06-18 (Session 5)
**Device:** Samsung SM-S711B (S23 FE, 1080x2340 @ 450dpi) — physical device
**App:** com.omre.app.posh
**Working directory:** `c:\claude-folder\webapp-testing\omre-app\mobile`
**Test hashtag:** `#morningvibes`

---

## Status: IN PROGRESS — 0 / 6 flows run this session

All 6 YAML flows are written and on disk. None have been executed yet in this session.

| # | File | TCs | Status |
|---|------|-----|--------|
| 1 | `flows/social/android_social_feed.yaml` | 15 | Written + fixed (ready to run) |
| 2 | `flows/social/android_social_create_post.yaml` | 35 | Written (not run) |
| 3 | `flows/social/android_social_photo_post.yaml` | 25 | Written (not run) |
| 4 | `flows/social/android_social_interactions.yaml` | 40 | Written (not run) |
| 5 | `flows/social/android_social_follow.yaml` | 15 | Written + coord fix (not run) |
| 6 | `flows/social/android_social_stories.yaml` | 18 | Written (not run) |

**Total TCs:** 148

---

## Key Coordinates (Social Home — 1080x2340)

| Element | Coordinate | Bounds |
|---------|-----------|--------|
| Compose text field | 56%,76% | [217,1683][998,1863] |
| Photo icon | 12%,83% | [82,1915][174,1972] |
| Video icon | 20%,83% | [174,1915][267,1972] |
| Feeling icon (3rd) | 29%,83% | [267,1915][360,1972] |
| Post submit button | content-desc "Post" | [810,1880][998,1972] |
| Following tab | 17%,42% | [45,910][319,1045] |
| For You tab | 40%,42% | [319,910][550,1045] |
| Own post "..." (top) | 86%,22% | — |
| Matt Suliman "..." | 86%,25% | [866,520][1001,655] |
| Action bar Like | 12%,23% | — |
| Action bar Comment | 26%,23% | — |
| Action bar Repost | 41%,23% | — |
| Action bar Share | 53%,23% | — |
| Action bar Bookmark | 89%,23% | — |

---

## Critical Lessons Learned This Session

1. **Tab content-desc includes newlines** — "For You\nTab 2 of 2" — `assertVisible: "For You"` FAILS even though tab is visible on screen. Maestro does NOT do substring matching. Fix: use coordinate taps for tabs, assert `"View all"`, `"Create Story"`, `"Post"` instead.

2. **DO NOT overwrite YAML flow files** — use targeted `Edit` on specific failing lines only. Never use `Write` tool on an existing flow file.

3. **BATCH-FIX rule** — after any failure: read screenshot, audit entire YAML, fix ALL issues in ONE edit, run once.

4. **adb screencap** must use Bash tool: `adb exec-out screencap -p > /c/path/file.png` — PowerShell produces corrupt PNG.

5. **`stopApp + launchApp: clearState: false`** — preserves Google OAuth session on physical device.

---

## Process for Each Flow
```
1. maestro test flows/social/android_<name>.yaml
2. On failure: Bash adb screencap → read → audit entire YAML → one targeted Edit → run once
3. On pass: move to next flow
4. After all 6 pass: generate report
```

---

## Run Command
```powershell
cd c:\claude-folder\webapp-testing\omre-app\mobile
maestro test flows/social/android_social_feed.yaml
```
