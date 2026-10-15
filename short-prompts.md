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
