# Maity Monorepo Structure

This project uses a monorepo architecture to share code between web and mobile applications.

## Packages

### @maity/shared
Shared business logic, utilities, and services used by both web and mobile apps:
- **Services**: Supabase client, authentication
- **Types**: TypeScript type definitions
- **Hooks**: Reusable React hooks (useUserRole)
- **Contexts**: Language management
- **Constants**: Translations, environment config

### @maity/web (current root)
The existing web application built with:
- React + TypeScript
- Vite
- shadcn/ui components
- Tailwind CSS

### @maity/mobile
React Native mobile application built with:
- React Native + TypeScript
- Expo
- React Navigation
- React Native Paper UI

## Setup

1. **Install dependencies for all packages**:
```bash
npm install
```

2. **Run both web and mobile**:
```bash
# In separate terminals
npm run dev        # Web app
npm run mobile     # Mobile app
```

## Development Workflow

### Adding Shared Logic

1. Add new logic to `packages/shared/src/`
2. Export from `packages/shared/src/index.ts`
3. Import in web/mobile: `import { Something } from '@maity/shared'`

### Platform-Specific Code

- **Web UI**: Uses shadcn/ui components
- **Mobile UI**: Uses React Native Paper
- **Storage**: Abstracted via interfaces (localStorage vs AsyncStorage)
- **Navigation**: React Router (web) vs React Navigation (mobile)

## Key Design Decisions

1. **Shared Package**: Contains all business logic without UI dependencies
2. **Platform Abstraction**: Storage, environment variables handled per platform
3. **Type Safety**: Shared TypeScript types across all packages
4. **Independent UI**: Each platform has its own UI components
5. **Monorepo Benefits**:
   - Single source of truth for business logic
   - Consistent data models
   - Shared utilities and helpers
   - Synchronized feature development

## Common Commands

```bash
# Web development
npm run dev

# Mobile development
npm run mobile

# Build web
npm run build

# Install new dependency in specific package
npm install <package> --workspace=@maity/shared
npm install <package> --workspace=@maity/mobile
```

## Migration Status

✅ **Completed**:
- Monorepo structure setup
- Shared package creation
- Business logic extraction
- Mobile app scaffolding
- Authentication screens
- Main navigation
- Basic UI components

🚧 **In Progress**:
- Integrating all web features into mobile
- Complete UI component library for mobile
- Testing and optimization

## Future Improvements

- Add shared state management (Redux/Zustand)
- Implement shared API client
- Add shared form validation
- Create shared testing utilities
- Setup CI/CD for monorepo