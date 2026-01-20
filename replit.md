# Sundar Ram Portfolio

## Overview
An immersive 3D portfolio website featuring a vintage television centerpiece built with React Three Fiber. The TV serves as the central interactive element, displaying static noise by default, showing hovered text from the page on hover, and playing a "Messi best moments" tribute animation when clicked.

## Architecture

### Frontend Structure
- **React + Vite** - Modern build system with hot module replacement
- **React Three Fiber** - 3D rendering with Three.js integration
- **@react-three/drei** - Helpful utilities for R3F including ScrollControls
- **Tailwind CSS + shadcn/ui** - Styling framework with component library
- **TanStack Query** - Data fetching and caching (prepared for future API integration)

### Key Components
- `client/src/components/Scene3D.tsx` - Main 3D scene with TV model and scrollytelling logic
- `client/src/components/Header.tsx` - Fixed header with Anton font branding
- `client/src/components/LoadingScreen.tsx` - TV static loading animation
- `client/src/components/ProjectOverlay.tsx` - Project info overlay with buttons
- `client/src/components/CaseStudyModal.tsx` - Full-screen case study image viewer
- `client/src/pages/Home.tsx` - Main page orchestrating all components
- `client/src/lib/projects.ts` - Project data with Figma links and case study images
- `client/src/hooks/useAudio.ts` - Web Audio API hook for static noise

### Scrollytelling Phases
1. **Landing Phase (0-15% scroll)** - TV in center with static noise, hover/click interactions enabled
2. **Transition Phase (15-20% scroll)** - Camera shift and TV repositioning
3. **Gallery Phase (20-100% scroll)** - Project slides displayed on TV with overlay info

### Projects Data
4 portfolio projects stored in `client/src/lib/projects.ts`:
- Current Mobile Payment (FinTech)
- Eventify (Event Management)
- Space Jump (Gaming)
- Ticking Movies (Entertainment)

Each project has: title, description, Figma prototype URL, accent color, and case study image path.

## Recent Changes
- Implemented scrollytelling with drei ScrollControls
- Added project gallery with dynamic TV content
- Created ProjectOverlay with prototype links and case study buttons
- Added CaseStudyModal for full-screen image viewing
- Fixed hover text and video playback in landing phase
- Added "Hire Me" final slide

## User Preferences
- Anton font for branding
- Dark, cinematic aesthetic with vintage TV vibes
- Photorealistic materials using MeshPhysicalMaterial
- Messi tribute as Easter egg interaction

## Running the Application
```bash
npm run dev
```
Starts Express server and Vite dev server on port 5000.
