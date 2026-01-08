# Design Guidelines: Interactive 3D Portfolio Website

## Design Approach
**Custom 3D Interactive Experience** - This project follows a highly specific, immersive design vision centered around React Three Fiber and vintage television aesthetics.

## Typography

### Primary Brand Font
- **Font Family:** Google Fonts 'Anton' or 'Archivo Black'
- **Weight:** 900 (maximum boldness)
- **Usage:** Name "SUNDAR RAM" in header
- **Color:** White
- **Style:** Heavy, bold sans-serif matching reference "BUILDING/CAPPEN" aesthetic

### Hero Text
- **Greeting:** Large, centered white text
- **Looping Roles:** Clear, readable font for typewriter/cycling animation

## Layout & Structure

### Fixed Header (Sticky)
- **Left:** "SUNDAR RAM" in heavy bold font
- **Center:** Navigation links: "Works", "About Me", "3D Room"
- **Right:** "Contact / Recruit Me" button/link

### Hero Section
Floating text positioned in 3D space above the vintage TV:
- "Hello!! I am Sundar Ram" (large, centered, white)
- Looping animation cycling through:
  - "I'm a UI UX designer"
  - "I'm a Product designer"
  - "I'm a Website designer"

### Audio Control
- **Position:** Bottom right corner
- **Component:** UI toggle switch for mute/unmute functionality

## 3D Environment (React Three Fiber)

### Scene Setup
- **Setting:** Dark, atmospheric "space room" - vast feeling
- **Camera:** Subtle gyroscope/parallax effect responding to mouse movement (or device tilt on mobile)
- **Lighting:** Atmospheric to enhance depth

### Central Object
- **Model:** Vintage television set with rabbit-ear antennas
- **Position:** Floor placement, bottom center of 3D room
- **Screen States:**
  - Default: Animated static noise
  - Hover State: Displays hovered webpage text
  - Click State: Plays "Messi best moments" video tribute

## Loading Experience (Phase 1)

### Full-Screen Loader
- **Background:** Animated vintage TV "no signal" static (black and white grain)
- **Center Text:** "SEARCHING SIGNAL"
- **Counter:** Counts linearly from 1 to 100
- **Transition:** Glitch effect followed by smooth fade revealing main page

## Interactive Elements

### Custom Cursor
- **Design:** Glassy, liquid-like transparent circle
- **Effect:** Slight refractive distortion (magnification/warp of underlying text)
- **Trail:** "Speed of light" multi-colored trail following movement
- **Completely replaces default browser cursor**

### TV Interaction Logic
1. **Hover on Any Text → TV Screen Updates:** When cursor hovers over header links, hero text, or looping roles, that text appears on the TV screen
2. **Click on TV Object:** Stops static/text, initiates Messi video playback
3. **Audio Toggle:** Controls all sound (static noise + video audio)

## Spacing System
Use Tailwind spacing units: 2, 4, 8, 12, 16 for consistent rhythm

## Animation Strategy

### Critical Animations
- Loading screen static and glitch transition
- Typewriter/cycling text for looping roles
- Gyroscope camera movement (subtle)
- Custom cursor trail effect
- TV screen content transitions

### Performance Note
Heavy use of 3D rendering and custom cursor - optimize for smooth 60fps experience

## Component Structure

### Core Components
1. Loading Screen (full-screen overlay)
2. Fixed Header (navigation)
3. 3D Canvas (R3F scene)
4. Floating Hero Text (3D positioned)
5. Custom Cursor (global overlay)
6. Audio Toggle (bottom right UI)
7. Vintage TV Model (3D object with screen texture/video)

## Images
No hero images required - the 3D environment serves as the immersive visual centerpiece

## Critical Implementation Notes
- State management between DOM and 3D canvas for hover-to-TV interaction
- Audio context management for toggle control
- Mobile gyroscope API integration for tilt effect
- Video texture mapping on TV screen in R3F
- Custom cursor rendering layer above all content