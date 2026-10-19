<!-- Primer prompt yay -->

# Tarea 1: Verificar dependencias instaladas

## Contexto

Estoy configurando el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya tenés el `spec.md` cargado.

## Objetivo

Verificar que las dependencias necesarias estén instaladas en el `package.json` del frontend.

## Lo que debés hacer

1. Leer el archivo `frontend/package.json`.
2. Verificar si están presentes las siguientes dependencias:
   - En `dependencies`: `axios`, `react`, `react-dom`, `react-router-dom`, `lucide-react`
   - En `devDependencies`: `typescript`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`
3. Reportarme en una tabla qué dependencias están y cuáles faltan.
4. **NO instales nada todavía.** Solo informame.

## Lo que NO debés hacer

- No instales dependencias.
- No modifiques ningún archivo.
- No avances con ninguna otra tarea.

## Criterio de aceptación

Me mostrás una tabla con el estado de cada dependencia y esperás mi confirmación antes de seguir.

# Tarea 2: Verificar configuración de Tailwind CSS

## Contexto

Estoy configurando el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya tenés el `spec.md` cargado. La Tarea 1 (verificar dependencias) ya está completada.

## Objetivo

Verificar que Tailwind CSS esté correctamente configurado y funcionando en el proyecto.

## Lo que debés hacer

1. Verificar que existan estos archivos:
   - `frontend/tailwind.config.js` (o `.ts` / `.cjs`)
   - `frontend/postcss.config.js` (o `.ts` / `.cjs`)

2. Leer el contenido de `tailwind.config.js` y verificar que:
   - Exista la propiedad `content` con los paths:
     ```js
     content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"];
     ```
   - Exista el bloque `theme` (aunque esté vacío).
   - Exista el bloque `plugins`.

3. Leer `src/index.css` (o `src/main.css`) y verificar que contenga las tres directivas:

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. Verificar que `src/index.css` esté importado en `src/main.tsx`.

5. Reportarme el estado en una tabla con:
   - Archivo / verificación / estado (✅ o ❌)

## Lo que NO debés hacer

- No modifiques ningún archivo todavía.
- No agregues la paleta institucional (eso es para la próxima tarea).
- No agregues plugins de Tailwind.
- No avances con ninguna otra tarea.

## Criterio de aceptación

Me mostrás la tabla con el estado de cada verificación y esperás mi confirmación antes de seguir. Si algo falta, decime exactamente qué es lo que falta.

# Tarea 2a: Configuracion de tailwind.config

bien puedes añadir el primer archivo que no se encontro este debe de esta adaptado para futuras implementacion de contenido es decir no tiene que ser hardcodeado

# Tarea 2b: Crear `postcss.config.js`

## Contexto

Estoy configurando Tailwind CSS en el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya está creado `tailwind.config.js`. Ahora falta configurar PostCSS para que Tailwind funcione.

## Objetivo

Crear el archivo `postcss.config.js` en la raíz del frontend, con la configuración estándar para Tailwind CSS + Autoprefixer.

## Lo que debés hacer

1. Verificar que `postcss.config.js` NO exista ya. Si existe, reportalo y detenete.
2. Verificar en `package.json` si el proyecto usa ESM (`"type": "module"`) o CommonJS.
3. Crear `frontend/postcss.config.js` con la sintaxis correspondiente:
   - **Si es ESM:**

     ```javascript
     export default {
       plugins: {
         tailwindcss: {},
         autoprefixer: {},
       },
     };
     ```

   - **Si es CommonJS:**
     ```javascript
     module.exports = {
       plugins: {
         tailwindcss: {},
         autoprefixer: {},
       },
     };
     ```

## Lo que NO debés hacer

- No modifiques `tailwind.config.js`.
- No modifiques `package.json`.
- No toques `index.css`.
- No avances con ninguna otra tarea.

## Criterio de aceptación

Me mostrás:

1. El contenido final de `postcss.config.js`.
2. Confirmación de si el proyecto usa ESM o CommonJS (basado en `package.json`).
3. Esperás mi confirmación antes de seguir.

# Tarea 2c: Configurar `index.css` con las directivas de Tailwind

## Contexto

Estoy configurando Tailwind CSS en el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya están creados `tailwind.config.js` y `postcss.config.js`. Ahora falta verificar que `index.css` tenga las directivas de Tailwind.

## Objetivo

Verificar y, si hace falta, corregir el archivo `src/index.css` para que contenga las directivas de Tailwind.

## Lo que debés hacer

1. Verificar si existe `frontend/src/index.css`.
2. Verificar si existe `frontend/src/App.css`. Si existe, probablemente esté importado en `App.tsx` y no lo vamos a usar. Reportalo.
3. Leer el contenido actual de `src/index.css` y reportarlo.
4. Verificar que contenga exactamente estas tres directivas, en este orden, al inicio del archivo:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
5. Si el archivo no tiene esas directivas o tiene otro contenido:
   - **Reemplazar el contenido completo** por solo las tres directivas.
   - No agregar nada más.
6. Verificar que `src/index.css` esté importado en `src/main.tsx` (debe tener un `import './index.css'` o similar).
7. Verificar si `App.tsx` importa `App.css`. Si lo hace, avisame pero **no lo modifiques todavía**.

## Lo que NO debés hacer

- No agregues paleta institucional a Tailwind.
- No agregues estilos personalizados a `index.css`.
- No modifiques `App.tsx` ni `main.tsx` (solo reportá).
- No toques `tailwind.config.js` ni `postcss.config.js`.
- No avances con ninguna otra tarea.

## Criterio de aceptación

Me mostrás:

1. El contenido final de `src/index.css`.
2. Confirmación de si `index.css` está importado en `main.tsx`.
3. Confirmación de si `App.css` existe y está importado en `App.tsx`.
4. Esperás mi confirmación antes de seguir.

# Tarea 2g: Crear `src/vite-env.d.ts`

## Contexto

En el frontend del proyecto HIEF Journal (React + Vite + TypeScript), TypeScript está arrojando el error:
"Cannot find module or type declarations for side-effect import of './index.css'."
Esto pasa porque TypeScript no reconoce los archivos `.css` como módulos importables. La solución estándar en proyectos Vite es tener un archivo `vite-env.d.ts` con la referencia a los tipos de Vite.

## Objetivo

Crear el archivo `frontend/src/vite-env.d.ts` con la referencia a los tipos de Vite.

## Lo que debés hacer

### Paso 1 — Verificar

Confirmar que el archivo `frontend/src/vite-env.d.ts` **no existe**. Si existe, mostrarme su contenido y detenerte.

### Paso 2 — Crear el archivo

Crear `frontend/src/vite-env.d.ts` con exactamente este contenido (una sola línea):

```typescript
/// <reference types="vite/client" />
```

### Paso 3 — Verificar

1. Ejecutar `npm run build` y confirmar que compila sin errores.
2. Confirmar que el error de TypeScript en `src/main.tsx` (línea `import './index.css';`) desapareció.

## Lo que NO debés hacer

- No modifiques `main.tsx`.
- No modifiques `index.css`.
- No modifiques `tsconfig.json`.
- No modifiques `tailwind.config.js`.
- No avances con otra tarea.

## Criterio de aceptación

Mostrame:

1. Confirmación de que el archivo fue creado.
2. Contenido final de `src/vite-env.d.ts`.
3. Confirmación de que `npm run build` compila sin errores.
4. Confirmación de que el error de TypeScript en `main.tsx` desapareció.

Tarea 3 Crear la estructura de carpetas

Ya esta hecho

# Tarea 4: Crear tipos base de la API

## Contexto
Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya tenemos la estructura de carpetas y Tailwind configurado. Ahora vamos a definir cómo lucen las respuestas del backend para que TypeScript nos ayude a programar sin errores.

## Objetivo
Crear el archivo `src/types/api.types.ts` que contiene las interfaces para las respuestas estándar del backend y la paginación.

## Lo que debés hacer

### Paso 1 — Crear `src/types/api.types.ts`
Crear el archivo con exactamente este contenido:

```typescript
// src/types/api.types.ts

/**
 * Estructura estándar de respuesta del backend.
 * Todas las rutas de la API devuelven este formato.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Estructura estándar para respuestas paginadas.
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
```

### Paso 2 — Limpieza y verificación
1. Borrar el archivo `.gitkeep` de la carpeta `src/types/` (si es que todavía existe).
2. Ejecutar `npm run build` y confirmar que compila sin errores.

## Lo que NO debés hacer
- No crees otros tipos (User, Article, etc.) todavía.
- No modifiques `App.tsx` ni `main.tsx`.
- No avances con otra tarea.

## Criterio de aceptación
Mostrame:
1. El contenido final de `src/types/api.types.ts`.
2. Confirmación de que se borró el `.gitkeep` de `types/`.
3. Confirmación de que `npm run build` compila sin errores.
4. Esperás mi confirmación antes de seguir.

# Tarea 4b: Crear `index.html` en la raíz del frontend

## Contexto
El `npm run build` falló porque Vite necesita un archivo `index.html` en la raíz del frontend para funcionar. Ese archivo no existe.

## Objetivo
Crear el archivo `frontend/index.html` con la estructura mínima necesaria para Vite.

## Lo que debés hacer
1. Crear el archivo `frontend/index.html`.
2. Pegar exactamente este código dentro:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portal Científico Evita</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

3. Correr `npm run build`.

## Lo que NO debés hacer
- No modifiques ningún otro archivo.
- No avances con nada más.

## Respuesta esperada
Mostrame el código final y decime si el `npm run build` pasó o falló.

# Tarea 4c: Actualizar el archivo `.gitignore` del frontend

## Contexto
El comando `npm run build` genera una carpeta llamada `dist/` con archivos de producción. No queremos que esa carpeta se suba a GitHub.

## Objetivo
Asegurarnos de que la carpeta `dist/` y los archivos de entorno local estén ignorados por Git en el frontend.

## Lo que debés hacer
1. Leer el archivo `frontend/.gitignore` (si no existe, crealo).
2. Verificar si contiene las reglas para ignorar `dist` y `.env.local`. 
3. Si faltan, agregalas al final del archivo:

```text
# Build output
dist/
dist-ssr/
*.local

# Env
.env
.env.local
.env.*.local
```

4. Correr `npm run build` una última vez para confirmar que todo compila bien.

## Lo que NO debés hacer
- No borres la carpeta `dist/` todavía (solo asegurate de que esté ignorada).
- No modifiques `package.json`.
- No avances con nada más.

## Respuesta esperada
Mostrame el contenido final de `frontend/.gitignore` y decime si el `npm run build` pasó o falló.