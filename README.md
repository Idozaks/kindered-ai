# Dori AI

**The Ultra-Accessible Digital Companion for Seniors**

Dori AI bridges the gap between traditional life and modern technology, providing seniors (70+) with a "patient, technically brilliant grandchild" experience. Built with a voice-first approach, large touch targets, and simplified workflows for complex digital tasks.

---

## Overview

Dori AI is a mobile companion application designed specifically for seniors who want to embrace technology without feeling overwhelmed. The app features:

- **Voice-First Interaction**: Speak naturally in Hebrew or English
- **Large, Accessible UI**: Minimum 20px fonts, high contrast, and generous touch targets
- **Simplified Digital Tasks**: Complex technology made simple
- **Patient AI Companion**: Never judges, always helpful, explains as many times as needed

---

## Key Features

### Aura Voice Companion
A floating, movable assistant that's always there when you need help:
- Animated pulse orb with visual feedback
- Gemini-powered high-quality Hebrew text-to-speech
- Personalized greetings using proper Hebrew grammar (male/female forms)
- Quick actions: "Talk to me", "Repeat", "Speak slower"

### Ask Kindred
AI chat assistant that acts as a patient, helpful digital companion:
- Answers questions in simple, everyday language
- Guides users through digital tasks step-by-step
- Remembers context and preferences

### Letter Helper
Document scanning and plain-language translation:
- Take a photo of any document (bills, letters, forms)
- AI analyzes and explains in simple terms
- Suggests what actions to take
- Read aloud with high-quality voice

### Learning Guides
Step-by-step tutorials for essential digital skills:
- **WhatsApp Guides**: Reading messages, sending texts/photos, video calls, privacy settings
- **Gmail Guides**: Reading emails, sending emails, attachments, searching, organizing
- **Grandchildren Connection Tips**: Voice messages, emoji reactions, photo sharing, video calls
- **AI Learning Modules**: Understanding AI, asking questions, staying safe online

### Learning Path Quiz
Adaptive assessment that recommends personalized learning:
- 5-question evaluation of digital skills
- Assesses smartphone navigation, WhatsApp usage, digital safety
- AI-powered personalized recommendations

### Accessibility Features
Built-in accessibility throughout:
- High contrast mode
- Adjustable speech rate
- Privacy shield for sensitive content
- RTL (Right-to-Left) support for Hebrew

---

## Technology Stack

### Frontend
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: React Navigation with Native Stack
- **State Management**: TanStack React Query + React hooks
- **Animations**: React Native Reanimated with haptic feedback
- **Internationalization**: i18next with Hebrew (RTL) and English

### Backend
- **Runtime**: Node.js with Express 5
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Google Gemini (flash, pro, and TTS models)

### Design System
- **Typography**: Inter (English), Varela Round (Hebrew)
- **Visual Style**: iOS 26 Liquid Glass UI with frosted effects
- **Components**: GlassCard, GlassButton with backdrop blur

---

## Recent Development Timeline

### January 2026 - Aura v4.0 Complete Overhaul

**Week 4 - UI Simplification**
- Transformed Aura from static dashboard to floating movable icon
- Removed water intake tracking and emergency contacts from main interface
- Added drag-to-reposition functionality
- Clean bottom sheet modal with quick actions

**Week 3 - Voice Quality Enhancement**
- Integrated Gemini TTS for high-quality Hebrew speech
- Added 800ms delay for modal display before speaking
- Graceful fallback to expo-speech if Gemini unavailable
- Improved speech timing and natural pauses

**Week 2 - Personalization & Intelligence**
- Handshake protocol with Hebrew name-based gender prediction
- 200+ name database for automatic gender detection
- Gendered Hebrew grammar throughout the app
- Proactive idle detection (10s screen timeout suggestions)
- 5-second patience rule with gentle check-ins
- Visual answer pinning for frequently asked questions

**Week 1 - Foundation & Safety**
- Emergency SOS with GPS broadcasting via SMS
- Circle contacts integration for emergency notifications
- Full interaction logging (transcripts, intents, sentiment)
- Haptic feedback with verbal confirmations

### December 2025

**Learning Content Expansion**
- Gmail step-by-step guides with contextual images
- Grandchildren connection tips (5 practical guides)
- AI learning modules for digital literacy
- Learning path quiz with AI-powered recommendations

**Celebration System**
- Confetti and starburst animations
- Haptic feedback on achievements
- Progress tracking across guides

### November 2025

**Core Features Launch**
- Guest mode for barrier-free exploration
- Ask Kindred AI chat assistant
- Letter Helper document analysis
- WhatsApp learning guides
- Basic Aura voice companion

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Expo Go app (for mobile testing)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# DATABASE_URL - PostgreSQL connection string
# AI_INTEGRATIONS_GEMINI_API_KEY - Gemini API key

# Push database schema
npm run db:push

# Start development servers
npm run dev
```

### Running the App
- **Web**: Opens automatically at localhost:8081
- **Mobile**: Scan QR code with Expo Go app

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AI_INTEGRATIONS_GEMINI_API_KEY` | Google Gemini API key |
| `AI_INTEGRATIONS_GEMINI_BASE_URL` | Gemini API base URL |

---

## Project Structure

```
dori-ai/
├── client/                 # Expo/React Native frontend
│   ├── components/         # Reusable UI components
│   │   └── aura/          # Aura voice companion components
│   ├── contexts/          # React contexts (Auth, Aura, Theme)
│   ├── screens/           # App screens
│   ├── navigation/        # Navigation configuration
│   └── utils/             # Utility functions
├── server/                # Express backend
│   ├── routes/            # API routes
│   └── storage.ts         # Database operations
├── shared/                # Shared types and schemas
└── migrations/            # Database migrations
```

---

## Contributing

Dori AI is built with love for our senior community. Contributions that improve accessibility, add helpful features, or enhance the user experience are welcome.

---

## License

This project is proprietary software. All rights reserved.

---

## Acknowledgments

- Built with Expo, React Native, and Google Gemini
- Designed with input from seniors and caregivers
- Hebrew language support powered by custom name database
- Voice synthesis using Gemini TTS for natural Hebrew speech

---

*Dori AI - Technology that cares*
