# Design Guidelines: Kindred AI

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

**Primary**: #5B9BD5 (Calm, trustworthy blue)
**Secondary**: #F4B942 (Warm, friendly yellow for accents)
**Background**: #F8F9FA (Soft off-white)
**Surface**: #FFFFFF (Cards and raised elements)
**Text Primary**: #1A1A1A (High contrast black)
**Text Secondary**: #666666
**Success**: #52C41A
**Warning**: #F4B942
**Danger**: #FF4D4F
**High Contrast Mode**: #FFFF00 on #000000

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

**Neumorphic-lite Components**:
- All buttons have 3D appearance with 4px bottom border
- Press state: border reduces to 1px, content shifts down 3px
- Subtle inner shadow for depth: shadowOpacity 0.1, shadowRadius 3px
- Rounded corners: 16px for cards, 12px for buttons

**Floating Mic Button**:
- Size: 72x72px
- Shadow: offset (0, 4), opacity 0.2, radius 8px
- Pulse animation when listening
- Haptic feedback on press

**Icons**: Lucide Icons, 28px minimum size

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