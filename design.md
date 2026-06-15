# UI/UX Design System & Aesthetic Guidelines

## 1. Visual Identity & Theme
The app must feel premium, modern, and content-focused. We are utilizing a strict **Dark Mode** aesthetic inspired by top-tier reading applications.

* **Backgrounds:** Deep, true blacks (`#000000`) for main screens to make content pop. Slightly elevated surfaces (cards, bottom sheets) use dark gray/glass (`#121212` or `#1C1C1E`).
* **Accent Colors:** Use a vibrant primary color (e.g., `#ff6b6b` or crisp white) sparingly for interactive elements, active tabs, and primary buttons. 
* **Text Colors:** Primary text is crisp white (`#FFFFFF` or `#F2F2F2`). Secondary text (authors, stats, subtitles) is a muted slate gray (`#8E8E93` or `#A1A1AA`).

## 2. Typography Rules
* Use system native fonts (`Avenir Next` / `San Francisco` on iOS, `Roboto` on Android).
* **Headers:** Large, bold, and unapologetic. (e.g., "Good Afternoon", 28pt, `fontWeight: '800'`).
* **Subtitles:** Clean and readable. Avoid all-caps unless used for tiny, widely-spaced metadata badges.

## 3. Component Design Rules
Do not use generic, default React Native styling. Every component must adhere to these rules:

* **Cards & Book Covers:** * Aspect ratio should mirror physical books (approx 3:4).
  * Use rounded corners (`borderRadius: 12` to `16`).
  * NO harsh borders in dark mode. Use subtle transparent borders (`rgba(255,255,255,0.1)`) or soft, colored glowing drop-shadows to separate elements from the black background.
* **Detail Screens (The Glassmorphism Look):**
  * When opening a resource, use a faded or blurred background image at the top of the screen to create depth.
  * Use floating "Stats Rows" (e.g., Rating, Pages, Status) enclosed in a semi-transparent pill or card.
* **Navigation:**
  * Hide default React Navigation headers (`headerShown: false`). Build custom headers using `SafeAreaView` and clean typography.
  * The Bottom Tab Bar must blend seamlessly into the dark background, with no harsh top borders.

## 4. Anti-Patterns (What NOT to do)
* Never use pure `#FFFFFF` backgrounds.
* Never use standard blue (`#007AFF`) text links. 
* Never leave lists looking like basic `FlatList` defaults. Add padding, gap spacing, and custom render items.
* Never use generic placeholder gray boxes. Use `expo-linear-gradient` to create skeleton loaders or subtle gradient backgrounds for unloaded images.