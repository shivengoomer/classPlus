# 🖥️ ClassPilot Frontend Interface — Next.js App Router Client

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind-blue?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Animation-Framer%20Motion-purple?style=for-the-badge)](https://www.framer.com/motion/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple?style=for-the-badge)](https://clerk.com/)

This is the web-client portal for **ClassPilot**. Built using Next.js 14, it delivers a highly interactive, fluid, and responsive dashboard experience for educators. The interface connects to our backend API to orchestrate multi-step form creation, handle syllabus uploads, display real-time creation updates via WebSockets, and trigger PDF exports.

---

## 🎨 UI Architecture & Performance Engine

*   **Next.js 14 App Router**: Utilizes modern Server/Client components boundaries to optimize initial page loading and leverage server-side SEO metadata.
*   **Tailwind CSS**: Custom styling following a sleek, modern, glassmorphic palette with dark mode support.
*   **Framer Motion**: Smooth micro-interactions, page-slide entries, list loading transitions, and key step-switching animations.
*   **Zustand Store Engine**: Lightweight, fast, and reactive global states that avoid unnecessary React re-renders.
*   **Clerk Client SDK**: Secure authentication with pre-built login, sign-up, and user profile management pages.

---

## 🧠 State Management: Zustand Stores Catalog

We decouple page components from side-effects by using Zustand stores located in `/src/store`:

| Store File | Global States | Primary Purpose |
| :--- | :--- | :--- |
| `formStore.ts` | Form details, active creation step, blueprints, selected syllabus files. | Backs the multi-step assignment generator wizard. |
| `assignmentStore.ts` | List of assignments, loading state, error states. | Caches and displays the teacher's dashboard assessments grid. |
| `jobStore.ts` | Current processing `jobId`, progress percentage (0-100%), status messages. | Communicates status changes from WebSocket listeners to progress bars. |
| `toastStore.ts` | Queue of active alert objects (success, error, warning). | Dispatches top-center floating toast alerts across the application. |
| `profileStore.ts` | School Name, Affiliation CBSE Code, Branch Location. | Feeds the school credentials to top layouts and PDF creators. |
| `notificationStore.ts`| Unread alert counts, activity list. | Feeds the floating sidebar notification bell drawer. |

---

## 📂 Routes & Directory Catalog

*   `/src/app/home` — **Dashboard**: Main quickstart actions, recent activity logs, and template cards.
*   `/src/app/assignments` — **Assessments**: Grid display of generated exam papers and quizzes, featuring search and delete options.
*   `/src/app/create` — **Assessment Builder**: Multi-step layout selector (Information, Blueprint Table, Syllabus Upload, Review & Queue).
*   `/src/app/status/[jobId]` — **Progress Center**: Renders beautiful dynamic radial loaders synchronized with WebSocket statuses.
*   `/src/app/result/[assignmentId]` — **Interactive Sheet**: Allows previewing final questions, checking answers via a toggle switcher, and downloading the styled PDF.
*   `/src/app/library` — **Asset Vault**: Document manager for reference uploads. Enforces a **10MB upload limit** and flags file size violations with warning toasts.
*   `/src/app/settings` — **Settings Panel**: Forms to configure CBSE school data and profile parameters.
*   `/src/app/toolkit` — **Teacher Toolkit**: Additional curriculum design sub-utilities and blueprint helpers.

---

## 📱 Mobile Responsive Engineering (Fixes & Workarounds)

A key engineering goal for ClassPilot was providing a flawless mobile experience. We implemented custom solutions to address common Next.js/mobile issues:

### 1. The Double Scroll Conflict
*   **Problem**: In mobile browsers (especially iOS Safari), nested scrolls create layout bugs where floating footers block buttons, and pages fail to scroll to the bottom.
*   **Solution**: Modified [AppShell.tsx](file:///Users/shivengoomer/Documents/Shiven/Coding/Internship/ClassPilot/frontend/src/components/layout/AppShell.tsx) to set the root viewport height to `h-screen overflow-hidden`. The page content is placed inside a single scrollable container (`motion.main`) styled with `pb-36` bottom padding. This lets the user scroll past the sticky mobile bottom navigation.

### 2. Slow/Frozen Touch Clicks
*   **Problem**: Navigating steps inside form pages felt sluggish on mobile devices, often ignoring clicks on buttons.
*   **Solution**: Decoupled click actions from generic forms, using standard React touch-friendly click handlers. Removed manual event preventions (`e.preventDefault()`, `e.stopPropagation()`) in routing triggers to let browser clicks bubble up correctly.

### 3. Keyboard Input Shifts
*   **Problem**: Virtual keyboards on mobile resize the screen viewport, shifting buttons out of position and causing layout layouts to break.
*   **Solution**: Implemented smart input handling to blur elements correctly on submission. Used CSS layouts that adapt gracefully to viewport size changes without shifting critical elements.

### 4. Overlapping Toast Alerts
*   **Problem**: Bottom-right toast alerts were covered by the floating mobile bottom nav bar.
*   **Solution**: Positioned notifications at the top-center (`top-20`) on mobile screens, keeping them visible and accessible.

---

## 🛠️ Installation & Setup

### 1. Set Up Environment Variables
Create a `.env.local` file inside the `frontend` folder:
```env
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_pub_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Core Services Connectors
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### 2. Installation & Run
```bash
# Install frontend dependencies
npm install

# Start Next.js hot reload dev server
npm run dev
```
Open `http://localhost:3000` (or `3001`).

### 3. Build & Test Production Bundles
Verify typescript types and compile the output:
```bash
# Runs tsc compiler checks
npx tsc --noEmit

# Compile production bundle
npm run build

# Start production server
npm start
```
The optimized client bundle is compiled in the `.next` directory.
