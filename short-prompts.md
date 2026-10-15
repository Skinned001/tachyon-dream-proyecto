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
