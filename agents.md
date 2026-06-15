# Resource Sharing App - AI Agent Guidelines

## 1. Project Overview & Tech Stack
* **Framework:** Expo (Managed Workflow, SDK 51+).
* **Language:** JavaScript / React Native.
* **Navigation:** `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`. (Do not use Expo Router file-based routing; stick to standard React Navigation).
* **Backend:** Supabase (PostgreSQL, Auth, and Storage).
* **Target Platforms:** iOS and Android.

## 2. Architecture: Feature-Sliced Design
Code must be placed in the appropriate domain folder inside `src/`. Never dump components into a single global folder.

`src/`
├── `assets/`          # Local static files and Lottie animations
├── `components/`      # Global UI only (Buttons, Inputs, Modals)
├── `config/`          # theme.js, supabaseClient.js
├── `features/`        # Domain-specific logic
│   ├── `auth/`              # Login/Signup/Profile
│   ├── `university/`        # BSIT Semesters, courses, resources
│   ├── `intermediate/`      # FSc, ICS
│   ├── `matric/`            # 9th/10th grade
│   └── `community/`         # User contribution forms
├── `navigation/`      # Root tabs and stack navigators
└── `utils/`           # Helper functions

## 3. Coding Standards for Agent
* **No Placeholders:** Always provide realistic academic mock data (e.g., "Calculus Early Transcendentals", "Semester 4") instead of generic "Item 1".
* **Component Structure:** Write functional components using modern React Hooks. Use `StyleSheet.create` at the bottom of the file.
* **Imports:** Group logically: React first, React Native/Expo second, Third-party packages third, internal relative imports last.
* **Icons:** Use `@expo/vector-icons` exclusively.

## 4. Hardware & System Context
* The developer is building on Arch Linux and testing on an Android device via USB and an iPhone via Expo Go over Wi-Fi. 
* Avoid any native modules that require "ejecting" or running `npx expo prebuild` unless absolutely critical. Stick to Expo-compatible packages (`expo-file-system`, `expo-document-picker`).