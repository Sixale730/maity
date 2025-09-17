# Plan de implementacion Auth Company -> Callback

## AC — Pantalla de autenticacion

- [x] **AC-1 | Persistir company_id**
  - Detectar `company_id` desde el querystring al montar.
  - Registrar log `[AC-1] Querystring leido: company_id=<UUID|vacio>`.
  - Guardar `company_id` en cookie (ttl razonable) y en `localStorage`.
  - Registrar log `[AC-1] company_id persistido (cookie + localStorage)`.

- [x] **AC-2 | Validacion visual**
  - Bloquear botones de login si falta `company_id` (estado + disabled).
  - Mostrar aviso visible cuando `company_id` no esta disponible.
  - Registrar log `[AC-2] Advertencia: company_id ausente — bloqueando botones`.

- [x] **AC-3 | Botones de autenticacion**
  - Conectar botones Email/Google/Azure al SDK Supabase `signInWithOAuth`/`signInWithOtp`.
  - Asegurar `redirectTo` apunta al callback configurado.
  - Registrar logs `[AC-3] Lanzando login (provider=...) -> redirect=callback` al hacer clic.

- [ ] **AC-4 | Smoke test (manual)**
  - Verificar navegacion al proveedor y retorno al callback.
  - Registrar log `[AC-4] Smoke test OK: redireccion saliente y retorno a callback`.

## CB — Callback post-login

- [x] **CB-1 | Estado inicial**
  - Mostrar mensaje "configurando tu cuenta..." mientras se espera la sesion.
  - Registrar log `[CB-1] Callback cargado — esperando sesion Supabase` al montar.

- [x] **CB-2 | Escucha de sesion**
  - Suscribirse a eventos de sesion de Supabase y capturar `user.id` + proveedor.
  - Registrar log `[CB-2] Sesion detectada — user.id=<UUID>` y `[CB-2] Proveedor detectado: <...>`.

- [x] **CB-3 | Resolver company_id**
  - Reconstruir `company_id` con prioridad: query -> cookie -> localStorage.
  - Registrar log segun la fuente utilizada o `[CB-3][ERROR] No se encontro company_id — abortando enlace`.

- [x] **CB-4 | RPC de enlace**
  - Invocar RPC `link_user_company_by_company_id` con `company_id` y `user.id`.
  - Manejar errores y registrar `[CB-4] RPC ...` / `[CB-4][ERROR] ...`.

- [x] **CB-5 | Refresco de sesion (opcional)**
  - Refrescar sesion tras el enlace si se usa hook de tokens.
  - Registrar log `[CB-5] Sesion refrescada tras enlace` si aplica.

- [x] **CB-6 | Redireccion final**
  - Enviar usuario a `/dashboard` cuando el enlace sea exitoso.
  - Registrar log `[CB-6] Redirigiendo a /dashboard`.

- [x] **CB-7 | Manejo de errores**
  - Mostrar mensaje claro si la empresa es invalida/inactiva/denegada.
  - Ofrecer accion para volver a `/auth`.
  - Registrar log `[CB-7][ERROR] Enlace fallido — motivo: <detalle>` y `[CB-7] Accion usuario: Volver a /auth`.

## Validaciones cruzadas

- [ ] Asegurar coexistencia segura de cookie + localStorage (nombres/ttls/documentacion).
- [ ] Revisar expiracion y limpieza de `company_id` tras completarse el enlace.
- [ ] Confirmar que los logs usan un helper central, si existe, o implementar wrapper ligero.
- [ ] Documentar el flujo en README/Notion segun practicas del equipo.

