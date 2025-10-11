# OAuth Setup Instructions for Maity Mobile App

## Redirect URLs Configuration in Supabase Dashboard

Para que OAuth funcione correctamente tanto en web como en móvil, necesitas configurar múltiples redirect URLs en tu Supabase Dashboard:

### Pasos:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **URL Configuration**
3. En la sección **Redirect URLs**, agrega TODAS las siguientes URLs:

```
https://maity.com.mx/auth/callback
https://www.maity.com.mx/auth/callback
http://localhost:5173/auth/callback
maity://auth/callback
exp://127.0.0.1:8081
```

**Explicación de cada URL:**
- `https://maity.com.mx/auth/callback` - **Web producción** (requerido para que web funcione)
- `https://www.maity.com.mx/auth/callback` - Web producción con www (opcional)
- `http://localhost:5173/auth/callback` - Web desarrollo local
- `maity://auth/callback` - **Mobile producción** (requerido para que móvil funcione)
- `exp://127.0.0.1:8081` - Mobile desarrollo con Expo (opcional)

**IMPORTANTE:**
- NO elimines las URLs de web existentes
- Agrega la URL móvil `maity://auth/callback` junto con las URLs web
- Ambas pueden coexistir sin problemas
- Supabase automáticamente usa el redirect correcto basado en el origen de la petición

### Site URL
En la misma sección, verifica que **Site URL** esté configurada:
- Para producción: `https://maity.com.mx`
- Esto es importante para que la web funcione correctamente

### Verificar Proveedores OAuth

En **Authentication** → **Providers**, verifica que tengas configurados:

#### Google OAuth
- ✅ Habilitado
- Client ID (web) configurado
- Client Secret configurado
- Redirect URL: Debe incluir `maity://auth/callback`

#### Azure/Microsoft OAuth
- ✅ Habilitado
- Client ID configurado
- Client Secret configurado
- Redirect URL: Debe incluir `maity://auth/callback`

## Testing

### Opción 1: Development Build (Recomendado)
```bash
cd packages/mobile
npx expo run:android --device
```

### Opción 2: Expo Go (NO funcionará con OAuth)
OAuth NO funciona con Expo Go debido a limitaciones de deep linking.

## Troubleshooting

### Error: "Invalid redirect URL"
- Verifica que `maity://auth/callback` esté en la lista de Redirect URLs en Supabase
- Asegúrate de que el scheme en `app.json` sea `"maity"`

### Error: "User cancelled"
- Normal, el usuario cerró el navegador
- No se muestra alerta de error

### Browser no cierra automáticamente
- Verifica que `WebBrowser.maybeCompleteAuthSession()` esté llamado en `auth.ts`

### Logs útiles
Todos los logs de OAuth empiezan con `[OAuth]` para fácil filtrado:
```
[OAuth] Redirect URI: maity://auth/callback
[OAuth] Opening browser with URL: https://...
[OAuth] Browser result: {type: 'success', url: '...'}
[OAuth] Session set successfully
```
