# Sundar Ram - Interactive 3D Portfolio Website

## Overview

This is an immersive 3D portfolio website built with React, featuring a vintage television aesthetic as the central interactive element. The project creates a dark "space room" environment where users can explore portfolio content through a unique visual experience that includes animated static noise, gyroscope camera effects, and custom cursor interactions with light trails.

The core experience involves a vintage TV model that displays static noise by default, shows hovered text dynamically, and can play video content when clicked. A loading screen with TV static and a "SEARCHING SIGNAL" countdown introduces users to the theme before revealing the main 3D environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React + TypeScript SPA**
- Built with Vite for fast development and optimized production builds
- Uses React Three Fiber (@react-three/fiber) for WebGL 3D rendering within React
- Framer Motion handles 2D animations including the loading screen transitions and UI micro-interactions
- Wouter for lightweight client-side routing

**3D Environment Stack**
- React Three Fiber as the React renderer for Three.js
- @react-three/drei provides helper components (Environment, ContactShadows, ScrollControls)
- @react-three/postprocessing for visual effects
- Custom static noise textures generated via THREE.DataTexture

**Component Structure**
- `Scene3D.tsx` - Main 3D canvas containing the room environment, vintage TV model, scroll-based transitions, and glitch effects
- `WorkSection.tsx` - "Digital Void" scene with neon Tron-style grid floor/ceiling, curved wall of floating monitors, and particle effects
- `Room3D.tsx` - 3D room scene that appears after Works section zoom transition; loads the user's actual Blender model (compressed from 603MB to 19MB GLB with Draco compression and WebP textures) using useGLTF with OrbitControls for interactive viewing
- `LoadingScreen.tsx` - Full-screen static noise with countdown animation
- `CustomCursor.tsx` - Glassy liquid cursor with multi-color light trail effect
- `Header.tsx` - Fixed navigation with brand name in Anton/Archivo Black font
- `AudioToggle.tsx` - Mute/unmute control for static noise and video audio

**Scroll Transition ("Signal Breach")**
- Uses @react-three/drei ScrollControls with 2 pages and damping
- Camera moves along Z-axis as user scrolls, zooming into the TV screen
- At 45% scroll threshold, visibility toggles from TV room to Digital Void (WorkSection)
- Custom GlitchOverlay component creates visual distortion tied to scroll progress
- Glitch intensity increases as camera approaches TV, peaks at transition moment

**Styling Approach**
- Tailwind CSS with custom configuration for the dark theme
- CSS variables for theming (light/dark mode support built into component library)
- Google Fonts: Anton and Archivo Black for bold brand typography, Inter and DM Sans for UI

### Backend Architecture

**Express.js Server**
- Minimal REST API setup with routes registered in `server/routes.ts`
- Serves static files in production from `dist/public`
- Vite dev server integration for development with HMR
- Session support ready via connect-pg-simple (prepared for future auth)

**Storage Layer**
- Abstract `IStorage` interface in `server/storage.ts`
- Currently uses in-memory `MemStorage` implementation
- Schema defined with Drizzle ORM in `shared/schema.ts`
- Database configuration ready for PostgreSQL via `drizzle.config.ts`

### State Management

- React Query (@tanstack/react-query) for server state management
- Local React state with useState/useCallback for UI interactions
- Custom `useAudio` hook manages Web Audio API for static noise generation
- Hover state passed from Header/HeroText components to Scene3D for TV screen updates

### Build System

- Vite for frontend bundling with React plugin
- esbuild for server-side bundling (see `script/build.ts`)
- TypeScript with strict mode, path aliases configured for `@/` and `@shared/`

## External Dependencies

### 3D Rendering
- Three.js and React Three Fiber ecosystem for WebGL rendering
- drei helpers for common 3D patterns (environment lighting, shadows, scroll controls)
- postprocessing for visual effects

### UI Components
- shadcn/ui component library (Radix primitives + Tailwind)
- Full set of accessible components in `client/src/components/ui/`
- Lucide React for icons

### Database (Prepared)
- Drizzle ORM with PostgreSQL dialect
- drizzle-kit for migrations
- Schema includes users table with UUID primary keys
- Requires `DATABASE_URL` environment variable when database is provisioned

### Audio
- Web Audio API (browser native) for generating static noise
- Custom hooks manage AudioContext lifecycle and gain control

### Fonts
- Google Fonts loaded via CDN in `client/index.html`
- Anton, Archivo Black (brand), Inter, DM Sans (UI)

## Startup & Workflow

- The workflow runs `bash start.sh` which builds the production bundle (if needed) and starts the Express production server
- Vite dev server (`npm run dev`) must NOT be used in the workflow — it crashes under memory pressure with Three.js
- The production build is done with `NODE_OPTIONS='--max-old-space-size=1024'`
- The 3D room model (`server/static/room.glb`, 30MB) is symlinked into `dist/static/` at startup
- `server/index.ts` includes a `SIGHUP` handler to prevent the workflow from killing the process
- After any code changes, run `rm -rf dist` then restart the workflow to trigger a fresh build