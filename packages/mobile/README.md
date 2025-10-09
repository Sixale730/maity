# Maity Mobile App

React Native mobile application for the Maity mental wellness platform.

## Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── components/
│   └── ui/           # Reusable UI components
├── screens/
│   ├── auth/         # Authentication screens
│   └── main/         # Main app screens
├── navigation/       # Navigation configuration
├── contexts/         # React contexts
├── utils/            # Utility functions
└── theme/            # Theme configuration
```

## Features

- **Authentication**: Login, Register, Password Recovery
- **Dashboard**: Personal metrics and progress tracking
- **Roleplay**: AI-powered practice scenarios
- **Sessions**: Schedule and track coaching sessions
- **Profile**: User settings and preferences

## Shared Logic

This app uses the `@maity/shared` package for:
- Authentication services
- User role management
- Language/translation system
- Supabase client configuration
- TypeScript types

## Environment Setup

Create a `.env` file with:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Building for Production

```bash
# iOS
expo build:ios

# Android
expo build:android
```