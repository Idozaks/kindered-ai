# Dori AI

## Overview

Dori AI is an ultra-accessible digital companion mobile application designed for seniors (70+). The app bridges the gap between traditional life and modern technology by providing a "patient, technically brilliant grandchild" experience. Built with Expo/React Native for cross-platform mobile support and an Express backend, the application emphasizes voice-first interaction, large touch targets, and simplified workflows for complex digital tasks.

Key features include:
- **Guest Mode**: Users can explore the app without signing up first - no barriers to entry
- **Simplified Onboarding**: Single welcome screen with clear, large text in Hebrew
- **Ask Kindred**: AI chat assistant that acts as a patient, helpful digital companion for answering questions and guiding users
- **Letter Helper**: Document scanning and plain-language translation
- **Mirror World**: Safe practice environment for learning digital tasks
- **AI Learning Guides**: Educational modules teaching seniors about artificial intelligence (what AI is, how to ask questions, image generation, document reading, staying safe) with step-by-step lessons and trainer notes for caregivers
- **WhatsApp Guides**: Step-by-step tutorials for common WhatsApp tasks (reading messages, sending texts/photos, video calls, privacy settings, group safety)
- **Gmail Guides**: Step-by-step tutorials for common Gmail tasks (reading emails, sending emails, attaching photos, searching, deleting, replying) with contextual images
- **Grandchildren Guides**: 5 tips for staying connected with grandchildren (voice messages, emoji reactions, photo sharing, video calls, family group participation) with pink/family theme
- **Learning Path Quiz**: Adaptive 5-question evaluation that assesses smartphone navigation, WhatsApp usage, and digital safety skills, then uses Gemini AI to recommend a personalized learning path
- **Celebration System**: Confetti and starburst animations with haptic feedback trigger when completing guides or quizzes
- **Global Mic Button**: Voice-first interaction available throughout the app

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: React Navigation with Native Stack (single-screen dashboard architecture, no tab bar for main flow)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Styling**: Custom theme system with light/dark mode support, glassmorphism effects via expo-blur
- **Animations**: React Native Reanimated for fluid micro-interactions and haptic feedback via expo-haptics
- **Internationalization**: i18next with Hebrew (RTL) and English support

### Design System Principles
- **Typography**: Minimum 20px font size, Inter for English, Varela Round for Hebrew
- **Liquid Glass UI**: iOS 26-style frosted glass effects with blur, translucency, and subtle spring animations
- **Visual Style**: GlassCard and GlassButton components with backdrop blur, soft shadows, and press animations
- **Accessibility**: High contrast mode, narrator mode, privacy shield for sensitive content detection

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Schema Location**: `shared/schema.ts` for shared types between client and server
- **Storage**: In-memory storage adapter pattern (can be swapped for database)

### AI Integration Layer
- **Provider**: Google Gemini via Replit AI Integrations
- **Models Used**:
  - `gemini-2.5-flash`: Fast responses for real-time interactions
  - `gemini-2.5-pro`: Complex reasoning for decision navigation
  - `gemini-2.5-flash-image`: Image generation for simulations
- **Batch Processing**: Rate-limit aware batch utilities with exponential backoff
- **Chat Storage**: Conversation persistence with PostgreSQL

### Build Configuration
- **Development**: Separate Expo dev server and Express server
- **Production**: Static Expo web build served by Express
- **Path Aliases**: `@/` maps to `./client`, `@shared/` maps to `./shared`

## External Dependencies

### AI Services
- **Replit AI Integrations**: Gemini API access via `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL` environment variables
- **Google GenAI SDK**: `@google/genai` for AI model interactions

### Payment/Subscription (NOT YET CONFIGURED)
- **Stripe**: User dismissed the Stripe integration. If subscription features are needed in the future, either:
  1. Set up Stripe via Replit integrations, OR
  2. Request `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` as secrets for manual integration

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **Drizzle ORM**: Schema management and migrations in `./migrations`

### Key Expo Modules
- `expo-image-picker`: Document/image capture for Letter Helper
- `expo-haptics`: Tactile feedback on interactions
- `expo-blur`: Glassmorphism effects
- `expo-speech`: Text-to-speech capabilities

### Storage
- `@react-native-async-storage/async-storage`: Client-side persistence for settings and progress