# wesnoth-tools-helpers
https://wesnoth-tools-helpers.netlify.app/
Wesnoth Tools Suite
Purpose: A comprehensive toolkit for Battle for Wesnoth campaign developers, designed to streamline content creation, management, and localization processes. All tools operate client-side with offline support.

---

Available Tools
1. Events Manager
 Extract and manage events/messages from scenario files with direct WML editing.

2. Story Mode
 Manage campaign narratives, dialogues, and export to WML story format.

3. Sound Manager
 Organize audio assets with preview, metadata editing, and effect application.

4. GIF Creator
 Create animated GIFs from image sequences with frame delay control.

5. Image Manager
 Browse/organize game images with path copying and basic editing.

6. Image Animation Manager
 Create sprite animations with frame sequencing and special effects.

7. Map Coordinate Tracker
 Place markers on maps and export coordinate data.

8. Unit Comparator
 Analyze unit stats and combat effectiveness from config files.

9. Dictionary Manager
 Manage translation dictionaries for .po files with conflict resolution.

10. PO Manager
Translate .po files directly in-browser with context preservation.

*Upcoming Tools (Development)*:
- Unit Editor
- Scenario Builder
- WML Validator

---

Key Features
- Offline-First: Full functionality without internet (Service Worker caching)
- Client-Side Processing: No server uploads required
- PWA Support: Installable as a desktop/mobile app
- Theme Options: Light/dark mode toggle
- Multi-Language UI: English and French supported
- Tooltip Guidance: Hover explanations for all interface elements

---

Language Support
1. English (en) - Default language
2. French (fr) - Full translation available

*(Note: Additional languages planned for future updates)*

---

Technical Implementation
- Cache Strategy: Cache-first with network fallback
- Precached Assets: 50+ essential files (HTML, CSS, JS, images)
- Install Prompt: "Install App" button for PWA addition
- Storage: Local storage for theme preferences
- Accessibility: Semantic HTML with ARIA labels

This suite provides Wesnoth developers with a centralized, privacy-focused toolkit that eliminates server dependencies while maintaining professional-grade functionality for campaign development.