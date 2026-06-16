# Test Coverage Matrix

**Last updated:** 2026-06-14  
**Definition of done:** Every cell is either a TC ID (covered) or `-` (not applicable). `TODO` = gap that needs a test.  
**Categories:** Render · CRUD · Nav · Validation · Auth · Interactive · States · Edge

---

## Home Module

### home.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-HOME-01, TC-HOME-02, TC-HOME-03, TC-HOME-04, TC-HOME-05 | - | TC-HOME-01 | - | TC-HOME-01 | - | - | TC-HOME-38, TC-HOME-39, TC-HOME-40 |
| Feed & Content | TC-HOME-06, TC-HOME-41, TC-HOME-55 | - | - | - | TC-HOME-06 | TC-HOME-08 | TC-HOME-08 | - |
| Post Card Anatomy | TC-HOME-09, TC-HOME-10, TC-HOME-11, TC-HOME-12, TC-HOME-13 | - | TC-HOME-21 | - | - | - | TC-HOME-37 | TC-HOME-11 |
| Post Interactions | TC-HOME-14, TC-HOME-16, TC-HOME-18 | - | - | - | TC-HOME-14, TC-HOME-16, TC-HOME-18 | TC-HOME-15, TC-HOME-17, TC-HOME-19, TC-HOME-20 | - | TC-HOME-14, TC-HOME-16 |
| Navigation | TC-HOME-25, TC-HOME-26, TC-HOME-56, TC-HOME-57, TC-HOME-58 | - | TC-HOME-22, TC-HOME-23, TC-HOME-24 | - | - | - | - | - |
| Create Post Widget | TC-HOME-07, TC-HOME-27, TC-HOME-41, TC-HOME-42, TC-HOME-44, TC-HOME-46, TC-HOME-48, TC-HOME-50 | TC-HOME-31 | - | TC-HOME-30, TC-HOME-53 | TC-HOME-07, TC-HOME-27 | TC-HOME-27, TC-HOME-43, TC-HOME-45, TC-HOME-47, TC-HOME-49, TC-HOME-51 | - | TC-HOME-54 |
| Composer Features | TC-HOME-28, TC-HOME-33, TC-HOME-59 | - | - | - | - | - | - | TC-HOME-29 |
| Stories Bar | TC-HOME-34 | - | - | - | - | TC-HOME-35 | - | - |

**TODOs:**
- Post author link missing validation
- Like button reaction picker not tested here (covered in interactions.spec.js)

### post-creation.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Post Creation (Full Flow) | TC-POST-TEXT-01, TC-POST-PHOTO-01 to TC-POST-PHOTO-06, TC-POST-VIDEO-01 to TC-POST-VIDEO-04, TC-POST-FEELING-01 to TC-POST-FEELING-06, TC-POST-STUDIO-01 to TC-POST-STUDIO-05, TC-POST-LIVE-01 to TC-POST-LIVE-04 | TC-POST-TEXT-02, TC-POST-TEXT-03, TC-POST-SUBMIT-01, TC-POST-SUBMIT-02, TC-POST-SUBMIT-03 | TC-POST-LIVE-02 | TC-POST-TEXT-02, TC-POST-TEXT-07 | TC-POST-TEXT-01 | TC-POST-TEXT-04, TC-POST-TEXT-05, TC-POST-TEXT-06, TC-POST-TEXT-08, TC-POST-PHOTO-02 to TC-POST-PHOTO-06, TC-POST-VIDEO-02 to TC-POST-VIDEO-04, TC-POST-FEELING-02 to TC-POST-FEELING-05, TC-POST-STUDIO-02 to TC-POST-STUDIO-05, TC-POST-LIVE-01, TC-POST-PRIVACY-01 to TC-POST-PRIVACY-05, TC-POST-UPLOAD-01 to TC-POST-UPLOAD-05 | - | TC-POST-UPLOAD-02, TC-POST-UPLOAD-04, TC-POST-NETWORK-01 |

### stories.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Stories Bar | TC-STORY-BAR-01 to TC-STORY-BAR-05 | - | TC-STORY-BAR-03 | - | - | TC-STORY-BAR-01, TC-STORY-BAR-05 | - | TC-STORY-VIEW-02 |
| Viewing Stories | TC-STORY-VIEW-01 to TC-STORY-VIEW-11 | - | TC-STORY-VIEW-01 | - | - | TC-STORY-VIEW-05, TC-STORY-VIEW-06, TC-STORY-VIEW-07, TC-STORY-VIEW-10 | - | - |
| Story Reactions & Replies | TC-STORY-REACT-01 to TC-STORY-REACT-04 | - | - | - | - | TC-STORY-REACT-03, TC-STORY-REACT-04 | - | - |
| Creating a Story | TC-STORY-CREATE-02 to TC-STORY-CREATE-06 | TC-STORY-CREATE-02 | - | - | - | TC-STORY-CREATE-06 | - | - |
| My Story Management | TC-STORY-MY-01, TC-STORY-MY-03, TC-STORY-MY-04 | TC-STORY-MY-03 | - | - | - | - | - | - |

**Note:** TC-STORY-BAR-03, TC-STORY-VIEW-08, TC-STORY-VIEW-09, TC-STORY-CREATE-01, TC-STORY-MY-02 — all have improved implementations with broad selectors and skip guards; they pass or skip gracefully depending on live content.

### interactions.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Comment Flow | - | TC-INTERACT-COMMENT-05, TC-INTERACT-COMMENT-06 | - | TC-INTERACT-COMMENT-04 | - | TC-INTERACT-COMMENT-01 to TC-INTERACT-COMMENT-12 | - | - |
| Reaction Picker | - | - | - | - | - | TC-INTERACT-REACT-01 to TC-INTERACT-REACT-06 | - | TC-HOME-15 |
| Post Detail View | - | - | TC-INTERACT-DETAIL-01, TC-INTERACT-DETAIL-02, TC-INTERACT-DETAIL-06 | - | - | TC-INTERACT-DETAIL-02, TC-INTERACT-DETAIL-04, TC-INTERACT-DETAIL-05 | - | TC-INTERACT-DETAIL-03 |
| Share Flow | - | - | - | - | - | TC-INTERACT-SHARE-01 to TC-INTERACT-SHARE-06 | - | TC-INTERACT-SHARE-02, TC-INTERACT-SHARE-07 |
| See More / Truncation | - | - | - | - | - | TC-INTERACT-SEERMORE-01 to TC-INTERACT-SEERMORE-04 | - | - |
| Bookmark / Save | - | TC-INTERACT-SAVE-02 | - | - | - | TC-INTERACT-SAVE-01, TC-INTERACT-SAVE-03 | - | - |
| Feed Tabs | TC-INTERACT-TABS-01 | - | - | - | - | TC-INTERACT-TABS-02, TC-INTERACT-TABS-03 | TC-INTERACT-TABS-02 | TC-INTERACT-TABS-04 |
| Hashtags & Mentions | - | - | TC-INTERACT-TAG-02, TC-INTERACT-TAG-04 | - | - | TC-INTERACT-TAG-01, TC-INTERACT-TAG-03 | - | - |
| Infinite Scroll & Loading | - | - | - | - | - | TC-INTERACT-SCROLL-01, TC-INTERACT-SCROLL-02, TC-INTERACT-SCROLL-04 | TC-INTERACT-SCROLL-01 | TC-INTERACT-SCROLL-03, TC-INTERACT-SCROLL-05 |

**TODOs:**
- TC-INTERACT-SHARE-07 (copy link clipboard verification) — skip stub added (untestable)

---

## Social Module

### friends.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-FRIENDS-02, TC-FRIENDS-03 | TC-FRIENDS-01 | TC-FRIENDS-01 | - | TC-FRIENDS-04 | - | - | - |
| Filter Tabs | TC-FRIENDS-05 to TC-FRIENDS-08 | - | TC-FRIENDS-09 | - | - | TC-FRIENDS-09 | - | - |
| Friends List | TC-FRIENDS-10 to TC-FRIENDS-13, TC-FRIENDS-15 | - | TC-FRIENDS-14 | - | - | - | TC-FRIENDS-10 | - |
| Friend Requests | TC-FRIENDS-16 to TC-FRIENDS-18 | TC-FRIENDS-19, TC-FRIENDS-20 | - | - | - | TC-FRIENDS-19, TC-FRIENDS-20 | TC-FRIENDS-16 | - |
| Search Users | TC-FRIENDS-21 | - | - | - | - | TC-FRIENDS-22, TC-FRIENDS-24 | TC-FRIENDS-25 | TC-FRIENDS-25 |
| Send Friend Request | TC-FRIENDS-26 | TC-FRIENDS-27, TC-FRIENDS-28 | - | - | - | TC-FRIENDS-27, TC-FRIENDS-28 | - | - |
| Friend Actions | TC-FRIENDS-29 | TC-FRIENDS-31, TC-FRIENDS-32 | TC-FRIENDS-30 | - | - | TC-FRIENDS-30 to TC-FRIENDS-32 | - | - |
| Suggested Friends | TC-FRIENDS-33, TC-FRIENDS-34 | - | - | - | - | TC-FRIENDS-35 | - | - |
| Online Status | TC-FRIENDS-36 | - | - | - | - | - | - | TC-FRIENDS-37, TC-FRIENDS-38 |

**TODOs:**
- Mutual friends count calculation accuracy
- Unblock/block list management
- Search with special characters and Unicode
- Friend request timeout handling
- Pagination when friend list exceeds threshold

### messages.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-MSG-02, TC-MSG-03 | TC-MSG-01 | TC-MSG-01 | - | TC-MSG-05 | TC-MSG-04 | - | - |
| Conversation List | TC-MSG-06 to TC-MSG-09, TC-MSG-13 | - | - | - | - | TC-MSG-12 | TC-MSG-10, TC-MSG-06 | TC-MSG-11 |
| Opening a Conversation | TC-MSG-14 to TC-MSG-18, TC-MSG-20 | - | TC-MSG-19 | - | - | TC-MSG-14 | TC-MSG-20 | - |
| Sending Messages | - | TC-MSG-21, TC-MSG-26 | - | TC-MSG-22, TC-MSG-23 | - | TC-MSG-24, TC-MSG-25 | - | - |
| Message Input Toolbar | TC-MSG-27, TC-MSG-28 | - | - | - | - | TC-MSG-29, TC-MSG-30 | - | - |
| Message Actions | - | TC-MSG-32 | - | - | - | TC-MSG-31, TC-MSG-32 | TC-MSG-33, TC-MSG-34 | - |
| New Conversation | TC-MSG-35 | - | TC-MSG-35 | - | - | TC-MSG-36 | - | TC-MSG-37 |
| Unread State | - | - | - | - | - | TC-MSG-39 | TC-MSG-38, TC-MSG-40 | - |
| Message History | - | - | - | - | - | TC-MSG-41 | TC-MSG-42, TC-MSG-43 | - |
| Group Conversations | TC-MSG-44 | - | - | - | - | - | - | TC-MSG-45 |
| Voice & Video Calls | TC-MSG-46, TC-MSG-47, TC-MSG-50 | - | - | - | - | TC-MSG-48, TC-MSG-49, TC-MSG-51, TC-MSG-53 | - | TC-MSG-52 |
| Search Within Conversation | TC-MSG-54 | - | - | - | - | TC-MSG-55 | - | - |

**TODOs:**
- Group conversation creation workflow
- Message edit functionality
- Message emoji reactions
- File/image sharing in chat
- Typing indicator display
- Message encryption/security
- Call recording functionality
- Multiline message formatting preservation

### notifications.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-NOTIF-02, TC-NOTIF-03 | TC-NOTIF-01 | TC-NOTIF-01 | - | TC-NOTIF-04 | - | - | - |
| Notification List | TC-NOTIF-05 to TC-NOTIF-08, TC-NOTIF-10 | - | - | - | - | - | TC-NOTIF-09 | - |
| Filter Tabs | TC-NOTIF-11, TC-NOTIF-12 | - | - | - | - | TC-NOTIF-13, TC-NOTIF-15 | TC-NOTIF-14 | - |
| Mark as Read | TC-NOTIF-16 | - | - | - | - | TC-NOTIF-17 to TC-NOTIF-19 | - | - |
| Notification Navigation | - | - | TC-NOTIF-20 to TC-NOTIF-23 | - | - | - | - | - |
| Friend Requests in Notifications | - | TC-NOTIF-25, TC-NOTIF-26 | - | - | - | TC-NOTIF-24 to TC-NOTIF-26 | - | - |
| Unread Badge | - | - | TC-NOTIF-27, TC-NOTIF-28 | - | - | TC-NOTIF-28 | TC-NOTIF-27 | - |
| Notification Management | - | - | - | - | - | TC-NOTIF-29, TC-NOTIF-30 | TC-NOTIF-31 | TC-NOTIF-32 |

**TODOs:**
- Real-time push notification when app is open
- Batch notifications ("3 people liked your post")
- Notification badge count accuracy
- Notification muting per user/type
- Clearing all notifications action

### pages.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-PAGES-02, TC-PAGES-03 | TC-PAGES-01 | TC-PAGES-01 | - | TC-PAGES-04 | - | - | - |
| Pages List | TC-PAGES-05, TC-PAGES-07 to TC-PAGES-09 | - | - | - | - | - | TC-PAGES-06 | - |
| Create Page | TC-PAGES-10 to TC-PAGES-12, TC-PAGES-14, TC-PAGES-16 | TC-PAGES-19 | - | TC-PAGES-13 | - | TC-PAGES-13, TC-PAGES-15, TC-PAGES-17, TC-PAGES-18 | - | - |
| Page Card Navigation | - | - | TC-PAGES-20, TC-PAGES-21 | - | - | TC-PAGES-20 | - | - |
| Page Detail | TC-PAGES-22 to TC-PAGES-25 | - | - | - | - | TC-PAGES-26 to TC-PAGES-28 | - | - |
| Category Filtering | - | - | - | - | - | TC-PAGES-30 | - | TC-PAGES-29 |

**TODOs:**
- Page name/description length validation
- Page creation with duplicate name
- Page edit workflow and update persistence
- Page deletion confirmation
- Page visibility toggle (public/private)
- Page cover photo upload
- Page follow count increment
- Page search by name

### posts.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Post Card Layout | TC-POSTS-02 to TC-POSTS-06 | - | - | - | - | - | - | - |
| Post Action Buttons | TC-POSTS-07 to TC-POSTS-10 | - | - | - | - | - | - | - |
| Like Interaction | - | - | - | - | - | TC-POSTS-11, TC-POSTS-12 | - | TC-POSTS-13 |
| Comment Interaction | TC-POSTS-14 to TC-POSTS-16 | TC-POSTS-18 | - | - | - | TC-POSTS-17 | - | - |
| Share Interaction | TC-POSTS-19, TC-POSTS-20 | - | - | - | - | TC-POSTS-21 | - | - |
| Bookmark & Save | - | - | - | - | - | TC-POSTS-22, TC-POSTS-23 | - | - |
| Post Options Menu | TC-POSTS-24, TC-POSTS-26 | TC-POSTS-27 | - | - | - | TC-POSTS-25 | - | - |
| Media & Rich Content | TC-POSTS-29, TC-POSTS-31 | - | TC-POSTS-32, TC-POSTS-33 | - | - | TC-POSTS-30 | - | - |
| Text Expansion & URL | TC-POSTS-34, TC-POSTS-35 | - | - | - | - | TC-POSTS-34 | - | - |

**TODOs:**
- Post create (new/compose screen)
- Post edit on own posts
- Post delete with confirmation
- Nested comments (replies)
- @mention notifications
- Image carousel full functionality
- Share to external platforms
- Copy post link to clipboard
- Post report workflow
- Post visibility (public/private/friends-only)
- Link preview in post text
- Comment sort options

### groups.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-GROUPS-02, TC-GROUPS-03, TC-GROUPS-05 | TC-GROUPS-01 | TC-GROUPS-01 | - | TC-GROUPS-04 | - | - | - |
| Tab Switching | TC-GROUPS-06 | - | TC-GROUPS-07, TC-GROUPS-08, TC-GROUPS-10 | - | - | TC-GROUPS-07, TC-GROUPS-08, TC-GROUPS-10 | TC-GROUPS-09 | - |
| Groups List & Cards | TC-GROUPS-11 to TC-GROUPS-16 | - | - | - | - | - | TC-GROUPS-11 | - |
| Discover & Join | TC-GROUPS-17 | TC-GROUPS-19 | - | - | - | TC-GROUPS-19, TC-GROUPS-20 | TC-GROUPS-20 | - |
| Create Group | TC-GROUPS-21 to TC-GROUPS-25 | - | - | TC-GROUPS-26 | - | TC-GROUPS-26 to TC-GROUPS-28 | - | - |
| Search Groups | TC-GROUPS-29 | - | - | - | - | TC-GROUPS-30, TC-GROUPS-31 | - | TC-GROUPS-30 |
| Group Card Navigation | - | - | TC-GROUPS-32 to TC-GROUPS-34 | - | - | - | - | - |
| Empty State | - | - | - | - | - | - | TC-GROUPS-36 | - |
| Group Rules Tab | TC-GROUPS-37 | - | - | - | - | TC-GROUPS-38 | - | - |
| Group Post Pin | - | - | - | - | - | TC-GROUPS-39 | TC-GROUPS-40 | - |
| Group Events | TC-GROUPS-41 | TC-GROUPS-42 | - | - | - | - | - | - |
| Files & Media Tab | TC-GROUPS-43 | - | - | - | - | TC-GROUPS-44 | - | - |
| Member Role Badges | TC-GROUPS-45 | - | - | - | - | - | - | - |
| Notification Settings | TC-GROUPS-46 | - | - | - | - | TC-GROUPS-47 | - | - |

**TODOs:**
- Leave group confirmation dialog
- Group member list display
- Group admin promote/demote
- Group post moderation/deletion by mods
- Member ban/kick functionality
- Group invite link generation/sharing
- Group privacy toggle (public/private)
- Group join request approval (if private)
- Group deletion by admin

---

## Features Module

### ai-studio.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-AI-01 to TC-AI-04 | - | TC-AI-01 | - | TC-AI-01, TC-AI-03 | - | - | - |
| Text Generation | TC-AI-05, TC-AI-06 | TC-AI-35 | - | TC-AI-36 | TC-AI-05, TC-AI-06 | TC-AI-08, TC-AI-10 | TC-AI-09, TC-AI-10 | - |
| Image Generation | TC-AI-11 to TC-AI-13 | TC-AI-37 | - | - | TC-AI-11, TC-AI-12 | TC-AI-14 | TC-AI-14 | - |
| Code Generation & Settings | TC-AI-15 to TC-AI-19 | TC-AI-38 | - | - | TC-AI-15, TC-AI-16 | TC-AI-20 | TC-AI-20 | - |
| Generation History | TC-AI-22, TC-AI-23 | TC-AI-39, TC-AI-40 | - | - | TC-AI-22 | TC-AI-24 | TC-AI-23 | - |
| Prompt Templates | TC-AI-26 | TC-AI-42 | - | - | TC-AI-26 | TC-AI-27 | - | - |
| Download / Export | TC-AI-28 | TC-AI-43 (skip) | - | - | TC-AI-28 | TC-AI-29 | - | - |
| AI Chat Mode | TC-AI-44 | - | TC-AI-30 | - | TC-AI-30 | - | - | - |
| Model Selector | TC-AI-31 | - | - | - | TC-AI-31 | - | - | - |
| Rate Limit / Quota | TC-AI-32 | - | - | - | TC-AI-32 | - | - | - |
| Save to History | TC-AI-33 | TC-AI-41 (skip) | - | - | TC-AI-33 | TC-AI-34 | - | - |
| Error Handling | - | - | - | - | - | - | TC-AI-25 | - |

**TODOs:**
- Actual generation output display validation
- Empty/invalid prompt validation errors
- Image generation and display
- Code output display
- History delete/clear
- History persistence across sessions
- Template loading and parameter substitution
- Downloaded file format and content verification
- Chat message sending/receiving

### games.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-GAMES-01 to TC-GAMES-04 | - | TC-GAMES-01 | - | TC-GAMES-01, TC-GAMES-03 | - | - | - |
| Game Listing & Cards | TC-GAMES-05 to TC-GAMES-09 | - | - | - | TC-GAMES-05 | - | TC-GAMES-05 | - |
| Category Filter Tabs | TC-GAMES-10 | - | - | - | TC-GAMES-10 | TC-GAMES-11, TC-GAMES-12 | TC-GAMES-12 | - |
| Search | TC-GAMES-13 | - | - | - | TC-GAMES-13 | TC-GAMES-14 | TC-GAMES-14 | - |
| Game Detail | TC-GAMES-16 | - | TC-GAMES-15, TC-GAMES-20 | - | TC-GAMES-15, TC-GAMES-18 | TC-GAMES-19 | - | - |
| Featured / Popular | TC-GAMES-21 to TC-GAMES-23 | - | - | - | TC-GAMES-21, TC-GAMES-23 | - | - | - |
| Leaderboard & Ratings | TC-GAMES-24, TC-GAMES-25 | - | - | - | TC-GAMES-24, TC-GAMES-25 | TC-GAMES-27 | - | - |
| Favourites | TC-GAMES-26, TC-GAMES-38, TC-GAMES-39 | TC-GAMES-40 | - | - | TC-GAMES-26 | TC-GAMES-27, TC-GAMES-38, TC-GAMES-39 | TC-GAMES-40 | - |
| Achievements & Badges | TC-GAMES-29, TC-GAMES-30 | - | - | - | TC-GAMES-29 | - | TC-GAMES-30 | - |
| Invite Friend | TC-GAMES-31 | TC-GAMES-42 | - | - | TC-GAMES-31 | TC-GAMES-32, TC-GAMES-42 | - | - |
| Tournament | TC-GAMES-33 | - | - | - | TC-GAMES-33 | - | - | - |
| Rewards & Points | TC-GAMES-34, TC-GAMES-35 | - | - | - | TC-GAMES-34 | - | TC-GAMES-34 | - |
| High Score | TC-GAMES-36, TC-GAMES-37 | - | - | - | TC-GAMES-36 | - | - | - |

**TODOs:**
- Adding/removing favourites persists state
- Favourite state changes button appearance
- Sending invite creates notification/message
- Friend selector populates with user's friends

### mart.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-MART-01 to TC-MART-04 | - | TC-MART-01 | - | TC-MART-01, TC-MART-03 | - | - | - |
| Product Listing | TC-MART-05 to TC-MART-09 | - | - | - | TC-MART-05 | - | TC-MART-05 | - |
| Category Tabs | TC-MART-10 | - | - | - | TC-MART-10 | TC-MART-11 | - | - |
| Search | TC-MART-12 | - | - | - | TC-MART-12 | TC-MART-13 | TC-MART-13 | - |
| Product Detail | TC-MART-15 to TC-MART-17 | - | TC-MART-14 | - | TC-MART-14, TC-MART-15 | - | - | - |
| Product Gallery | TC-MART-18 | - | - | - | TC-MART-18 | - | - | - |
| Cart & Buy | TC-MART-19 to TC-MART-21 | TC-MART-49, TC-MART-50 | - | - | TC-MART-19, TC-MART-20 | TC-MART-22, TC-MART-49, TC-MART-50 | TC-MART-22 | - |
| Checkout | TC-MART-41 to TC-MART-45 | TC-MART-52 (skip) | TC-MART-23 | TC-MART-51 | TC-MART-41 | - | - | - |
| Seller Profile | TC-MART-24 | - | TC-MART-24 | - | TC-MART-24 | - | - | - |
| Related Products | TC-MART-25 | - | - | - | TC-MART-25 | - | - | - |
| Filters & Sort | TC-MART-26, TC-MART-27 | - | - | - | TC-MART-26, TC-MART-27 | TC-MART-28 | - | - |
| Wishlist | TC-MART-29 | TC-MART-53 | - | - | TC-MART-29 | TC-MART-30 | TC-MART-53 | - |
| Product Reviews | TC-MART-31 to TC-MART-34 | TC-MART-54, TC-MART-55 | - | - | TC-MART-31 | TC-MART-54, TC-MART-55 | - | - |
| Order History | TC-MART-36 to TC-MART-38 | - | TC-MART-39 | - | TC-MART-36 | TC-MART-40 | TC-MART-37 | - |
| Returns | TC-MART-46 | TC-MART-56 | - | TC-MART-56 | TC-MART-46 | TC-MART-47, TC-MART-48 | - | - |

**TODOs:**
- Cart item removal and quantity adjustments
- Checkout form validation for required fields
- Checkout address validation
- Place order creates order and shows confirmation
- Wishlist persistence across sessions
- Writing/submitting a review
- Rating submission
- Return reason validation and submission

### meetings.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-MEETINGS-01 to TC-MEETINGS-04 | - | TC-MEETINGS-01 | - | TC-MEETINGS-01, TC-MEETINGS-03 | - | - | - |
| Meeting List / Calendar | TC-MEETINGS-05 to TC-MEETINGS-10 | - | - | - | TC-MEETINGS-05 | - | TC-MEETINGS-07 | - |
| Create / Schedule | TC-MEETINGS-11 | TC-MEETINGS-43 | - | TC-MEETINGS-44, TC-MEETINGS-45 | TC-MEETINGS-11 | TC-MEETINGS-12 | - | - |
| Create Form Fields | TC-MEETINGS-13 to TC-MEETINGS-16 | TC-MEETINGS-43 | - | TC-MEETINGS-44, TC-MEETINGS-45 | TC-MEETINGS-13 | - | - | - |
| Create Cancel | - | - | - | - | - | TC-MEETINGS-17 | - | - |
| Join Meeting | TC-MEETINGS-18 | - | TC-MEETINGS-19 | - | TC-MEETINGS-18 | - | TC-MEETINGS-18 | - |
| Copy Link | TC-MEETINGS-20 | TC-MEETINGS-46 | - | - | TC-MEETINGS-20 | TC-MEETINGS-46 | - | - |
| Meeting Detail | TC-MEETINGS-21, TC-MEETINGS-22 | - | TC-MEETINGS-21 | - | TC-MEETINGS-21 | - | - | - |
| Edit / Delete | TC-MEETINGS-23, TC-MEETINGS-24 | TC-MEETINGS-47, TC-MEETINGS-48 | - | - | TC-MEETINGS-23, TC-MEETINGS-24 | TC-MEETINGS-25, TC-MEETINGS-47, TC-MEETINGS-48 | - | - |
| Past Meetings | TC-MEETINGS-26 to TC-MEETINGS-29 | - | - | - | TC-MEETINGS-26 | TC-MEETINGS-27, TC-MEETINGS-28 | TC-MEETINGS-29 | - |
| Recurring Meetings | TC-MEETINGS-33 to TC-MEETINGS-35 | TC-MEETINGS-49 | - | TC-MEETINGS-49 | TC-MEETINGS-33, TC-MEETINGS-34 | TC-MEETINGS-34 | - | - |
| Video Controls | TC-MEETINGS-36 to TC-MEETINGS-40 | - | - | - | TC-MEETINGS-36 | - | - | - |
| Calendar Export | TC-MEETINGS-41 | TC-MEETINGS-50 (skip) | - | - | TC-MEETINGS-41 | TC-MEETINGS-42 | - | - |

**TODOs:**
- Creating a meeting saves it to list
- Validation for missing title / invalid past date
- Adding multiple participants
- Copy link to clipboard verification
- Editing meeting title, date, participants
- Deleting meeting removes from list
- Recurring meeting creation and frequency selector
- .ics file download for calendar export

### settings.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-SETTINGS-02 to TC-SETTINGS-05 | - | TC-SETTINGS-01 | TC-SETTINGS-05 | - | - | - | - |
| Account & Profile | TC-SETTINGS-06 to TC-SETTINGS-10 | TC-SETTINGS-46 | TC-SETTINGS-11 | TC-SETTINGS-47 | TC-SETTINGS-06 | - | - | TC-SETTINGS-46 |
| Password Change | TC-SETTINGS-12, TC-SETTINGS-13 | TC-SETTINGS-48 | - | TC-SETTINGS-49 | - | - | - | TC-SETTINGS-49 |
| Notification Preferences | TC-SETTINGS-14 | TC-SETTINGS-50 | - | - | - | TC-SETTINGS-15, TC-SETTINGS-16, TC-SETTINGS-50 | - | - |
| Privacy Settings | TC-SETTINGS-17 to TC-SETTINGS-20 | TC-SETTINGS-51 | - | - | - | TC-SETTINGS-51 | - | TC-SETTINGS-51 |
| Theme & Appearance | TC-SETTINGS-21 to TC-SETTINGS-23 | TC-SETTINGS-52 | - | - | - | TC-SETTINGS-24, TC-SETTINGS-52 | - | TC-SETTINGS-52 |
| Security & 2FA | TC-SETTINGS-25 to TC-SETTINGS-27 | - | - | - | - | - | - | TC-SETTINGS-53, TC-SETTINGS-54 |
| Logout & Account Deletion | TC-SETTINGS-28, TC-SETTINGS-30 | TC-SETTINGS-59 | TC-SETTINGS-29, TC-SETTINGS-31 | - | - | TC-SETTINGS-31, TC-SETTINGS-59 | - | - |
| Navigation & Unsaved Changes | - | - | TC-SETTINGS-32, TC-SETTINGS-34 | TC-SETTINGS-47 | - | TC-SETTINGS-32, TC-SETTINGS-33 | - | TC-SETTINGS-33, TC-SETTINGS-35 |
| Data & Privacy | TC-SETTINGS-36, TC-SETTINGS-38 | TC-SETTINGS-55 | - | - | - | TC-SETTINGS-37 | - | TC-SETTINGS-56 |
| Sessions & Devices | TC-SETTINGS-39, TC-SETTINGS-40 | TC-SETTINGS-57, TC-SETTINGS-58 | - | - | - | TC-SETTINGS-41, TC-SETTINGS-58 | - | - |
| Account Actions | TC-SETTINGS-42, TC-SETTINGS-44 | TC-SETTINGS-59 | - | - | - | TC-SETTINGS-43, TC-SETTINGS-45, TC-SETTINGS-59 | - | - |

**TODOs:**
- Revoke session actually ends session (requires real multi-session setup)

### studio.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-STUDIO-01, TC-STUDIO-02 | - | TC-STUDIO-01 | TC-STUDIO-04 | - | - | - | - |
| Dashboard Tabs | TC-STUDIO-05, TC-STUDIO-06 | - | TC-STUDIO-07, TC-STUDIO-08 | - | - | TC-STUDIO-07, TC-STUDIO-08 | - | - |
| Empty State | TC-STUDIO-09, TC-STUDIO-10 | - | - | - | - | - | TC-STUDIO-09, TC-STUDIO-10 | - |
| Monetization & Earnings | TC-STUDIO-11, TC-STUDIO-12 | - | - | - | - | TC-STUDIO-16 | - | TC-STUDIO-16 |
| Upload Flow | TC-STUDIO-13, TC-STUDIO-15 | TC-STUDIO-17 | TC-STUDIO-14, TC-STUDIO-15 | TC-STUDIO-17 | - | TC-STUDIO-14 | - | TC-STUDIO-18, TC-STUDIO-19, TC-STUDIO-20 |

**TODOs:**
- TC-STUDIO-18, TC-STUDIO-19, TC-STUDIO-20 are skip stubs (untestable without real file uploads)

### theme.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Toggle Visibility | TC-THEME-01 | - | - | - | - | - | - | TC-THEME-02 |
| Theme Switching | TC-THEME-03, TC-THEME-04 | TC-THEME-16, TC-THEME-17 | - | - | - | TC-THEME-03, TC-THEME-05, TC-THEME-06, TC-THEME-19 | - | TC-THEME-19 |
| Theme Persistence | TC-THEME-07 to TC-THEME-09 | - | TC-THEME-08 | - | - | - | - | - |
| Keyboard Accessibility | - | - | TC-THEME-10 | - | - | TC-THEME-10, TC-THEME-11 | - | - |
| System Preference | TC-THEME-12, TC-THEME-13, TC-THEME-15 | TC-THEME-17 | TC-THEME-13 | - | - | TC-THEME-12 | - | TC-THEME-14, TC-THEME-18 |

**TODOs:**
- TC-THEME-18 is a skip stub (OS dark mode preference untestable without emulation config)

### video.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-VIDEO-01 to TC-VIDEO-03 | - | TC-VIDEO-01 | TC-VIDEO-04 | - | - | - | - |
| Sidebar Navigation | TC-VIDEO-05 to TC-VIDEO-10 | - | TC-VIDEO-08 to TC-VIDEO-10 | - | - | - | - | - |
| Video Feed | TC-VIDEO-11 to TC-VIDEO-14 | - | - | - | - | - | TC-VIDEO-11, TC-VIDEO-15 | - |
| Upload Flow | TC-VIDEO-16 | TC-VIDEO-25 | TC-VIDEO-17 | TC-VIDEO-25 | - | TC-VIDEO-16, TC-VIDEO-17 | - | TC-VIDEO-26 |
| Video Playback | TC-VIDEO-18 to TC-VIDEO-20 | - | TC-VIDEO-18 | - | - | TC-VIDEO-18, TC-VIDEO-27, TC-VIDEO-28, TC-VIDEO-29 | - | TC-VIDEO-27, TC-VIDEO-28, TC-VIDEO-29 |
| Sub-navigation | - | - | TC-VIDEO-21 to TC-VIDEO-24 | - | - | TC-VIDEO-21 to TC-VIDEO-24 | - | - |
| Feed Pagination & Category | - | - | TC-VIDEO-31 | - | - | TC-VIDEO-30, TC-VIDEO-31 | - | TC-VIDEO-30 |

**TODOs:**
- TC-VIDEO-26 is a skip stub (network interruption untestable mid-upload)
- Video seek (scrubbing) not yet tested

### wallet.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-WALLET-01 to TC-WALLET-03 | - | TC-WALLET-01 | TC-WALLET-04 | - | - | - | - |
| Balance Display | TC-WALLET-05 to TC-WALLET-08 | - | - | - | - | - | - | TC-WALLET-46 |
| Transaction History | TC-WALLET-09 to TC-WALLET-13 | - | - | - | - | - | TC-WALLET-10, TC-WALLET-14 | - |
| Transaction Filters | - | - | - | - | - | TC-WALLET-16 to TC-WALLET-18 | - | TC-WALLET-47, TC-WALLET-48 |
| Send Money | TC-WALLET-19 | TC-WALLET-51 | - | TC-WALLET-21 to TC-WALLET-23, TC-WALLET-49, TC-WALLET-50 | - | TC-WALLET-20, TC-WALLET-24, TC-WALLET-51 | - | TC-WALLET-49, TC-WALLET-50 |
| Add Funds / Top Up | TC-WALLET-25 | TC-WALLET-52 | - | TC-WALLET-52 | - | TC-WALLET-26, TC-WALLET-28 | - | TC-WALLET-53 |
| Withdraw | TC-WALLET-29 | TC-WALLET-30 | - | - | - | TC-WALLET-30 | - | - |
| Wallet Settings | TC-WALLET-31, TC-WALLET-32 | - | TC-WALLET-32 | - | - | - | - | - |
| Edge Cases & Accessibility | - | - | - | - | - | TC-WALLET-34 | TC-WALLET-33 | TC-WALLET-35 |
| QR Payment | TC-WALLET-36 to TC-WALLET-39 | TC-WALLET-54 | - | - | - | TC-WALLET-37 to TC-WALLET-39, TC-WALLET-54 | - | TC-WALLET-54 |
| Transaction Detail | - | - | TC-WALLET-40 | - | - | TC-WALLET-40, TC-WALLET-42 | - | TC-WALLET-41 |
| Export Transactions | TC-WALLET-43 | TC-WALLET-55 | - | - | - | TC-WALLET-44, TC-WALLET-45, TC-WALLET-55 | - | TC-WALLET-56 |

**TODOs:**
- Balance updates in real-time on transaction (requires live transaction trigger)
- TC-WALLET-53, TC-WALLET-56 are skip stubs (payment processing and file download untestable)

---

## Platform Module

### biz.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-BIZ-01 to TC-BIZ-03 | - | TC-BIZ-01 | - | TC-BIZ-01 | - | TC-BIZ-04 | - |
| Business Listings | TC-BIZ-05 to TC-BIZ-09 | - | - | - | - | - | - | - |
| Search & Filters | TC-BIZ-10 | - | - | - | - | TC-BIZ-11 to TC-BIZ-13 | - | TC-BIZ-27 |
| Business Detail View | - | TC-BIZ-14, TC-BIZ-15 | TC-BIZ-14, TC-BIZ-18 | - | - | TC-BIZ-17 | TC-BIZ-16 | - |
| CTAs & Follow Actions | TC-BIZ-20, TC-BIZ-26 | - | - | TC-BIZ-23 | TC-BIZ-19, TC-BIZ-20 | TC-BIZ-21, TC-BIZ-25 | TC-BIZ-24 | TC-BIZ-22 |

### business-suite.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-BIZ-SUITE-01 to TC-BIZ-SUITE-04 | - | TC-BIZ-SUITE-01 | - | - | - | TC-BIZ-SUITE-05 | - |
| Dashboard Panels & Analytics | TC-BIZ-SUITE-06 to TC-BIZ-SUITE-10 | - | - | - | - | TC-BIZ-SUITE-24, TC-BIZ-SUITE-25 | - | - |
| Section Navigation | - | - | TC-BIZ-SUITE-11 to TC-BIZ-SUITE-14 | - | - | TC-BIZ-SUITE-12, TC-BIZ-SUITE-14 | - | - |
| CTA Buttons & Actions | TC-BIZ-SUITE-15, TC-BIZ-SUITE-16 | - | TC-BIZ-SUITE-17 | TC-BIZ-SUITE-26 | - | TC-BIZ-SUITE-17 | - | TC-BIZ-SUITE-27 (skip stub) |
| Empty State & Fallback | TC-BIZ-SUITE-19, TC-BIZ-SUITE-22, TC-BIZ-SUITE-23 | TC-BIZ-SUITE-28 | - | - | - | TC-BIZ-SUITE-20 | TC-BIZ-SUITE-21 | - |

### digital-citizen.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-DCITIZEN-01 to TC-DCITIZEN-04 | - | TC-DCITIZEN-01 | - | TC-DCITIZEN-01 | - | TC-DCITIZEN-05 | - |
| Content Sections | TC-DCITIZEN-06 to TC-DCITIZEN-10 | - | - | - | - | - | - | - |
| Interactive Elements | - | - | TC-DCITIZEN-12 | - | - | TC-DCITIZEN-11, TC-DCITIZEN-12, TC-DCITIZEN-14, TC-DCITIZEN-15 | - | - |
| Progress Tracking | - | - | - | - | - | TC-DCITIZEN-24 | TC-DCITIZEN-16, TC-DCITIZEN-17, TC-DCITIZEN-26 | TC-DCITIZEN-25 (skip stub) |
| Resource Links | - | - | - | - | - | - | - | TC-DCITIZEN-19, TC-DCITIZEN-20, TC-DCITIZEN-23, TC-DCITIZEN-27, TC-DCITIZEN-28 |

### happy-corner.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-HAPPY-01 to TC-HAPPY-04 | - | TC-HAPPY-01 | - | TC-HAPPY-01 | - | TC-HAPPY-05 | - |
| Uplifting Content | TC-HAPPY-06 to TC-HAPPY-10 | - | - | - | - | - | - | - |
| Interactive Elements | - | - | - | - | - | TC-HAPPY-11 to TC-HAPPY-14 | - | - |
| Like & React | - | - | - | - | - | TC-HAPPY-15 to TC-HAPPY-17 | - | - |
| Share Functionality | - | - | - | - | - | TC-HAPPY-18 to TC-HAPPY-21 | - | - |

**TODOs:**
- Like count increment after clicking
- Unlike action (toggle state)
- Share link copy to clipboard
- Bookmark/save button state persistence
- Content filter tab switching
- Video autoplay/pause on scroll
- Author/source link navigation

### learn.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-LEARN-01 to TC-LEARN-03 | - | TC-LEARN-01 | - | TC-LEARN-01 | - | TC-LEARN-04 | - |
| Course Listings | TC-LEARN-05 to TC-LEARN-09 | - | - | - | - | - | - | - |
| Search & Category Filters | TC-LEARN-10 | - | - | - | - | TC-LEARN-11 to TC-LEARN-13 | - | - |
| Course Detail & Enroll | - | TC-LEARN-14, TC-LEARN-15 | TC-LEARN-14, TC-LEARN-18 | - | - | TC-LEARN-16, TC-LEARN-17 | - | - |
| Progress & Certificate | - | - | - | - | - | TC-LEARN-22 | TC-LEARN-19 to TC-LEARN-21 | - |

**TODOs:**
- Course enrollment flow (form + submit)
- Lesson list expansion/collapse
- Lesson completion marking
- Certificate download functionality
- Progress bar percentage accuracy
- Resume button navigates to last watched lesson
- Course category filter results
- Lesson video playback and progress tracking

### link.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-LINK-01 to TC-LINK-03 | - | TC-LINK-01 | - | TC-LINK-01 | - | TC-LINK-04 | - |
| Job Listings | TC-LINK-05 to TC-LINK-09 | - | - | - | - | - | - | - |
| Search & Filters | TC-LINK-10 | - | - | - | - | TC-LINK-11 to TC-LINK-14 | - | - |
| Job Detail & Apply | - | TC-LINK-15, TC-LINK-16 | TC-LINK-15 | - | - | TC-LINK-17, TC-LINK-18 | - | - |
| Connections Section | - | - | TC-LINK-19 | - | - | TC-LINK-20 to TC-LINK-22 | - | - |

**TODOs:**
- Job application form validation (required fields, email format)
- Job application submission success/failure states
- Job bookmark/save state persistence
- Connection request acceptance/rejection flow
- Search result sorting (relevance, salary, date posted)
- Apply button behavior (form vs. external link)
- Connection list pagination

### omni-ai.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-OMNIAI-01 to TC-OMNIAI-05 | - | TC-OMNIAI-01 | - | - | - | - | - |
| AI Tool Tiles & Options | TC-OMNIAI-06 to TC-OMNIAI-10 | - | - | - | - | - | - | - |
| Tool Selection | TC-OMNIAI-11 to TC-OMNIAI-14 | - | TC-OMNIAI-11, TC-OMNIAI-12 | - | - | TC-OMNIAI-11, TC-OMNIAI-12 | - | - |
| Input Field & Generate | TC-OMNIAI-15 | - | - | - | - | TC-OMNIAI-16 to TC-OMNIAI-18 | TC-OMNIAI-18 | TC-OMNIAI-25 to TC-OMNIAI-31 |
| Settings, Clear & History | - | - | - | - | - | TC-OMNIAI-19 to TC-OMNIAI-23 | TC-OMNIAI-24 | - |

**TODOs:**
- Generate button submission with actual output validation
- Error states when generation fails
- Invalid/empty prompt handling
- Rate limiting or quota errors
- Output copying functionality
- History clearing and persistence
- Model switching with differing outputs

### omniknow.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-OMNIKNOW-01 to TC-OMNIKNOW-05 | - | TC-OMNIKNOW-01 | - | - | - | - | - |
| Knowledge Base Content | TC-OMNIKNOW-06 to TC-OMNIKNOW-10 | - | - | - | - | - | TC-OMNIKNOW-09 | - |
| Search Functionality | - | - | - | - | - | TC-OMNIKNOW-11 to TC-OMNIKNOW-14 | - | TC-OMNIKNOW-22 to TC-OMNIKNOW-29 |
| Categories & Topics | - | - | - | - | - | TC-OMNIKNOW-15 to TC-OMNIKNOW-17 | - | TC-OMNIKNOW-22 to TC-OMNIKNOW-29 |
| Article Detail & Back Nav | TC-OMNIKNOW-18, TC-OMNIKNOW-19 | - | TC-OMNIKNOW-18, TC-OMNIKNOW-20, TC-OMNIKNOW-21 | - | - | TC-OMNIKNOW-18 | - | TC-OMNIKNOW-22 to TC-OMNIKNOW-29 |

**TODOs:**
- Search with special characters or XSS attempts
- Search with no results handling
- Multiple category selections
- Category filter persistence across navigation
- Article sharing functionality
- Bookmark/favourite articles

### orbit.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-ORBIT-01 to TC-ORBIT-05 | - | TC-ORBIT-01 | - | - | - | - | - |
| Space-Themed Content | TC-ORBIT-06 to TC-ORBIT-10 | - | - | - | - | - | - | - |
| Section Navigation | - | - | TC-ORBIT-11 to TC-ORBIT-14 | - | - | TC-ORBIT-11, TC-ORBIT-12 | - | TC-ORBIT-14 |
| Interactive Elements | TC-ORBIT-15, TC-ORBIT-17 | - | - | - | - | TC-ORBIT-15 to TC-ORBIT-18 | - | TC-ORBIT-23 to TC-ORBIT-28 |
| Join & Subscribe | - | TC-ORBIT-20, TC-ORBIT-21 | - | - | - | TC-ORBIT-19 to TC-ORBIT-21 | TC-ORBIT-22 | TC-ORBIT-21 |

**TODOs:**
- Like button toggling multiple times and count updates
- Share button modal/dialog and functionality
- Comment button with actual comment submission
- Follow/unfollow state persistence across page reloads
- Join notification/confirmation toast

### town-hall.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-TOWNHALL-01 to TC-TOWNHALL-05 | - | TC-TOWNHALL-01 | - | - | - | - | - |
| Discussions & Polls | TC-TOWNHALL-06 to TC-TOWNHALL-10 | - | - | - | - | TC-TOWNHALL-10 | TC-TOWNHALL-09 | - |
| Poll Voting | - | TC-TOWNHALL-12 | - | - | - | TC-TOWNHALL-11 to TC-TOWNHALL-13 | TC-TOWNHALL-14 | TC-TOWNHALL-24 to TC-TOWNHALL-30 |
| Create Post & Topic | TC-TOWNHALL-15 | TC-TOWNHALL-16, TC-TOWNHALL-17 | - | TC-TOWNHALL-24 to TC-TOWNHALL-30 | - | TC-TOWNHALL-16, TC-TOWNHALL-18 | TC-TOWNHALL-16 | TC-TOWNHALL-24 to TC-TOWNHALL-30 |
| Comment Section | - | TC-TOWNHALL-22 | TC-TOWNHALL-20 | - | - | TC-TOWNHALL-20 to TC-TOWNHALL-22 | TC-TOWNHALL-19 | TC-TOWNHALL-23 |

**TODOs:**
- Poll voting twice on same poll
- Creating post with empty title or content
- Creating post with very long content or special characters
- Comment character length validation
- Comment editing and deletion
- Moderator actions (pin, lock, delete)
- Discussion permissions for different user roles

### virtual-world.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-VWORLD-01 to TC-VWORLD-05 | - | TC-VWORLD-01 | - | - | - | - | - |
| 3D World & Landing | TC-VWORLD-06 to TC-VWORLD-08 | - | - | - | - | - | TC-VWORLD-09 | TC-VWORLD-09 |
| Enter & Join Actions | - | - | TC-VWORLD-11 | - | - | TC-VWORLD-10 to TC-VWORLD-12 | - | TC-VWORLD-21 to TC-VWORLD-28 |
| Avatar Customisation | - | TC-VWORLD-21 to TC-VWORLD-28 | - | - | - | TC-VWORLD-13 to TC-VWORLD-15 | - | TC-VWORLD-21 to TC-VWORLD-28 |
| World List | TC-VWORLD-16 to TC-VWORLD-18 | - | TC-VWORLD-20 | - | - | TC-VWORLD-19, TC-VWORLD-20 | - | TC-VWORLD-21 to TC-VWORLD-28 |

**TODOs:**
- Avatar customization saving persistence
- Avatar color/style picker interactions
- Create world form submission and validation
- Enter world triggers actual 3D scene loading
- World list pagination or infinite scroll
- World filtering by type or popularity

---

## Content Module

### birthday.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-BIRTHDAY-01 to TC-BIRTHDAY-03 | - | TC-BIRTHDAY-01 | - | - | - | - | - |
| Birthday Reminders List | TC-BIRTHDAY-04 to TC-BIRTHDAY-07 | - | - | - | - | - | TC-BIRTHDAY-04 | - |
| Send Wish Flow | TC-BIRTHDAY-08, TC-BIRTHDAY-09 | - | - | - | - | TC-BIRTHDAY-09, TC-BIRTHDAY-11 | - | TC-BIRTHDAY-10 |
| Birthday Sections | TC-BIRTHDAY-13 to TC-BIRTHDAY-16 | - | - | - | - | - | TC-BIRTHDAY-13 to TC-BIRTHDAY-15 | - |
| Sorting & Empty State | - | - | - | - | - | - | TC-BIRTHDAY-17 to TC-BIRTHDAY-20 | - |

**TODOs:**
- Edit/update birthday reminder details
- Composer validation (require message before send)
- Special characters or very long names in birthday cards
- Birthday date validation and formatting

### images.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-IMAGES-01 to TC-IMAGES-04 | - | TC-IMAGES-01 | - | - | - | - | - |
| Gallery Grid | TC-IMAGES-05 | - | - | - | - | - | TC-IMAGES-06 | - |
| Upload | TC-IMAGES-08 to TC-IMAGES-10 | TC-IMAGES-08 | - | - | - | - | - | TC-IMAGES-41 to TC-IMAGES-46 |
| Lightbox / Full-Size View | TC-IMAGES-11, TC-IMAGES-12 | - | TC-IMAGES-11 | - | - | TC-IMAGES-13 to TC-IMAGES-15, TC-IMAGES-30 | - | - |
| Delete Image | - | TC-IMAGES-16 to TC-IMAGES-18 | - | - | - | TC-IMAGES-16, TC-IMAGES-17 | - | TC-IMAGES-41 to TC-IMAGES-46 |
| Metadata, Albums, Download & Share | TC-IMAGES-19, TC-IMAGES-20 | TC-IMAGES-21 | - | - | - | TC-IMAGES-22, TC-IMAGES-23 | - | - |
| Multi-Select & Batch | - | TC-IMAGES-26 | - | - | - | TC-IMAGES-24, TC-IMAGES-25, TC-IMAGES-27 | - | TC-IMAGES-28, TC-IMAGES-29 |
| Image Editor | - | - | - | - | - | TC-IMAGES-31, TC-IMAGES-32 | - | - |
| Image Caption Edit | - | TC-IMAGES-34 | - | - | - | TC-IMAGES-33, TC-IMAGES-34 | - | - |
| Geo-Location Tag | TC-IMAGES-35 | - | - | - | - | - | - | - |
| Select All Checkbox | - | - | - | - | - | TC-IMAGES-37 | - | TC-IMAGES-36 |
| Image Sort Options | - | - | - | - | - | TC-IMAGES-38, TC-IMAGES-40 | - | TC-IMAGES-39 |

**TODOs:**
- Upload file with format/size validation
- Delete with actual confirmation submission
- Batch delete confirmation flow
- Album creation and image organization
- Download actual file to system
- Share to external platforms

### live.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load | TC-LIVE-01 to TC-LIVE-03 | - | TC-LIVE-01 | - | - | - | - | TC-LIVE-04, TC-LIVE-05 |
| Streams List | TC-LIVE-06 to TC-LIVE-10 | - | - | - | - | - | TC-LIVE-06, TC-LIVE-11 | - |
| Go Live Button | TC-LIVE-12 | - | TC-LIVE-13 | - | - | TC-LIVE-13 to TC-LIVE-15 | - | - |
| Join & Watch | - | - | TC-LIVE-16 | - | - | TC-LIVE-16 | - | TC-LIVE-17, TC-LIVE-18 |
| Live Player Chat | - | - | - | - | - | TC-LIVE-21 | TC-LIVE-19, TC-LIVE-20 | - |
| Reactions & Controls | - | - | - | - | - | TC-LIVE-22 to TC-LIVE-25 | - | - |
| Leave & Host Controls | - | - | TC-LIVE-27 | - | - | TC-LIVE-26 to TC-LIVE-28 | - | - |
| Emoji Reactions | - | - | - | - | - | TC-LIVE-29, TC-LIVE-30 | - | - |
| Host Controls | - | - | - | - | - | TC-LIVE-31 | - | - |
| Gift / Donation | - | - | - | - | - | TC-LIVE-32 | - | TC-LIVE-36 to TC-LIVE-43 |
| Replay / VOD | - | - | - | - | - | - | TC-LIVE-33 | - |
| Viewer List Panel | - | - | - | - | - | TC-LIVE-34, TC-LIVE-35 | - | - |

**TODOs:**
- Chat input validation and message length
- Chat moderation/filtering
- Gift/donation flow completion (payment)
- Viewer count updates in real time
- Stream quality/bitrate selection
- Host end-stream and archive creation
- Viewer ban/block from chat

### news.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load | TC-NEWS-01 to TC-NEWS-03 | - | TC-NEWS-01 | - | - | - | - | TC-NEWS-04 |
| Feed Rendering | TC-NEWS-05 to TC-NEWS-10 | - | - | - | - | - | - | - |
| Category Tabs | - | - | TC-NEWS-13 to TC-NEWS-15 | - | - | TC-NEWS-12 to TC-NEWS-15 | - | - |
| Article Detail | - | - | TC-NEWS-16 to TC-NEWS-19 | - | - | TC-NEWS-16 | - | - |
| Share & Bookmark | - | - | - | - | - | TC-NEWS-20 to TC-NEWS-22 | - | - |
| Search | - | - | - | - | - | TC-NEWS-23 to TC-NEWS-25 | - | TC-NEWS-38 to TC-NEWS-42 |
| Load More / Infinite Scroll | - | - | - | - | - | TC-NEWS-26 | - | TC-NEWS-27 |
| Breaking News & Empty State | - | - | - | - | - | TC-NEWS-30 | TC-NEWS-28, TC-NEWS-29 | - |
| Save & Bookmark Article | - | TC-NEWS-31 | - | - | - | TC-NEWS-31, TC-NEWS-32 | - | - |
| Personalized Feed | - | - | - | - | - | TC-NEWS-33 | - | - |
| Reading Time | TC-NEWS-34 | - | - | - | - | - | - | - |
| Related Articles | - | - | - | - | - | - | TC-NEWS-35, TC-NEWS-36 | - |
| Manage Sources | - | - | - | - | - | TC-NEWS-37 | - | - |

**TODOs:**
- Search result pagination
- Search with special characters
- Bookmark persistence across sessions
- External source link opens in new tab
- Feed personalization toggle on/off

### weather.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-WEATHER-01 to TC-WEATHER-04 | - | TC-WEATHER-01 | - | - | - | - | - |
| Current Weather Widget | TC-WEATHER-05 to TC-WEATHER-11 | - | - | - | - | - | - | - |
| Forecasts | TC-WEATHER-12 to TC-WEATHER-15 | - | - | - | - | - | - | - |
| Location Controls | - | - | TC-WEATHER-18 | TC-WEATHER-26 | - | TC-WEATHER-16 to TC-WEATHER-19 | - | - |
| Temperature Unit Toggle | - | - | - | - | - | TC-WEATHER-20, TC-WEATHER-21 | - | - |
| Alerts & Metadata | TC-WEATHER-22, TC-WEATHER-23 | - | - | - | - | - | - | TC-WEATHER-24, TC-WEATHER-25 |

**TODOs:**
- Location search with invalid city names
- Geolocation permission handling
- Temperature unit toggle persistence
- Weather alert dismiss/view details
- Multi-location storage and switching
- Hourly forecast scroll/swipe navigation

---

## Explore Module

### explore.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-EXPLORE-01 to TC-EXPLORE-03 | - | TC-EXPLORE-01 | - | - | - | - | TC-EXPLORE-04, TC-EXPLORE-05 |
| Tab Bar | TC-EXPLORE-06 | - | TC-EXPLORE-09, TC-EXPLORE-10 | - | - | TC-EXPLORE-07 to TC-EXPLORE-10 | - | - |
| Feed Rendering | TC-EXPLORE-11 to TC-EXPLORE-16 | - | - | - | - | - | - | - |
| Reel Card Interactions | - | - | - | - | - | TC-EXPLORE-17 to TC-EXPLORE-22 | - | - |
| Reel Detail & Video Player | - | - | TC-EXPLORE-23 | - | - | TC-EXPLORE-24 to TC-EXPLORE-28 | - | - |
| Infinite Scroll | - | - | - | - | - | TC-EXPLORE-29, TC-EXPLORE-30 | - | - |
| Search & Filter | - | - | - | - | - | TC-EXPLORE-31 to TC-EXPLORE-33 | - | TC-EXPLORE-43 |
| Following Tab | - | - | TC-EXPLORE-34 | - | - | TC-EXPLORE-34 | TC-EXPLORE-35 | - |
| Trending Hashtags | TC-EXPLORE-36 | - | - | - | - | TC-EXPLORE-36, TC-EXPLORE-37 | - | - |
| People to Follow | TC-EXPLORE-38 | - | - | - | - | TC-EXPLORE-39 | - | - |
| Local & Nearby Filter | - | - | - | - | - | TC-EXPLORE-40, TC-EXPLORE-41 | - | - |
| Hashtag Navigation | - | - | TC-EXPLORE-42 | - | - | TC-EXPLORE-42 | - | - |

**TODOs:**
- Search with special characters and edge cases
- Comment submission with validation
- Like count update in real time
- Follow button state persistence
- Hashtag feed navigation and results
- Local filter geolocation permission

### shorts.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load | TC-SHORTS-01, TC-SHORTS-02 | - | TC-SHORTS-01 | - | - | - | - | TC-SHORTS-03, TC-SHORTS-04 |
| Vertical Video Player | TC-SHORTS-05 to TC-SHORTS-07, TC-SHORTS-09, TC-SHORTS-10 | - | - | - | - | TC-SHORTS-08, TC-SHORTS-11 | - | - |
| Creator Info | TC-SHORTS-12 to TC-SHORTS-14 | - | TC-SHORTS-13 | - | - | TC-SHORTS-15, TC-SHORTS-16 | - | - |
| Interactions | - | - | - | - | - | TC-SHORTS-17 to TC-SHORTS-22 | - | - |
| Scroll Navigation | - | - | TC-SHORTS-23, TC-SHORTS-24, TC-SHORTS-26 | - | - | TC-SHORTS-23, TC-SHORTS-24 | - | TC-SHORTS-25 |
| Access via Explore Tab | - | - | TC-SHORTS-27, TC-SHORTS-28 | - | - | TC-SHORTS-27 | - | - |
| Video Loop Behaviour | - | - | - | - | - | - | TC-SHORTS-29, TC-SHORTS-30 | - |
| Speed Control | - | - | - | - | - | TC-SHORTS-31, TC-SHORTS-32 | - | TC-SHORTS-38 |
| Captions & Subtitles | - | - | - | - | - | TC-SHORTS-33, TC-SHORTS-34 | - | - |
| Download Short | - | - | - | - | - | TC-SHORTS-35 | - | TC-SHORTS-39 |
| Duet & Stitch | - | - | TC-SHORTS-37 | - | - | TC-SHORTS-36, TC-SHORTS-37 | - | - |

**TODOs:**
- Speed control with actual playback rate changes
- Download button and file save verification
- Comment input and submission
- Like count real-time updates
- Follow state persistence after interaction
- Duet/stitch creation flow completion
- Autoplay behavior on page load

---

## Profile Module

### profile.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Profile Header | TC-PROFILE-02 to TC-PROFILE-06 | - | TC-PROFILE-01 | - | - | - | - | - |
| Profile Stats | TC-PROFILE-07 to TC-PROFILE-09 | - | - | - | - | TC-PROFILE-10, TC-PROFILE-11 | - | - |
| Profile Tabs | TC-PROFILE-12, TC-PROFILE-13 | - | TC-PROFILE-14 to TC-PROFILE-16 | - | - | TC-PROFILE-17 | - | - |
| Posts Tab | TC-PROFILE-18 | TC-PROFILE-19, TC-PROFILE-20 | - | - | - | TC-PROFILE-21 | - | - |
| Edit Profile | TC-PROFILE-22 | TC-PROFILE-50 | - | - | - | TC-PROFILE-23 to TC-PROFILE-26 | - | TC-PROFILE-27, TC-PROFILE-28 |
| Other User Profile | TC-PROFILE-29 | - | TC-PROFILE-31, TC-PROFILE-32 | - | TC-PROFILE-30 | TC-PROFILE-30 | - | TC-PROFILE-34, TC-PROFILE-35 |
| Block & Report | - | - | - | - | - | TC-PROFILE-36, TC-PROFILE-37, TC-PROFILE-39, TC-PROFILE-40 | TC-PROFILE-38 | - |
| Profile Sharing | TC-PROFILE-41 | - | TC-PROFILE-43 | - | - | TC-PROFILE-42 | - | - |
| Content Tabs Extended | TC-PROFILE-44 to TC-PROFILE-47 | - | - | - | - | - | - | - |
| Privacy from Profile | TC-PROFILE-48 | - | TC-PROFILE-49 | - | - | - | - | - |

**TODOs:**
- Edit profile form: actual save/update flow
- Validate form errors when saving with invalid data
- Edit form with required field missing (name, email)

### reputation.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-REP-02, TC-REP-03 | - | TC-REP-01 | - | - | - | - | - |
| Score & Level Display | TC-REP-04 to TC-REP-06 | - | - | - | - | - | - | - |
| Badges Section | TC-REP-07 to TC-REP-10 | - | - | - | - | TC-REP-11 | - | - |
| How to Earn Points | TC-REP-12, TC-REP-13 | - | - | - | - | - | - | - |
| Points History | TC-REP-14, TC-REP-15 | - | - | - | - | - | - | - |
| Leaderboard | TC-REP-16 to TC-REP-20 | - | - | - | - | - | - | - |
| Share Score | TC-REP-21 | - | - | - | - | TC-REP-22 | - | - |

**TODOs:**
- Navigate to badge detail page and verify full description
- Click leaderboard user entry to navigate to their profile
- Share score to social platform and verify completion
- Badge unlock animations/notifications when earned
- Points history pagination

---

## Channel Module

### my-channel.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-CHANNEL-02, TC-CHANNEL-03 | - | TC-CHANNEL-01 | - | - | - | - | - |
| Channel Branding | TC-CHANNEL-04 to TC-CHANNEL-07 | - | - | - | - | - | - | - |
| Video Content Grid | TC-CHANNEL-08 to TC-CHANNEL-11 | - | - | - | - | - | - | - |
| Upload Video | TC-CHANNEL-12 | TC-CHANNEL-41 | - | - | - | TC-CHANNEL-13, TC-CHANNEL-14 | - | - |
| Video Detail | - | - | TC-CHANNEL-15 to TC-CHANNEL-17 | - | - | TC-CHANNEL-18 | - | - |
| Channel Tabs | TC-CHANNEL-19 | - | TC-CHANNEL-20, TC-CHANNEL-21 | - | - | TC-CHANNEL-22 | - | - |
| Edit Channel | TC-CHANNEL-23 | TC-CHANNEL-24, TC-CHANNEL-25 | - | - | - | - | - | - |
| Sort & Search Controls | TC-CHANNEL-26 to TC-CHANNEL-28 | - | - | - | - | - | - | - |
| Analytics | TC-CHANNEL-29 to TC-CHANNEL-31 | - | - | - | - | - | - | - |
| Playlists | TC-CHANNEL-32 to TC-CHANNEL-34 | TC-CHANNEL-42 | - | - | - | TC-CHANNEL-35 | - | - |
| Community Posts | TC-CHANNEL-36 to TC-CHANNEL-38 | TC-CHANNEL-43 | - | - | - | - | - | - |
| Monetization | TC-CHANNEL-39, TC-CHANNEL-40 | - | - | - | - | - | - | - |

**TODOs:**
- Full video upload: file, title, description, publish
- Playlist create/edit/delete lifecycle
- Create community post and verify in list
- Monetization eligibility status
- Video permission/visibility settings (private/public/unlisted)
- Video title and description length limits

### subscriptions.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load & Layout | TC-SUBS-02, TC-SUBS-03 | - | TC-SUBS-01 | - | - | - | - | - |
| Subscriptions List | TC-SUBS-04 to TC-SUBS-07 | - | - | - | - | - | - | - |
| Empty State | - | - | - | - | - | - | TC-SUBS-08 | - |
| Unsubscribe Flow | - | TC-SUBS-09, TC-SUBS-10 | - | - | - | - | - | - |
| Notification Bell | TC-SUBS-11 | - | - | - | - | TC-SUBS-12, TC-SUBS-13 | - | - |
| Feed & Sort Controls | TC-SUBS-14 to TC-SUBS-16 | - | - | - | - | - | - | - |
| Search & Discover | - | - | - | - | - | TC-SUBS-17 to TC-SUBS-19 | - | TC-SUBS-20 |

**TODOs:**
- Unsubscribe confirmation dialog: cancel and confirm
- Notification preference change cycling (All → None → Personalized)
- Feed sorting: verify items reorder
- Search: partial name matching, special characters, case insensitivity
- Bulk unsubscribe: select multiple and unsubscribe together
- Notification state persistence after page reload

---

## Auth Module

### login.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Authentication Form | - | - | TC-AUTH-08 | TC-AUTH-03 to TC-AUTH-05 | - | TC-AUTH-06, TC-AUTH-07 | - | - |
| Auth Required | - | - | TC-AUTH-01 | - | TC-AUTH-01, TC-AUTH-02 | - | - | - |
| Session Tests | - | - | - | - | TC-AUTH-09, TC-AUTH-10 | - | - | - |
| Forgot Password | TC-AUTH-11 | - | TC-AUTH-15 | - | - | - | TC-AUTH-12 to TC-AUTH-14 | - |
| Social Login | TC-AUTH-16, TC-AUTH-17 | - | - | - | - | TC-AUTH-18 | - | - |
| Sign Up | TC-AUTH-19 | - | TC-AUTH-20 | TC-AUTH-21 to TC-AUTH-23 | - | TC-AUTH-24 | TC-AUTH-25 | - |
| Security | - | - | - | - | - | TC-AUTH-27, TC-AUTH-28 | TC-AUTH-26 | - |

**TODOs:**
- Password reset: complete reset flow with new password validation
- Full signup flow to account creation
- Account lockout after N failed attempts
- Session timeout: auto-logout after inactivity
- Remember me: persistence across browser restart
- Email verification for unverified account

---

## Navigation Module

### cross-module.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Direct Deep Links | TC-NAV-001 | - | TC-NAV-001 | - | - | - | - | - |
| Browser Back/Forward | - | - | TC-NAV-002 | - | - | TC-NAV-002 | - | - |
| Active Nav Highlight | - | - | TC-NAV-003 | - | - | - | TC-NAV-003 | - |
| Cross-Module Actions | - | - | TC-NAV-004 | - | - | TC-NAV-004 | - | - |

**TODOs:**
- Navigation with URL parameters preserved
- Deep links to nested routes
- Scroll position restoration on back/forward
- Navigation with unsaved form changes (prompt before leaving)
- All 34 module URLs for direct deep-link access
- Keyboard navigation: Tab through nav, trigger with Enter/Space
- Mobile nav: hamburger menu open/close and navigation

---

## Security Module

### security.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Input Sanitisation | - | - | - | - | - | TC-SEC-001 to TC-SEC-005 | - | TC-SEC-001 to TC-SEC-005 |
| Auth Protection | - | - | TC-SEC-006 to TC-SEC-009 | - | TC-SEC-006 to TC-SEC-009 | - | - | - |
| Content Security | - | - | - | - | - | - | - | TC-SEC-010 to TC-SEC-012 |
| Session Security | - | - | TC-SEC-014 | - | TC-SEC-013 to TC-SEC-015 | - | - | - |

**TODOs:**
- CSRF token validation
- Rate limiting on auth endpoints
- API authentication headers
- Password reset XSS vulnerability
- Database injection in search/filter inputs

---

## Accessibility Module

### a11y.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Landmarks | TC-A11Y-001-01 to TC-A11Y-001-05 | - | - | - | - | - | - | - |
| Focus Management | - | - | - | - | - | TC-A11Y-002-01 to TC-A11Y-002-05 | - | - |
| ARIA Labels | TC-A11Y-003-01 to TC-A11Y-003-05 | - | - | - | - | - | - | - |
| Keyboard Navigation | - | - | - | - | - | TC-A11Y-004-01 to TC-A11Y-004-05 | - | - |
| Screen Reader Hints | - | - | - | - | - | - | TC-A11Y-005-01 to TC-A11Y-005-04 | - |

**TODOs:**
- Color contrast ratios
- Screen reader announcements for async updates
- Form field error announcements
- ARIA descriptions on complex widgets
- Language attribute on page
- Nested landmark structure validation

---

## Performance Module

### performance.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Page Load Times | TC-PERF-001 to TC-PERF-004 | - | - | - | - | - | - | - |
| Resource Efficiency | - | - | - | - | - | - | - | TC-PERF-005 to TC-PERF-007 |
| Layout Stability | - | - | - | - | - | - | - | TC-PERF-008 to TC-PERF-010 |

**TODOs:**
- First Contentful Paint (FCP) timing
- Largest Contentful Paint (LCP) timing
- Bundle size / code splitting
- Memory leaks on page reload
- API response time degradation
- Image optimization (WebP, srcset)

---

## Responsive Module

### mobile.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| Mobile Layout | TC-MOBILE-001 to TC-MOBILE-005 | - | - | - | - | - | - | - |
| Mobile Navigation | - | - | TC-MOBILE-006 to TC-MOBILE-009 | - | - | - | - | - |
| Mobile Feed | TC-MOBILE-010 to TC-MOBILE-013 | - | - | - | - | - | - | - |
| Mobile Modals | TC-MOBILE-014 to TC-MOBILE-017 | - | - | - | - | TC-MOBILE-015, TC-MOBILE-016 | - | - |
| Mobile Messages | TC-MOBILE-018 to TC-MOBILE-020 | - | TC-MOBILE-019 | - | - | TC-MOBILE-020 | - | - |

**TODOs:**
- Horizontal scroll prevention on all pages
- Touch target sizes (44px minimum)
- Landscape orientation support
- Bottom sheet behavior on mobile
- Text input zoom prevention (font-size >= 16px)
- Double-tap zoom disable compliance

---

## Error States Module

### error-states.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| 404 Page | TC-ERR-001-01 to TC-ERR-001-04 | - | TC-ERR-001-02 | - | - | - | - | TC-ERR-001 |
| App Error Boundaries | TC-ERR-002-01 to TC-ERR-002-04 | - | - | - | - | - | - | TC-ERR-002 |
| Form Validation Errors | - | - | - | TC-ERR-003-01 to TC-ERR-003-04 | - | - | - | - |
| Network Resilience | TC-ERR-004-01 | - | - | - | - | - | TC-ERR-004-02, TC-ERR-004-03 | - |

**TODOs:**
- 500/502/503 error pages
- Permission denied (403) page
- Timeout error handling
- Form submission network timeout
- Error message accessibility
- Graceful degradation when JS fails to load

---

## Smoke Module

### smoke.spec.js

| Section | Render | CRUD | Nav | Validation | Auth | Interactive | States | Edge |
|---------|--------|------|-----|-----------|------|-------------|--------|------|
| All 34 Modules (Smoke) | TC-SMOKE-01 to TC-SMOKE-34 | - | TC-SMOKE-01 to TC-SMOKE-34 | - | TC-SMOKE-01 to TC-SMOKE-34 | - | - | - |

**TODOs:**
- Parallel navigation (rapid module switching)
- Deep link load without prior page visit
- Session timeout during module navigation
- Cached vs. fresh module loads
- Module-specific error states (e.g., empty Explore)
- Sidebar highlight sync with active page

---

## How to Use This Matrix

1. **Finding gaps:** Search for `TODO` to locate untested behaviors.
2. **Marking complete:** Replace `TODO` with the TC ID after writing the test.
3. **Adding a new feature:** Add a row to the relevant section; fill in TC IDs or `TODO`.
4. **Definition of done:** No `TODO` cells remain in the matrix.
5. **Not applicable:** Use `-` only when a category genuinely cannot apply to that section.
