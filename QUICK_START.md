# Quick Start Guide - Maity Mobile App

## ✅ Setup Complete!

Your React Native mobile app is now ready to run.

## 🚀 Start the Mobile App

### Option 1: From mobile directory
```bash
cd packages/mobile
npm start
```

### Option 2: From root directory
```bash
npm run mobile
```

## 📱 Running on Devices

Once Expo starts, you'll see a QR code. Choose your platform:

### For iOS:
- Press `i` in the terminal, or
- Scan QR code with Camera app (requires Expo Go app)

### For Android:
- Press `a` in the terminal, or
- Scan QR code with Expo Go app

### For Web (testing):
- Press `w` in the terminal

## 📦 What's Included

The mobile app includes:

✅ **Authentication**
- Login screen
- Registration
- Password recovery
- Google OAuth support

✅ **Main Features**
- Dashboard with metrics and progress
- Roleplay scenarios
- Session history
- User profile and settings

✅ **Shared Logic**
- All business logic shared with web app
- User role management
- Language switching (ES/EN)
- Supabase integration

## 🔧 Development Tips

### Clear cache if you encounter issues:
```bash
cd packages/mobile
npx expo start -c
```

### Install new dependencies:
```bash
cd packages/mobile
npm install <package-name> --legacy-peer-deps
```

### Update environment variables:
Edit `packages/mobile/.env` file

## 📂 Project Structure

```
packages/
├── shared/          # Shared business logic
│   ├── services/   # Supabase, Auth
│   ├── hooks/      # useUserRole, etc.
│   ├── contexts/   # Language management
│   └── types/      # TypeScript definitions
├── mobile/         # React Native app
│   ├── src/
│   │   ├── screens/     # Auth & Main screens
│   │   ├── components/  # UI components
│   │   ├── navigation/  # React Navigation
│   │   └── theme/       # MAITY colors
│   └── App.tsx
└── (web - current root directory)
```

## 🎨 UI Components Available

- Button (primary, secondary, outline, text variants)
- Input (with validation and error handling)
- Card (reusable container)
- Modal (dialog system)

All components use the MAITY color palette!

## ⚠️ Common Issues

### "Module not found" errors:
```bash
cd packages/mobile
rm -rf node_modules
npm install --legacy-peer-deps
```

### TypeScript errors in shared package:
```bash
cd packages/shared
npm run build
```

### Environment variables not loading:
Make sure variables in `.env` start with `EXPO_PUBLIC_`

## 🔗 Next Steps

1. **Test the app** - Try logging in with your Maity credentials
2. **Customize UI** - Modify components in `packages/mobile/src/components/ui/`
3. **Add features** - Create new screens in `packages/mobile/src/screens/`
4. **Share logic** - Add reusable code to `packages/shared/`

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

Happy coding! 🎉