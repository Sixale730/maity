---
description: Proceso de edición segura con respaldo automático
---

// turbo-all
Este flujo de trabajo DEBE seguirse antes de realizar cualquier cambio significativo en el código para asegurar que siempre haya un punto de retorno.

1. **Crear Respaldo**: Antes de editar un archivo (ej. `src/LandingPage.jsx`), crea una copia de seguridad con la extensión `.bak`.
   ```powershell
   copy-item "src/LandingPage.jsx" "src/LandingPage.jsx.bak"
   ```

2. **Realizar el Cambio**: Utiliza las herramientas de edición (`replace_file_content` o `multi_replace_file_content`) para aplicar los cambios solicitados.

3. **Verificación**: Observa la salida de las herramientas y, si es posible, verifica que el servidor de desarrollo siga funcionando sin errores críticos.

4. **Restauración (si falla)**: Si el cambio introduce errores fatales, no se puede aplicar correctamente o el usuario lo solicita, restaura el archivo desde el respaldo.
   ```powershell
   move-item "src/LandingPage.jsx.bak" "src/LandingPage.jsx" -Force
   ```

5. **Limpieza**: Una vez verificado el cambio, puedes eliminar el archivo `.bak` o mantenerlo hasta la siguiente sesión exitosa.
