# Design Guidelines: Dori AI

## Brand Identity
**Purpose**: A digital companion for seniors (70+) that feels like a "patient, technically brilliant grandchild" bridging traditional life and modern technology.

**Aesthetic Direction**: Soft, tactile, and reassuring. Think "friendly tech" with physical affordance cues that make digital interactions feel tangible and safe.

**Memorable Element**: The Global Mic floating action button - always present, always ready to help through voice.

---

## Navigation Architecture

**Root Navigation**: Single-screen dashboard with no tab bar
- Dashboard serves as the hub for all features
- Voice-first interaction via floating mic button
- All tools accessible from one place

**Screen List**:
1. Dashboard (Home)
2. Grandchild Mode (Live Screen Share)
3. Decision Navigator (Goal breakdown)
4. Letter Helper (Document scanner)
5. Mirror World (Practice environment)
6. Settings (Accessibility & preferences)

---

## Screen-by-Screen Specifications

### Dashboard
- **Header**: Custom, transparent with Settings icon (top-right)
- **Layout**: 
  - Primary Action Carousel (horizontal snap scroll) - top 3 high-importance tools
  - Secondary Tool Grid (2-column grid) - utility tools below
  - Floating Action Button (Global Mic) - bottom-right corner
- **Safe Area**: Top: headerHeight + 32px, Bottom: 92px (for floating mic)
- **Empty State**: N/A (always shows tools)

### Grandchild Mode
- **Header**: Custom with "End Session" button (top-right), title centered
- **Layout**: Fullscreen camera/screen preview with voice visualization overlay
- **Floating Elements**: Mic toggle button (center-bottom), visual waveform indicator
- **Safe Area**: All insets + 24px

### Decision Navigator
- **Header**: Back button (left), title, info icon (right)
- **Layout**: Scrollable vertical list of step cards
- **Components**: Progress indicator at top, expandable step cards with "Dori's Advice" and "Practice in Sandbox" buttons
- **Safe Area**: Top: headerHeight + 24px, Bottom: 24px

### Letter Helper
- **Header**: Back button (left), title
- **Layout**: 
  - Camera/upload input area at top
  - Result cards below (What is it?, Urgency Meter, Summary, Action Checklist)
- **Form**: Submit/Cancel buttons at bottom of screen (not in header)
- **Safe Area**: Top: headerHeight + 24px, Bottom: 24px

### Mirror World
- **Header**: Custom with "Exit Practice" (top-right)
- **Layout**: Fullscreen simulated interface with floating helper tooltips
- **Safe Area**: Custom per simulated interface

### Settings
- **Header**: Back button (left), title
- **Layout**: Scrollable form with grouped sections
- **Components**: Toggle switches, font size slider, language selector, high contrast mode toggle
- **Safe Area**: Top: headerHeight + 24px, Bottom: 24px

---

## Color Palette

### Dori Theme (Default - Purple/Knowledge)
**Primary**: #6B2D8B (Deep purple - wisdom and knowledge)
**Secondary**: #E040FB (Magenta sparkles for accents)
**Background Root**: #F5F0FA (Soft lavender)
**Surface**: #FFFFFF (Cards and raised elements)
**Text Primary**: #2D1B4E (Deep purple-black)
**Text Secondary**: #5C4A7A (Muted purple)
**Border**: #D4C4E8 (Soft purple border)
**Success**: #52C41A
**Warning**: #FFB74D (Amber - not red for seniors)
**Danger**: #FF7043 (Soft coral - easier on eyes than red)
**High Contrast Mode**: #FFFF00 on #000000

### Classic Theme (Alternative - Blue/Calm)
**Primary**: #5B9BD5 (Calm, trustworthy blue)
**Secondary**: #F4B942 (Warm, friendly yellow for accents)
**Background**: #F8F9FA (Soft off-white)
**Surface**: #FFFFFF (Cards and raised elements)
**Text Primary**: #1A1A1A (High contrast black)
**Text Secondary**: #666666

### Theme Switching
Users can switch between themes in Settings > Theme section

---

## Typography

**Fonts**: 
- Hebrew: Varela Round
- English: Inter

**Type Scale** (minimum 20px base):
- Heading 1: 32px/Bold
- Heading 2: 28px/Bold
- Heading 3: 24px/SemiBold
- Body: 20px/Regular
- Caption: 18px/Regular
- Button: 22px/SemiBold

---

## Visual Design

**Liquid Glass UI (iOS 26 Style)**:
- Frosted glass effect with subtle blur and translucency
- Components have soft inner glow and subtle backdrop blur
- Iridescent/rainbow edge highlights on interactive elements
- Light refraction effects that respond to content behind
- Rounded corners: 20px for cards, 16px for buttons
- Subtle spring animations reminiscent of Dynamic Island

**Glass Card Components**:
- Background: rgba(255, 255, 255, 0.7) with backdrop blur
- Border: 1px solid rgba(255, 255, 255, 0.5)
- Subtle shadow: offset (0, 8), opacity 0.1, radius 24px
- Press state: slight scale down (0.98) with spring animation

**Floating Mic Button**:
- Size: 72x72px
- Frosted glass effect with inner glow
- Gradient overlay: Primary to Secondary colors at 30% opacity
- Pulse animation when listening (scale + glow)
- Haptic feedback on press

**Icons**: Feather icons from @expo/vector-icons, 28px minimum size

**RTL Support**: All layouts mirror for Hebrew, carousel scrolls right-to-left

---

## Assets to Generate

1. **icon.png** - App icon featuring a friendly speech bubble or companion motif
2. **splash-icon.png** - Simplified version of app icon for launch screen
3. **mic-illustration.png** - Friendly illustration for Global Mic onboarding, USED: First launch tutorial
4. **empty-camera.png** - Camera placeholder for Letter Helper, USED: Letter Helper empty state
5. **practice-success.png** - Celebration visual, USED: Mirror World completion screen
6. **dori-avatar.png** - Friendly AI companion avatar, USED: Throughout app for AI responses
7. **high-five.png** - Encouraging gesture, USED: Decision Navigator step completion
8. **onboarding-welcome.png** - Warm welcome illustration, USED: App first launch
9. **safety-shield.png** - Privacy indicator, USED: Settings privacy section

**Asset Style**: Simple, warm, hand-drawn feel with rounded shapes. Use Primary and Secondary colors. Avoid complexity - clarity over detail.