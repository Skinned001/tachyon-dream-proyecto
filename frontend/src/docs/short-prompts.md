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

# Configuracion de tailwind.config

bien puedes añadir el primer archivo que no se encontro este debe de esta adaptado para futuras implementacion de contenido es decir no tiene que ser hardcodeado

# Crear `postcss.config.js`

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

# Tarea 3: arreglar-typescript-css.md

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

# Tarea 04: Crear `index.html` en la raíz del frontend

## Contexto

El `npm run build` falló porque Vite necesita un archivo `index.html` en la raíz del frontend para funcionar. Ese archivo es el punto de entrada de la aplicación.

## Objetivo

Crear el archivo `frontend/index.html` con la estructura mínima necesaria para Vite y React.

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

# Tarea 05: Crear el archivo `api.types.ts`

## Contexto

Proyecto frontend React + TypeScript. Necesitamos definir cómo lucen las respuestas del backend para que TypeScript nos ayude a programar sin errores.

## Objetivo

Crear el archivo `src/types/api.types.ts`.

## Lo que debés hacer

1. Crear el archivo `src/types/api.types.ts`.
2. Pegar exactamente este código dentro:

```typescript
export interface ApiResponse<T unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
```

3. Borrar el archivo `.gitkeep` que está dentro de la carpeta `src/types/` (si existe).
4. Correr `npm run build`.

## Lo que NO debés hacer

- No crees otros archivos.
- No modifiques ningún otro archivo.
- No avances con nada más.

## Respuesta esperada

Mostrame el código final y decime si el `npm run build` pasó o falló.

# Tarea 06: Crear tipos de Usuario para el Login

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript). El objetivo inmediato es implementar el Login. Para eso, primero necesitamos definir el tipo de dato del Usuario que devuelve el backend.

## Objetivo

Crear el archivo `src/types/user.types.ts` con los tipos del usuario y sus roles.

## Lo que debés hacer

### Paso 1 — Crear `src/types/user.types.ts`

Crear el archivo con exactamente este contenido:

```typescript
// src/types/user.types.ts

/**
 * Roles disponibles en el sistema (según spec.md).
 */
export type UserRole = "AUTOR" | "DDI" | "COMITE" | "PUBLISHER" | "ADMIN";

/**
 * Datos del usuario que devuelve el backend al autenticarse.
 * No incluye la contraseña.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  specialtyId: number | null;
  active?: boolean;
}
```

### Paso 2 — Limpieza

1. Borrar el archivo `.gitkeep` de la carpeta `src/types/` (si existe).
2. Ejecutar `npm run build` y confirmar que compila sin errores.

## Lo que NO debés hacer

- No crees el `axiosClient` ni servicios de API.
- No crees tipos de Artículos ni de otras entidades.
- No modifiques `App.tsx` ni `main.tsx`.
- No avances con otra tarea.

## Criterio de aceptación

Mostrame:

1. El contenido final de `src/types/user.types.ts`.
2. Confirmación de que se borró el `.gitkeep` de `types/`.
3. Confirmación de que `npm run build` compila sin errores.

# Tarea 07: Configurar el cliente HTTP (axiosClient)

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya tenemos los tipos base (`api.types.ts` y `user.types.ts`). Ahora necesitamos configurar Axios para comunicarnos con el backend.

La autenticación del sistema usa **cookies HttpOnly**, por lo que es CRÍTICO que Axios envíe las credenciales en cada petición.

## Objetivo

Crear el archivo `src/api/axiosClient.ts` configurado con la URL base, `withCredentials` y un interceptor para manejar errores.

## Lo que debés hacer

### Paso 1 — Crear `src/api/axiosClient.ts`

Crear el archivo con exactamente este contenido:

```typescript
// src/api/axiosClient.ts
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // CRÍTICO: Permite enviar y recibir cookies HttpOnly
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para transformar los errores del backend
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Intenta extraer el mensaje en diferentes formatos comunes
    const backendData = error.response?.data;
    const message =
      backendData?.error ||
      backendData?.mensaje ||
      backendData?.message ||
      "Error de conexión con el servidor";

    return Promise.reject(new Error(message));
  },
);
```

### Paso 2 — Limpieza

1. Borrar el archivo `.gitkeep` de la carpeta `src/api/` (si existe).
2. Correr `npm run build`.

## Lo que NO debés hacer

- No modifiques `index.css`.
- No modifiques `tailwind.config.js`.
- No avances con otra tarea.

## Criterio de aceptación

Mostrame:

1. El contenido final de `src/api/axiosClient.ts`.
2. Confirmación de que se borró el `.gitkeep` de `api/`.
3. Confirmación de que `npm run build` compila sin errores.

# Tarea 08: Crear el servicio de autenticación (auth.api.ts)

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya tenemos el `axiosClient` configurado con las cookies HttpOnly y los tipos base (`User`, `ApiResponse`). Ahora necesitamos las funciones que se comunican con el backend para el Login.

## Objetivo

Crear el archivo `src/api/auth.api.ts` con las funciones `login`, `logout` y `verify`.

## Lo que debés hacer

### Paso 1 — Crear `src/api/auth.api.ts`

Crear el archivo con exactamente este código dentro:

```typescript
// src/api/auth.api.ts
import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/user.types';

/**
 * Inicia sesión en el backend y devuelve los datos del usuario.
 * El backend se encarga de setear la cookie HttpOnly.
 */
export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await axiosClient.post<ApiResponse<{ User usuario: }>>(
    '/auth/login',
    { email, password }
  );

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  return data.data.usuario;
};

/**
 * Cierra la sesión en el backend, eliminando la cookie.
 */
export const logout = async (): Promise<void> => {
  await axiosClient.post('/auth/logout');
};

/**
 * Verifica si hay una sesión activa (se usa al recargar la página).
 * Devuelve el usuario si está logueado, o null si no hay sesión.
 */
export const verify = async (): Promise<User null |> => {
  try {
    const { data } = await axiosClient.get<ApiResponse<{ User usuario: }>>('/auth/verify');
    return data.success && data.data ? data.data.usuario : null;
  } catch (error) {
    return null; // Si falla, significa que no hay sesión activa
  }
};
```

### Paso 2 — Limpieza

1. Borrar el archivo `.gitkeep` de la carpeta `src/api/` (si todavía existe).
2. Ejecutar `npm run build` y confirmar que compila sin errores.

## Lo que NO debés hacer

- No crees el contexto de React (AuthContext) todavía.
- No crees componentes visuales (Login.tsx) todavía.
- No modifiques `axiosClient.ts` ni los tipos.
- No avances con nada más.

## Criterio de aceptación

Mostrame:

1. El contenido final de `src/api/auth.api.ts`.
2. Confirmación de que `npm run build` pasó o falló.

# Tarea 09: Crear el Contexto de Autenticación (AuthContext)

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya tenemos el `auth.api.ts` (login, logout, verify) y los tipos de usuario. Ahora necesitamos un contexto global para guardar el estado de la sesión del usuario y que toda la app sepa si estamos logueados o no.

## Objetivo

Crear el archivo `src/context/AuthContext.tsx` y su hook `useAuth`.

## Lo que debés hacer

### Paso 1 — Crear `src/context/AuthContext.tsx`

Crear el archivo con exactamente este código dentro:

```tsx
// src/context/AuthContext.tsx
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { User } from '../types/user.types';
import * as authApi from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType undefined |>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User null |>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar sesión al cargar la app (ej. al recargar la página)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authApi.verify();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Si verify falla, simplemente no hay sesión
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider isAuthenticated, isLoading, login, logout user, value="{{" }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
```

# Tarea 10: Envolver la app con el AuthProvider

## Contexto

Ya creamos el `AuthContext` en `src/context/AuthContext.tsx`. Ahora necesitamos que toda la aplicación tenga acceso a este contexto para saber si el usuario está logueado o no.

## Objetivo

Modificar `src/main.tsx` para envolver el componente `<App />` con el `<AuthProvider>`.

## Lo que debés hacer

### Paso 1 — Modificar `src/main.tsx`

El archivo debe quedar exactamente de la siguiente manera (manteniendo el orden de los imports y los estilos):

```tsx
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
```

### Paso 2 — Verificación

1. Correr `npm run build` para confirmar que todo compila correctamente.

## Lo que NO debés hacer

- No crees el formulario de Login todavía.
- No modifiques el `AuthContext.tsx`.
- No avances con nada más.

## Respuesta esperada

Mostrame el código final de `src/main.tsx` y decime si `npm run build` pasó o falló.

# Tarea 11-auditoria-base.md

## Contexto

Hemos avanzado en varias tareas pequeñas para configurar el frontend del proyecto HIEF Journal (React + Vite + TypeScript) y la base del Login. Antes de empezar a construir la interfaz visual, necesito que audites que absolutamente todo se ha guardado correctamente y no hay errores.

## Objetivo

Revisar la existencia y el contenido correcto de los archivos clave que hemos creado hasta ahora, y verificar la compilación.

## Lo que debés hacer

Revisa y reporta el estado de los siguientes puntos:

1. **Estructura:** Confirma que existen las carpetas `src/api`, `src/types`, `src/context`.
2. **Tailwind:** Revisa que `src/index.css` contenga `@import "tailwindcss";` y que `postcss.config.js` use `@tailwindcss/postcss`.
3. **Vite/TS:** Confirma que existe `src/vite-env.d.ts` con la referencia a vite, y que `index.html` tiene el `<div id="root"></div>`.
4. **Archivos creados:** Verifica que existan y tengan contenido los archivos:
   - `src/types/api.types.ts`
   - `src/types/user.types.ts`
   - `src/api/axiosClient.ts` (Verifica que tenga `withCredentials: true`)
   - `src/api/auth.api.ts` (Verifica que tenga las funciones login, logout, verify)
   - `src/context/AuthContext.tsx` (Verifica que tenga el AuthProvider y el hook useAuth)
5. **Conexión:** Revisa `src/main.tsx` y confirma que `<App />` esté envuelto por `<AuthProvider>`.
6. **Compilación:** Corre `npm run build`.

## Lo que NO debés hacer

- No modifiques ningún archivo en esta tarea.
- No corrijas nada automáticamente.
- No avances con la creación de componentes visuales.

## Respuesta esperada

Mostrame un reporte en formato de lista o tabla, indicando ✅ (Cumple) o ❌ (Falta o está mal) para cada punto. Si algo está mal, explícame brevemente qué es. Al final, indica el resultado de `npm run build`.

# Tarea 12-reparar-base-frontend.md

## Contexto

La auditoría reveló que algunos archivos se crearon en rutas incorrectas, faltan otros, o tienen contenido erróneo. Necesitamos dejar la carpeta `frontend/` perfectamente configurada antes de avanzar.

## Objetivo

Sobrescribir y crear los archivos faltantes con el contenido exacto solicitado.

## Lo que debés hacer

### 1. Crear `frontend/index.html` (si no existe)

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

### 2. Sobrescribir `frontend/src/types/api.types.ts`

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
```

### 3. Sobrescribir `frontend/src/types/user.types.ts`

```typescript
export type UserRole = "AUTOR" | "DDI" | "COMITE" | "PUBLISHER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  specialtyId: number | null;
  active?: boolean;
}
```

### 4. Sobrescribir `frontend/src/api/axiosClient.ts`

```typescript
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendData = error.response?.data;
    const message =
      backendData?.error ||
      backendData?.mensaje ||
      backendData?.message ||
      "Error de conexión con el servidor";
    return Promise.reject(new Error(message));
  },
);
```

### 5. Sobrescribir `frontend/src/api/auth.api.ts`

```typescript
import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/api.types";
import type { User } from "../types/user.types";

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await axiosClient.post<ApiResponse<{ usuario: User }>>(
    "/auth/login",
    { email, password },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al iniciar sesión");
  }
  return data.data.usuario;
};

export const logout = async (): Promise<void> => {
  await axiosClient.post("/auth/logout");
};

export const verify = async (): Promise<User | null> => {
  try {
    const { data } =
      await axiosClient.get<ApiResponse<{ usuario: User }>>("/auth/verify");
    return data.success && data.data ? data.data.usuario : null;
  } catch (error) {
    return null;
  }
};
```

### 6. Sobrescribir `frontend/src/main.tsx`

```tsx
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
```

### 7. Verificación final

- Ejecutar `npm run build` desde la carpeta `frontend/`.

## Lo que NO debés hacer

- No toques `AuthContext.tsx` (el agente anterior confirmó que está bien).
- No modifiques Tailwind ni PostCSS.
- No crees el formulario de Login aún.

## Respuesta esperada

Confirmame que los 6 archivos fueron sobrescritos/creados y decime si `npm run build` pasó o falló.

# Tarea 13: Alinear auth.api.ts y AuthContext.tsx con el Backend real

## Contexto

El agente anterior se confundió leyendo el archivo de contrato y omitió funciones. Necesitamos corregir la lógica.
Aclaraciones IMPORTANTES de la arquitectura real:

1. Usamos **Cookie HttpOnly**. El backend NO devuelve el token en el JSON.
2. El backend SÍ tiene la ruta `GET /auth/verify` para validar la sesión y `POST /auth/logout`.
3. El backend devuelve los datos del usuario dentro de la propiedad `usuario` (no `user`).

## Objetivo

Sobrescribir `src/api/auth.api.ts` y `src/context/AuthContext.tsx` con la lógica completa y correcta.

## Lo que debés hacer

### 1. Sobrescribir `src/api/auth.api.ts`

```typescript
// src/api/auth.api.ts
import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/api.types";
import type { User } from "../types/user.types";

export const login = async (email: string, password: string): Promise<User> => {
  // El backend setea la cookie HttpOnly y devuelve el usuario
  const { data } = await axiosClient.post<ApiResponse<{ usuario: User }>>(
    "/auth/login",
    { email, password },
  );

  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al iniciar sesión");
  }

  return data.data.usuario;
};

export const logout = async (): Promise<void> => {
  await axiosClient.post("/auth/logout");
};

export const verify = async (): Promise<User | null> => {
  try {
    const { data } =
      await axiosClient.get<ApiResponse<{ usuario: User }>>("/auth/verify");
    return data.success && data.data ? data.data.usuario : null;
  } catch (error) {
    return null; // 401 significa que no hay sesión activa, es normal
  }
};
```

### 2. Sobrescribir `src/context/AuthContext.tsx`

```tsx
// src/context/AuthContext.tsx
import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import type { User } from "../types/user.types";
import * as authApi from "../api/auth.api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar sesión al cargar la app (recarga de página)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authApi.verify();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
```

### 3. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No modifiques `main.tsx` ni `axiosClient.ts`.
- No crees el formulario visual de Login aún.
- No uses `data.user`, el backend devuelve `data.usuario`.

## Respuesta esperada

Confirmame que ambos archivos fueron sobrescritos correctamente y decime si `npm run build` pasó o falló.

# Tarea 14: Adaptar auth.api.ts al backend actual

## Contexto

La auditoría reveló que el backend actual responde de la siguiente manera:

- `POST /auth/login`: setea la cookie, y devuelve `data.token` y `data.user`.
- `GET /auth/verify`: devuelve `data.valid` (booleano).
- `GET /auth/me`: devuelve el usuario bajo `data` (el objeto usuario directo).
  Vamos a adaptar el frontend a esta realidad. No vamos a romper el backend.

## Objetivo

Sobrescribir `src/api/auth.api.ts` para que consuma las rutas correctamente.

## Lo que debés hacer

### 1. Sobrescribir `src/api/auth.api.ts`

```typescript
// src/api/auth.api.ts
import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/api.types";
import type { User } from "../types/user.types";

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await axiosClient.post<
    ApiResponse<{ token: string; user: User }>
  >("/auth/login", { email, password });

  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al iniciar sesión");
  }

  // Adaptado a lo que devuelve el backend real
  return data.data.user;
};

export const logout = async (): Promise<void> => {
  await axiosClient.post("/auth/logout");
};

export const verify = async (): Promise<User | null> => {
  try {
    // 1. Verificamos si la cookie es válida
    const verifyRes =
      await axiosClient.get<ApiResponse<{ valid: boolean }>>("/auth/verify");

    if (!verifyRes.data.success || !verifyRes.data.data?.valid) {
      return null;
    }

    // 2. Si es válida, traemos los datos del usuario desde /me
    const meRes = await axiosClient.get<ApiResponse<User>>("/auth/me");

    if (meRes.data.success && meRes.data.data) {
      return meRes.data.data;
    }

    return null;
  } catch (error) {
    return null; // Si falla (ej. 401), no hay sesión activa
  }
};
```

### 2. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No modifiques `AuthContext.tsx` (ya está preparado para recibir lo que devuelva `verify`).
- No modifiques `main.tsx` ni `axiosClient.ts`.
- No crees el formulario visual de Login aún.

## Respuesta esperada

Confirmame que `auth.api.ts` fue sobrescrito correctamente y decime si `npm run build` pasó o falló.

# Tarea 15: Crear componente UI Button

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript + Tailwind v4). Vamos a empezar a crear la interfaz visual para el Login, pero primero necesitamos componentes reutilizables. Empezaremos por el botón.

## Objetivo

Crear el componente `src/components/ui/Button.tsx` que soporte variantes de color y estado de carga.

## Lo que debés hacer

### 1. Crear `src/components/ui/Button.tsx`

Crear el archivo con exactamente este contenido:

```tsx
// src/components/ui/Button.tsx
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  // Clases base para todos los botones
  const baseClasses =
    "inline-flex items-center justify-center px-4 py-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variantes de color (usando la paleta institucional)
  const variants = {
    primary:
      "bg-institucional-600 text-white hover:bg-institucional-700 focus:ring-institucional-500",
    secondary:
      "bg-white text-institucional-700 border border-institucional-200 hover:bg-institucional-50 focus:ring-institucional-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
```

### 2. Limpieza y verificación

1. Borrar el archivo `.gitkeep` de la carpeta `src/components/ui/` (si existe).
2. Correr `npm run build`.

## Lo que NO debés hacer

- No crees otros componentes (Input, Card) todavía.
- No crees la pantalla de Login todavía.
- No avances con nada más.

## Respuesta esperada

Mostrame el código final del botón y decime si `npm run build` pasó o falló.

# Tarea 16: Crear componente UI Input

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript + Tailwind v4). Ya tenemos el componente `Button`. Ahora necesitamos el componente `Input` para el formulario de Login (y futuros formularios).

## Objetivo

Crear el componente `src/components/ui/Input.tsx` que soporte etiquetas (labels), mensajes de error y tipado estricto.

## Lo que debés hacer

### 1. Crear `src/components/ui/Input.tsx`

Crear el archivo con exactamente este contenido:

```tsx
// src/components/ui/Input.tsx
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    // Genera un ID automático si no se pasa uno (para el htmlFor del label)
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={`px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-institucional-500 focus:border-institucional-500 ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
```

### 2. Limpieza y verificación

1. Correr `npm run build`.

## Lo que NO debés hacer

- No crees el componente `Card` todavía.
- No crees la pantalla de Login todavía.
- No avances con nada más.

## Respuesta esperada

Mostrame el código final del input y decime si `npm run build` pasó o falló.

# Tarea 17: Crear componente UI Card

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript + Tailwind v4). Ya tenemos los componentes `Button` e `Input`. Ahora necesitamos un componente `Card` para envolver formularios y mostrar información de forma agrupada.

## Objetivo

Crear el componente `src/components/ui/Card.tsx` que reciba contenido (children) y un título opcional.

## Lo que debés hacer

### 1. Crear `src/components/ui/Card.tsx`

Crear el archivo con exactamente este contenido:

```tsx
// src/components/ui/Card.tsx
import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export const Card = ({ children, title, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
```

### 2. Limpieza y verificación

1. Correr `npm run build`.

## Lo que NO debés hacer

- No crees la pantalla de Login todavía.
- No modifiques los archivos anteriores.
- No avances con nada más.

## Respuesta esperada

Mostrame el código final de `Card.tsx` y decime si `npm run build` pasó o falló.

# Tarea 18: Crear el hook useForm genérico

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Vamos a crear la pantalla de Login, pero para mantener el componente visual limpio y libre de lógica repetitiva, primero necesitamos un hook personalizado que maneje el estado de los formularios.

## Objetivo

Crear el archivo `src/hooks/useForm.ts` que maneje los inputs de texto y el evento onChange de forma genérica y tipada.

## Lo que debés hacer

### 1. Crear `src/hooks/useForm.ts`

Crear el archivo con exactamente este código:

```typescript
// src/hooks/useForm.ts
import { useState, type ChangeEvent } from "react";

/**
 * Hook genérico para manejar el estado de formularios.
 * @param initialState Objeto con los valores iniciales del formulario.
 */
export const useForm = <T extends Record<string, string>>(initialState: T) => {
  const [formulario, setFormulario] = useState<T>(initialState);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormulario(initialState);
  };

  return {
    formulario,
    handleChange,
    resetForm,
    setFormulario, // Lo exponemos por si necesitamos setear valores manualmente
  };
};
```

### 2. Limpieza y verificación

1. Borrar el archivo `.gitkeep` de la carpeta `src/hooks/` (si existe).
2. Correr `npm run build`.

## Lo que NO debés hacer

- No crees el componente Login todavía.
- No modifiques los archivos anteriores.
- No avances con nada más.

## Respuesta esperada

Mostrame el código final de `useForm.ts` y decime si `npm run build` pasó o falló.

# Tarea 19: Crear la pantalla visual del Login

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya tenemos todos los componentes de UI (`Card`, `Input`, `Button`), el hook `useForm`, el `useAuth` y el servicio `auth.api.ts`. Es hora de crear la pantalla visual del Login.

## Objetivo

Crear el archivo `src/pages/Login.tsx` que contenga el formulario y la lógica de inicio de sesión.

## Lo que debés hacer

### 1. Crear `src/pages/Login.tsx`

Crear el archivo con exactamente este contenido:

```tsx
// src/pages/Login.tsx
import { useState } from "react";
import { useForm } from "../hooks/useForm";
import { useAuth } from "../context/AuthContext";
import { login as loginApi } from "../api/auth.api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export const Login = () => {
  // 1. Estado del formulario
  const { formulario, handleChange } = useForm({
    email: "",
    password: "",
  });

  // 2. Hooks globales
  const { login } = useAuth();

  // 3. Estados locales para la petición
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 4. Manejo del envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validación básica en el frontend
    if (!formulario.email || !formulario.password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Llamamos a la API
      const userData = await loginApi(formulario.email, formulario.password);

      // Guardamos al usuario en el contexto global
      login(userData);

      // Redirigimos al inicio (por ahora recargamos para probar)
      window.location.href = "/";
    } catch (err: any) {
      // Mostramos el error del backend (ej. "Credenciales inválidas")
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-institucional-700">
            Portal Científico Evita
          </h1>
          <p className="text-gray-500 mt-2">La Voz de la Ciencia</p>
        </div>

        {/* Tarjeta del formulario */}
        <Card title="Iniciar Sesión">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              placeholder="correo@hief.gob.ar"
              value={formulario.email}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formulario.password}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="current-password"
            />

            {/* Mensaje de error */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="mt-2 w-full"
            >
              Ingresar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
```

### 2. Limpieza y verificación

1. Borrar el archivo `.gitkeep` de la carpeta `src/pages/` (si existe).
2. Correr `npm run build`.

## Lo que NO debés hacer

- No modifiques `App.tsx` todavía (el siguiente paso será renderizar este Login).
- No modifiques el contexto ni los componentes de UI.
- No avances con nada más.

## Respuesta esperada

Mostrame el código final y decime si `npm run build` pasó o falló.

# Tarea 21: Renderizar el Login en App.tsx

## Contexto

Ya tenemos el componente `src/pages/Login.tsx` completamente funcional. Sin embargo, el archivo principal `src/App.tsx` todavía tiene el código por defecto de Vite (los logos de React y el contador). Necesitamos limpiarlo y mostrar nuestra pantalla de Login.

## Objetivo

Limpiar `src/App.tsx` y renderizar el componente `Login`.

## Lo que debés hacer

### 1. Sobrescribir `src/App.tsx`

Reemplazar todo el contenido actual del archivo con exactamente este código:

```tsx
// src/App.tsx
import { Login } from "./pages/Login";

function App() {
  return <Login />;
}

export default App;
```

### 2. Limpieza de estilos por defecto

1. Verificar si existe `src/App.css`. Si existe, borrarlo (ya que no lo vamos a usar y puede inyectar estilos por defecto que rompan Tailwind).
2. Abrir `src/index.css` y asegurarse de que **NO** contenga los estilos por defecto de Vite (como `body { display: flex; place-items: center; }`). El archivo `index.css` solo debe tener `@import "tailwindcss";` y la configuración de `@theme` que pusimos. Si tiene otros estilos, borralos.

### 3. Verificación

1. Correr `npm run build`.

## Lo que NO debés hacer

- No configures React Router todavía.
- No modifiques `main.tsx`.
- No modifiques el componente `Login.tsx`.

## Respuesta esperada

Mostrame el código final de `App.tsx` y decime si `npm run build` pasó o falló.

# Tarea 22: Sincronizar tipos de Usuario con el Contrato Oficial

## Contexto

Acabo de proporcionar el archivo de contratos oficiales de la API. Necesitamos actualizar el tipo de usuario en el frontend para que coincida exactamente con el `AuthUser` del backend.

## Objetivo

Sobrescribir `src/types/user.types.ts` para reflejar el contrato exacto.

## Lo que debés hacer

### 1. Sobrescribir `src/types/user.types.ts`

```typescript
// src/types/user.types.ts

export type UserRole = "AUTOR" | "DDI" | "COMITE" | "PUBLISHER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  specialtyId: number | null;
  must_change_password: boolean;
  // Campos opcionales que vienen en UserDTO
  dni?: string | null;
  active?: boolean;
  createdAt?: string;
}
```

### 2. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que el archivo fue sobrescrito y si `npm run build` pasó o falló.

# Tarea 23: Crear páginas placeholder para el Dashboard

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya tenemos el Login. Ahora necesitamos crear las páginas vacías (placeholders) a las que el usuario podrá acceder una vez logueado, para luego configurar el enrutador (React Router).

## Objetivo

Crear 5 archivos de páginas básicas en `src/pages/` que luego conectaremos al Router.

## Lo que debés hacer

### 1. Crear los archivos en `src/pages/`

Crear los siguientes archivos con un contenido muy simple para que compilen y podamos verificar la navegación:

**`src/pages/DashboardHome.tsx`**

```tsx
export const DashboardHome = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-institucional-700">
        Panel de Control
      </h1>
      <p className="text-gray-600 mt-2">
        Bienvenido al sistema de gestión científica.
      </p>
    </div>
  );
};
```

**`src/pages/MisArticulos.tsx`**

```tsx
export const MisArticulos = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Mis Artículos</h1>
    </div>
  );
};
```

**`src/pages/Revisiones.tsx`**

```tsx
export const Revisiones = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Revisiones Asignadas</h1>
    </div>
  );
};
```

**`src/pages/BibliotecaHome.tsx`**

```tsx
export const BibliotecaHome = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Biblioteca Virtual</h1>
    </div>
  );
};
```

**`src/pages/Registro.tsx`**

```tsx
export const Registro = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Registro de Usuario</h1>
    </div>
  );
};
```

### 2. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No configures React Router todavía.
- No modifiques `App.tsx`.
- No avances con nada más.

## Respuesta esperada

Confirmame que los 5 archivos fueron creados y decime si `npm run build` pasó o falló.

# Tarea 24: Crear el Layout del Dashboard con Logout

## Contexto

Estamos construyendo el frontend del proyecto HIEF Journal (React + Vite + TypeScript). Ya tenemos el Login funcional y las páginas placeholder. Ahora necesitamos el `DashboardLayout`, que es la estructura visual (Sidebar + Header) que envolverá a todas las páginas privadas una vez que el usuario inicie sesión.

## Objetivo

Crear el archivo `src/layouts/DashboardLayout.tsx` con un menú lateral, una barra superior, un botón de "Cerrar Sesión" y el `<Outlet />` (para que React Router renderice las páginas dentro).

## Lo que debés hacer

### 1. Crear `src/layouts/DashboardLayout.tsx`

Crear el archivo con exactamente este contenido:

```tsx
// src/layouts/DashboardLayout.tsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { LogOut, Home, FileText, CheckSquare, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-institucional-700">
            HIEF Journal
          </h1>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Inicio
          </Link>
          <Link
            to="/mis-articulos"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Mis Artículos
          </Link>
          <Link
            to="/revisiones"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors"
          >
            <CheckSquare className="w-5 h-5" />
            Revisiones
          </Link>
          <Link
            to="/biblioteca"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Biblioteca
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">
              Usuario: {user?.first_name} {user?.last_name} ({user?.role})
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

### 2. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No configures las rutas (AppRoutes) todavía.
- No modifiques las páginas placeholder.
- No avances con nada más.

## Respuesta esperada

Confirmame que el archivo fue creado y decime si `npm run build` pasó o falló.

# Tarea 25-Bis: Configurar React Router y Rutas Protegidas por Rol

## Contexto

El DashboardLayout ya está creado (con un diseño envidiable) y el Login funciona. Sin embargo, necesitamos configurar `react-router-dom` para que la navegación sea fluida (sin recargar la página) y, lo más importante, **proteger las rutas para que solo el ADMIN pueda acceder a ciertas vistas en el futuro**.

## Objetivo

1. Configurar el enrutador principal en `main.tsx` y `App.tsx`.
2. Crear `src/routes/PrivateRoutes.tsx` (protege el acceso general).
3. Crear `src/routes/RoleRoute.tsx` (protege el acceso por rol, como ADMIN).
4. Crear `src/routes/AppRoutes.tsx` (el mapa de rutas).
5. Conectar el botón de Login para que use `useNavigate` en lugar de recargar la página.

## Lo que debés hacer

### 1. Actualizar `src/main.tsx`

```tsx
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

### 2. Crear `src/routes/PrivateRoutes.tsx`

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Cargando sistema...</div>
    );

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
```

### 3. Crear `src/routes/RoleRoute.tsx`

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/user.types";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">
        Verificando permisos...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  return allowedRoles.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};
```

### 4. Sobrescribir `src/routes/AppRoutes.tsx`

```tsx
import { Routes, Route } from "react-router-dom";
import { Login } from "../pages/Login";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { DashboardHome } from "../pages/DashboardHome";
import { MisArticulos } from "../pages/MisArticulos";
import { Revisiones } from "../pages/Revisiones";
import { BibliotecaHome } from "../pages/BibliotecaHome";
import { PrivateRoutes } from "./PrivateRoutes";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas Privadas (Requieren login) */}
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="mis-articulos" element={<MisArticulos />} />
          <Route path="revisiones" element={<Revisiones />} />
          <Route path="biblioteca" element={<BibliotecaHome />} />
          {/* Aquí luego agregaremos las rutas de ADMIN */}
        </Route>
      </Route>
    </Routes>
  );
};
```

### 5. Actualizar `src/App.tsx`

```tsx
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
}

export default App;
```

### 6. Actualizar `src/pages/Login.tsx`

- Importar `useNavigate` de `react-router-dom`.
- Al inicio del componente, declarar: `const navigate = useNavigate();`
- En el `try` del `handleSubmit`, después de `login(userData);`, borrar `window.location.href = '/'` y poner `navigate('/');`.

### 7. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No crees la página de Admin todavía.
- No modifiques el diseño visual de `DashboardLayout`.
- No avances con nada más.

## Respuesta esperada

Confirmame que los archivos fueron creados/actualizados y decime si `npm run build` pasó o falló.

# Tarea 26: Crear tipos y servicio API para gestión de usuarios

## Contexto

Estamos construyendo el panel de administración para el rol `ADMIN`. Necesitamos conectar el frontend con los endpoints de usuarios del backend (`/api/usuarios`).

## Objetivo

1. Agregar tipos para la creación/edición de usuarios.
2. Crear el archivo `src/api/usuarios.api.ts`.

## Lo que debés hacer

### 1. Actualizar `src/types/user.types.ts`

Agregar las siguientes interfaces al final del archivo (manteniendo las que ya existen):

```typescript
export interface CreateUserRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  dni?: string;
  role: UserRole;
  specialtyId?: number | null;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  dni?: string;
  role?: UserRole;
  specialtyId?: number | null;
  active?: boolean;
}
```

### 2. Crear `src/api/usuarios.api.ts`

Crear el archivo con exactamente este código (basado en el contrato de la API):

```typescript
// src/api/usuarios.api.ts
import { axiosClient } from "./axiosClient";
import type { ApiResponse, Paginated } from "../types/api.types";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/user.types";

// Listar usuarios (Admin)
export const getUsuarios = async (): Promise<User[]> => {
  const { data } =
    await axiosClient.get<ApiResponse<Paginated<User>>>("/usuarios");
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al obtener usuarios");
  }
  return data.data.items; // Dependiendo de cómo devuelva el backend, puede ser .items o el array directo
};

// Crear usuario (Admin)
export const createUsuario = async (
  payload: CreateUserRequest,
): Promise<User> => {
  const { data } = await axiosClient.post<ApiResponse<User>>(
    "/usuarios",
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al crear usuario");
  }
  return data.data;
};

// Actualizar usuario (Admin)
export const updateUsuario = async (
  id: number,
  payload: UpdateUserRequest,
): Promise<User> => {
  const { data } = await axiosClient.put<ApiResponse<User>>(
    `/usuarios/${id}`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al actualizar usuario");
  }
  return data.data;
};

// Dar de baja (Lógica) (Admin)
export const deleteUsuario = async (id: number): Promise<void> => {
  const { data } = await axiosClient.delete<ApiResponse<void>>(
    `/usuarios/${id}`,
  );
  if (!data.success) {
    throw new Error(data.error || "Error al dar de baja al usuario");
  }
};
```

### 3. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No modifiques el Sidebar ni el DashboardLayout todavía.
- No crees las pantallas visuales todavía.
- No avances con nada más.

## Respuesta esperada

Confirmame que los archivos fueron creados/actualizados y decime si `npm run build` pasó o falló.

# Tarea 27: Crear la pantalla de Gestión de Usuarios y conectarla al menú

## Contexto

Tenemos el `DashboardLayout`, el enrutador (`AppRoutes`) y el servicio de API (`usuarios.api.ts`). Ahora vamos a crear la pantalla visual para que el rol `ADMIN` pueda ver la lista de usuarios, y agregaremos el acceso en el menú lateral.

## Objetivo

1. Agregar el enlace "Manejo de Usuarios" en el `DashboardLayout` (solo visible para ADMIN).
2. Crear la página `src/pages/AdminUsuarios.tsx` con una tabla que consuma los datos reales.
3. Proteger la ruta para que solo los ADMIN puedan entrar.

## Lo que debés hacer

### 1. Actualizar `src/layouts/DashboardLayout.tsx`

Agregar el import del ícono `Users` de `lucide-react`.
Dentro del `<nav>` del Sidebar, después del enlace a Biblioteca, agregar este bloque condicional:

```tsx
{
  user?.role === "ADMIN" && (
    <Link
      to="/admin/usuarios"
      className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors"
    >
      <Users className="w-5 h-5" />
      Manejo de Usuarios
    </Link>
  );
}
```

### 2. Crear `src/pages/AdminUsuarios.tsx`

Crear la pantalla con una tabla básica. Usaremos el hook `useEffect` para traer los datos:

```tsx
// src/pages/AdminUsuarios.tsx
import { useEffect, useState } from "react";
import { getUsuarios } from "../api/usuarios.api";
import type { User } from "../types/user.types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Loader2, Plus } from "lucide-react";

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await getUsuarios();
        setUsuarios(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar usuarios");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Administra las cuentas del sistema
          </p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-institucional-500" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4 font-medium">Usuario</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Rol</th>
                  <th className="py-3 px-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {u.first_name} {u.last_name} <br />
                      <span className="text-xs text-gray-400 font-normal">
                        @{u.username}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-institucional-50 text-institucional-700 text-xs font-semibold rounded-full">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${u.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
```

### 3. Actualizar `src/routes/AppRoutes.tsx`

Importar `AdminUsuarios` y `RoleRoute`. Agregar la ruta protegida dentro del `DashboardLayout`:

```tsx
import { RoleRoute } from "./RoleRoute";
import { AdminUsuarios } from "../pages/AdminUsuarios";

// ... dentro del <Route path="/" element={<DashboardLayout />}>

{
  /* Ruta exclusiva para ADMIN */
}
<Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
  <Route path="admin/usuarios" element={<AdminUsuarios />} />
</Route>;
```

### 4. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No crees el formulario modal para crear/editar usuarios todavía (lo haremos en la siguiente tarea).
- No modifiques la lógica de autenticación.

## Respuesta esperada

Confirmame que la tabla y la ruta están creadas, y si `npm run build` pasó o falló.

# Tarea 28: Implementar datos Mock (falsos) para la tabla de usuarios

## Contexto

El backend aún no tiene implementada la ruta `/api/usuarios` (lo está haciendo otro compañero). Para no frenar el desarrollo del frontend, vamos a simular la respuesta de la API con datos falsos (mocking).

## Objetivo

Modificar `src/api/usuarios.api.ts` para que la función `getUsuarios` devuelva datos simulados en lugar de hacer la petición HTTP real.

## Lo que debés hacer

### 1. Sobrescribir `src/api/usuarios.api.ts`

Reemplazar todo el contenido del archivo con este código. Nota cómo envolvemos los datos en un `Promise` con un `setTimeout` para simular la latencia de red (así veremos el spinner de carga):

```typescript
// src/api/usuarios.api.ts
import { axiosClient } from "./axiosClient";
import type { ApiResponse, Paginated } from "../types/api.types";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/user.types";

// ==========================================
// MOCK DE DATOS (Temporal hasta que el backend esté listo)
// ==========================================
const MOCK_USERS: User[] = [
  {
    id: 1,
    username: "admin_hief",
    email: "admin@hief.gob.ar",
    first_name: "Admin",
    last_name: "Sistema",
    role: "ADMIN",
    specialtyId: null,
    must_change_password: false,
    active: true,
  },
  {
    id: 2,
    username: "dr_laprida",
    email: "fernando@hief.gob.ar",
    first_name: "Fernando",
    last_name: "Laprida",
    role: "AUTOR",
    specialtyId: 1,
    must_change_password: false,
    active: true,
  },
  {
    id: 3,
    username: "dra_gonzalez",
    email: "maria@hief.gob.ar",
    first_name: "María",
    last_name: "Gonzalez",
    role: "COMITE",
    specialtyId: 2,
    must_change_password: false,
    active: true,
  },
  {
    id: 4,
    username: "dr_short",
    email: "lautaro@hief.gob.ar",
    first_name: "Lautaro",
    last_name: "Short",
    role: "AUTOR",
    specialtyId: 1,
    must_change_password: false,
    active: false,
  },
];

// Listar usuarios (MOCK)
export const getUsuarios = async (): Promise<User[]> => {
  // Simulamos un retraso de 800ms para ver el spinner
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USERS);
    }, 800);
  });

  /*
  // CÓDIGO REAL (Descomentar cuando el backend esté listo)
  const { data } = await axiosClient.get<ApiResponse<Paginated<User>>>('/usuarios');
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al obtener usuarios');
  }
  return data.data.items;
  */
};

// Crear usuario (MOCK temporal)
export const createUsuario = async (
  payload: CreateUserRequest,
): Promise<User> => {
  console.log("Mock: Creando usuario", payload);
  const newUser: User = {
    id: Math.random(),
    username: payload.username,
    email: payload.email,
    first_name: payload.first_name,
    last_name: payload.last_name,
    role: payload.role,
    specialtyId: payload.specialtyId || null,
    must_change_password: true,
    active: true,
  };
  MOCK_USERS.push(newUser);
  return newUser;
};

// Actualizar usuario (Se deja preparado para el backend real)
export const updateUsuario = async (
  id: number,
  payload: UpdateUserRequest,
): Promise<User> => {
  const { data } = await axiosClient.put<ApiResponse<User>>(
    `/usuarios/${id}`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al actualizar usuario");
  }
  return data.data;
};

// Dar de baja (Se deja preparado para el backend real)
export const deleteUsuario = async (id: number): Promise<void> => {
  const { data } = await axiosClient.delete<ApiResponse<void>>(
    `/usuarios/${id}`,
  );
  if (!data.success) {
    throw new Error(data.error || "Error al dar de baja al usuario");
  }
};
```

### 2. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No modifiques la pantalla `AdminUsuarios.tsx` (debería funcionar sola con este mock).
- No modifiques el backend.

## Respuesta esperada

Confirmame que el archivo fue modificado y si `npm run build` pasó o falló.

# Tarea 29: Agregar menú de 3 puntos (acciones) a la tabla de usuarios

## Contexto

Tenemos la tabla de usuarios funcionando con datos mock. Ahora necesitamos agregar un menú desplegable (tres puntos) al lado de cada usuario para que el Admin pueda "Suspender cuenta" o "Reiniciar contraseña".

## Objetivo

1. Actualizar `src/api/usuarios.api.ts` para agregar la función mock `resetPassword`.
2. Modificar `src/pages/AdminUsuarios.tsx` para incluir el menú desplegable.

## Lo que debés hacer

### 1. Actualizar `src/api/usuarios.api.ts`

Agregar esta función al final del archivo (simulando la respuesta del backend):

```typescript
// Reiniciar contraseña (MOCK)
export const resetPassword = async (id: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Mock: Contraseña reiniciada para el usuario ${id}`);
      resolve();
    }, 500);
  });
};
```

### 2. Modificar `src/pages/AdminUsuarios.tsx`

Necesitamos importar el ícono de los tres puntos (`MoreVertical`), agregar estados para manejar qué menú está abierto y crear las funciones de acción.

Reemplazar el archivo con este código:

```tsx
// src/pages/AdminUsuarios.tsx
import { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario, resetPassword } from "../api/usuarios.api";
import type { User } from "../types/user.types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Loader2, Plus, MoreVertical, Ban, Key } from "lucide-react";

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSuspend = async (id: number) => {
    if (window.confirm("¿Estás seguro de suspender esta cuenta?")) {
      try {
        await deleteUsuario(id); // Usamos la función de baja lógica existente
        // Actualizamos la tabla localmente para reflejar el cambio rápido
        setUsuarios(
          usuarios.map((u) => (u.id === id ? { ...u, active: false } : u)),
        );
      } catch (err) {
        alert("Error al suspender usuario");
      }
    }
    setOpenMenuId(null);
  };

  const handleResetPassword = async (id: number) => {
    if (
      window.confirm("¿Generar nueva contraseña genérica para este usuario?")
    ) {
      try {
        await resetPassword(id);
        alert(
          "Contraseña reiniciada con éxito. Se envió un correo al usuario.",
        );
      } catch (err) {
        alert("Error al reiniciar contraseña");
      }
    }
    setOpenMenuId(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Administra las cuentas del sistema
          </p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-institucional-500" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4 font-medium">Usuario</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Rol</th>
                  <th className="py-3 px-4 font-medium">Estado</th>
                  <th className="py-3 px-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-gray-50 relative"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {u.first_name} {u.last_name} <br />
                      <span className="text-xs text-gray-400 font-normal">
                        @{u.username}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-institucional-50 text-institucional-700 text-xs font-semibold rounded-full">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${u.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {u.active ? "Activo" : "Suspendido"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === u.id ? null : u.id)
                        }
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Menú Desplegable */}
                      {openMenuId === u.id && (
                        <div className="absolute right-8 top-10 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1">
                          <button
                            onClick={() => handleResetPassword(u.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Key className="w-4 h-4 text-blue-500" /> Reiniciar
                            contraseña
                          </button>
                          {u.active && (
                            <button
                              onClick={() => handleSuspend(u.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Ban className="w-4 h-4" /> Suspender cuenta
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
```

### 3. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No crees el modal para "Nuevo Usuario" todavía.
- No modifiques el contexto de autenticación.

## Respuesta esperada

Confirmame que el archivo fue creado y decime si `npm run build` pasó o falló.

# Tarea 30: Arreglar posición y diseño del menú desplegable de usuarios

## Contexto

La tabla de usuarios tiene un menú de 3 puntos. Tiene dos problemas visuales:

1. El texto "Reiniciar contraseña" se rompe en dos líneas porque el menú es muy angosto.
2. En la última fila de la tabla, el menú se abre hacia abajo y se sale de la pantalla.

## Objetivo

Modificar `src/pages/AdminUsuarios.tsx` para:

1. Evitar que el texto se rompa (`whitespace-nowrap` y un ancho mayor).
2. Hacer que el menú de las **últimas filas** se abra hacia arriba en lugar de hacia abajo para que no se salga de la pantalla.
3. Arreglar el anillo amarillo de foco que aparece al hacer clic en el botón de 3 puntos.

## Lo que debés hacer

### 1. Sobrescribir `src/pages/AdminUsuarios.tsx`

Aquí está el código con las correcciones aplicadas:

```tsx
import { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario, resetPassword } from "../api/usuarios.api";
import type { User } from "../types/user.types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Loader2, Plus, MoreVertical, Ban, Key } from "lucide-react";

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSuspend = async (id: number) => {
    if (window.confirm("¿Estás seguro de suspender esta cuenta?")) {
      try {
        await deleteUsuario(id);
        setUsuarios(
          usuarios.map((u) => (u.id === id ? { ...u, active: false } : u)),
        );
      } catch (err) {
        alert("Error al suspender usuario");
      }
    }
    setOpenMenuId(null);
  };

  const handleResetPassword = async (id: number) => {
    if (
      window.confirm("¿Generar nueva contraseña genérica para este usuario?")
    ) {
      try {
        await resetPassword(id);
        alert(
          "Contraseña reiniciada con éxito. Se envió un correo al usuario.",
        );
      } catch (err) {
        alert("Error al reiniciar contraseña");
      }
    }
    setOpenMenuId(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Administra las cuentas del sistema
          </p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-institucional-500" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4 font-medium">Usuario</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Rol</th>
                  <th className="py-3 px-4 font-medium">Estado</th>
                  <th className="py-3 px-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, index) => {
                  // Lógica para saber si es una de las últimas filas
                  const isNearBottom = index >= usuarios.length - 2;

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-gray-100 hover:bg-gray-50 relative"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {u.first_name} {u.last_name} <br />
                        <span className="text-xs text-gray-400 font-normal">
                          @{u.username}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-institucional-50 text-institucional-700 text-xs font-semibold rounded-full">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${u.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {u.active ? "Activo" : "Suspendido"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === u.id ? null : u.id)
                          }
                          // Se quita el focus ring por defecto para que no quede el anillo amarillo
                          className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors focus:outline-none"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Menú Desplegable Mejorado */}
                        {openMenuId === u.id && (
                          <div
                            className={`absolute right-8 w-56 bg-white border border-gray-200 rounded-md shadow-xl z-50 py-1 ${
                              isNearBottom ? "bottom-10 mb-1" : "top-10 mt-1"
                            }`}
                          >
                            <button
                              onClick={() => handleResetPassword(u.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                            >
                              <Key className="w-4 h-4 text-blue-500" />{" "}
                              Reiniciar contraseña
                            </button>
                            {u.active && (
                              <button
                                onClick={() => handleSuspend(u.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 whitespace-nowrap"
                              >
                                <Ban className="w-4 h-4" /> Suspender cuenta
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
```

### 2. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No modifiques la lógica de negocio ni los servicios API.
- No avances con nada más.

## Respuesta esperada

Confirmame que el archivo fue modificado y si `npm run build` pasó o falló.

# Tarea 31: Mejorar el estilo del botón de 3 puntos en la tabla

## Contexto

En `src/pages/AdminUsuarios.tsx`, el botón de 3 puntos es muy sutil y no parece clickeable. Queremos darle un fondo y borde sutil usando el color verde/institucional para indicar que es una acción disponible.

## Objetivo

Modificar la clase del botón del menú desplegable en `src/pages/AdminUsuarios.tsx`.

## Lo que debés hacer

### 1. Modificar `src/pages/AdminUsuarios.tsx`

Buscar la etiqueta `<button>` que contiene el ícono `<MoreVertical />` (dentro del `<td>` de Acciones) y reemplazar su `className` por este:

```tsx
className =
  "p-1.5 rounded-md border border-institucional-200 bg-institucional-50 text-institucional-600 hover:bg-institucional-100 hover:text-institucional-700 transition-colors focus:outline-none";
```

_(Nota: Si el color verde de tu proyecto se llama diferente en Tailwind, adaptalo, pero por lo que vi en tu captura usás la paleta institucional)._

### 2. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que el estilo fue aplicado y si `npm run build` pasó o falló.

# Tarea 32: Backend - Implementar módulo de Usuarios

## Contexto

El frontend ya tiene la pantalla de Gestión de Usuarios (con mocks). Ahora vamos a implementar la lógica real en el backend usando TypeScript, Express y Sequelize.

## Objetivo

Crear el controlador y las rutas en `backend/src/modules/usuarios/` para listar, crear, suspender y resetear contraseñas. Todo protegido para el rol `ADMIN`.

## Lo que debés hacer

### 1. Crear `backend/src/modules/usuarios/usuarios.controller.ts`

```typescript
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Usuario } from "./Usuario.model";
import { Rol } from "./Rol.model";

// Listar todos los usuarios
export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["password"] },
      include: [{ model: Rol, as: "role" }],
    });

    return res.status(200).json({
      success: true,
      data: {
        items: usuarios,
        total: usuarios.length,
        page: 1,
        limit: usuarios.length,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error al obtener usuarios" });
  }
};

// Crear nuevo usuario (Contraseña genérica)
export const createUsuario = async (req: Request, res: Response) => {
  try {
    const { username, email, first_name, last_name, role, specialtyId } =
      req.body;

    // Contraseña genérica inicial (ej: Hief2026!)
    const genericPassword = "Hief2026!";
    const hashedPassword = await bcrypt.hash(genericPassword, 10);

    const nuevoUsuario = await Usuario.create({
      username,
      email,
      first_name,
      last_name,
      password: hashedPassword,
      roleId: role, // Asumiendo que el frontend manda el ID del rol o el nombre
      specialtyId,
      must_change_password: true, // Obliga a cambiarla en el primer login
      active: true,
    });

    return res.status(201).json({ success: true, data: nuevoUsuario });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error al crear usuario" });
  }
};

// Baja lógica (Suspender)
export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Usuario.update({ active: false }, { where: { id } });
    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error al suspender usuario" });
  }
};

// Reiniciar contraseña
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const genericPassword = "Hief2026!";
    const hashedPassword = await bcrypt.hash(genericPassword, 10);

    await Usuario.update(
      { password: hashedPassword, must_change_password: true },
      { where: { id } },
    );

    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error al reiniciar contraseña" });
  }
};
```

### 2. Crear `backend/src/modules/usuarios/usuarios.routes.ts`

```typescript
import { Router } from "express";
import {
  getUsuarios,
  createUsuario,
  deleteUsuario,
  resetPassword,
} from "./usuarios.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";

const router = Router();

// Todas estas rutas requieren estar logueado Y ser ADMIN
router.use(authMiddleware);
router.use(roleMiddleware(["ADMIN"]));

router.get("/", getUsuarios);
router.post("/", createUsuario);
router.delete("/:id", deleteUsuario);
router.post("/:id/reset-password", resetPassword);

export default router;
```

### 3. Registrar la ruta en el servidor

En tu archivo principal (usualmente `backend/src/app.ts` o `server.ts`), donde se configuran las rutas:

```typescript
import usuariosRoutes from "./modules/usuarios/usuarios.routes";
// ...
app.use("/api/usuarios", usuariosRoutes);
```

### 4. Verificación

- Correr `npm run build` en el backend para asegurar que no haya errores de TS.

## Lo que NO debés hacer

- No modifiques el frontend en esta tarea.
- No crees la lógica de cambio de contraseña para el usuario (eso lo haremos después).

## Respuesta esperada

Confirmame que los archivos fueron creados, si registraste la ruta, y si compila sin errores.

# Tarea 33: Eliminar los mocks y conectar con la API real de usuarios

## Contexto

El backend ya tiene implementadas las rutas para gestionar usuarios (`/api/usuarios`). Es hora de eliminar los datos simulados (MOCK_USERS) que usamos para pruebas visuales y dejar el archivo listo para hacer las peticiones HTTP reales.

## Objetivo

Sobrescribir `src/api/usuarios.api.ts` para eliminar todos los mocks y usar `axiosClient` en todas las funciones.

## Lo que debés hacer

### 1. Sobrescribir `src/api/usuarios.api.ts`

Reemplazar todo el contenido del archivo con este código final:

```typescript
// src/api/usuarios.api.ts
import { axiosClient } from "./axiosClient";
import type { ApiResponse, Paginated } from "../types/api.types";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/user.types";

// Listar usuarios (Admin)
export const getUsuarios = async (): Promise<User[]> => {
  const { data } =
    await axiosClient.get<ApiResponse<Paginated<User>>>("/usuarios");
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al obtener usuarios");
  }
  return data.data.items;
};

// Crear usuario (Admin)
export const createUsuario = async (
  payload: CreateUserRequest,
): Promise<User> => {
  const { data } = await axiosClient.post<ApiResponse<User>>(
    "/usuarios",
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al crear usuario");
  }
  return data.data;
};

// Actualizar usuario (Admin)
export const updateUsuario = async (
  id: number,
  payload: UpdateUserRequest,
): Promise<User> => {
  const { data } = await axiosClient.put<ApiResponse<User>>(
    `/usuarios/${id}`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al actualizar usuario");
  }
  return data.data;
};

// Dar de baja (Lógica) (Admin)
export const deleteUsuario = async (id: number): Promise<void> => {
  const { data } = await axiosClient.delete<ApiResponse<void>>(
    `/usuarios/${id}`,
  );
  if (!data.success) {
    throw new Error(data.error || "Error al suspender usuario");
  }
};

// Reiniciar contraseña (Admin)
export const resetPassword = async (id: number): Promise<void> => {
  const { data } = await axiosClient.post<ApiResponse<void>>(
    `/usuarios/${id}/reset-password`,
  );
  if (!data.success) {
    throw new Error(data.error || "Error al reiniciar contraseña");
  }
};
```

### 2. Verificación

- Correr `npm run build`.
- Si el backend está corriendo, iniciar sesión como ADMIN, ir a "Manejo de Usuarios" y comprobar que la tabla carga los datos reales.

## Lo que NO debés hacer

- No modifiques la pantalla `AdminUsuarios.tsx` (la lógica de los botones y el diseño ya están bien).
- No modifiques el backend.

## Respuesta esperada

Confirmame que el archivo fue actualizado y si `npm run build` pasó.

# Tarea 34: Crear el Modal para registrar un nuevo usuario

## Contexto

El Admin necesita poder crear usuarios genéricos (Alta). Vamos a crear un componente reutilizable `Modal` y luego armar el formulario de creación dentro de `AdminUsuarios.tsx`. El backend ya se encarga de generar la contraseña genérica y marcar `must_change_password: true`.

## Objetivo

1. Crear `src/components/ui/Modal.tsx`.
2. Modificar `src/pages/AdminUsuarios.tsx` para abrir el modal al hacer clic en "Nuevo Usuario" y enviar los datos a la API.

## Lo que debés hacer

### 1. Crear `src/components/ui/Modal.tsx`

```tsx
// src/components/ui/Modal.tsx
import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
```

### 2. Modificar `src/pages/AdminUsuarios.tsx`

Vamos a agregar el estado del modal y el formulario.

```tsx
// src/pages/AdminUsuarios.tsx
import { useEffect, useState } from "react";
import {
  getUsuarios,
  deleteUsuario,
  resetPassword,
  createUsuario,
} from "../api/usuarios.api";
import type { User, CreateUserRequest } from "../types/user.types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Loader2, Plus, MoreVertical, Ban, Key } from "lucide-react";
import { useForm } from "../hooks/useForm";

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState("");

  const { formulario, handleChange, resetForm } = useForm({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "AUTOR", // Rol por defecto
  });

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSuspend = async (id: number) => {
    if (window.confirm("¿Estás seguro de suspender esta cuenta?")) {
      try {
        await deleteUsuario(id);
        setUsuarios(
          usuarios.map((u) => (u.id === id ? { ...u, active: false } : u)),
        );
      } catch (err) {
        alert("Error al suspender usuario");
      }
    }
    setOpenMenuId(null);
  };

  const handleResetPassword = async (id: number) => {
    if (
      window.confirm("¿Generar nueva contraseña genérica para este usuario?")
    ) {
      try {
        await resetPassword(id);
        alert("Contraseña reiniciada con éxito.");
      } catch (err) {
        alert("Error al reiniciar contraseña");
      }
    }
    setOpenMenuId(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (
      !formulario.username ||
      !formulario.email ||
      !formulario.first_name ||
      !formulario.last_name
    ) {
      setModalError("Todos los campos son obligatorios");
      return;
    }

    setIsCreating(true);
    try {
      await createUsuario(formulario as unknown as CreateUserRequest);
      await fetchUsuarios(); // Recargamos la tabla
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setModalError(err.message || "Error al crear usuario");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Administra las cuentas del sistema
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        {/* ... Aquí va el mismo código de la tabla que ya tenías ... */}
        {/* (El agente debe mantener el map de usuarios y los menús de 3 puntos) */}
      </Card>

      {/* MODAL DE CREACIÓN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
          setModalError("");
        }}
        title="Registrar Nuevo Usuario"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              name="first_name"
              value={formulario.first_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Apellido"
              name="last_name"
              value={formulario.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Nombre de Usuario"
            name="username"
            value={formulario.username}
            onChange={handleChange}
            placeholder="ej: jperez"
            required
          />
          <Input
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formulario.email}
            onChange={handleChange}
            placeholder="correo@hief.gob.ar"
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">
              Rol del Sistema
            </label>
            <select
              name="role"
              value={formulario.role}
              onChange={handleChange}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-institucional-500"
            >
              <option value="AUTOR">Autor</option>
              <option value="COMITE">Miembro del Comité</option>
              <option value="DDI">Docencia e Investigación</option>
              <option value="PUBLISHER">Encargado de Publicación</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            * Se generará una contraseña genérica automáticamente. El usuario
            deberá cambiarla al iniciar sesión.
          </p>

          {modalError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {modalError}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating}>
              Crear Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
```

### 3. Verificación

- Correr `npm run build`.

## Lo que NO debés hacer

- No modifiques el backend ni `usuarios.api.ts`.
- No modifiques el `AuthContext` todavía.

## Respuesta esperada

Confirmame que los archivos fueron modificados y si `npm run build` pasó o falló.

# Tarea 35: Arreglar estilos de botones y verificar modal

## Contexto

1. Los botones `primary` se están viendo con fondo blanco y texto blanco (invisibles). Esto pasa porque las clases `bg-institucional-600` no están compilando bien o no existen en el tema actual.
2. En el modal de "Nuevo Usuario", el usuario reporta que no ve el botón para confirmar la creación (probablemente por el mismo problema de color).

## Objetivo

1. Corregir el componente `Button.tsx` usando colores estándar de Tailwind (como `blue-600`) para asegurar que se vean.
2. Verificar que el botón "Crear Usuario" esté presente en el modal de `AdminUsuarios.tsx`.

## Lo que debés hacer

### 1. Sobrescribir `src/components/ui/Button.tsx`

```tsx
// src/components/ui/Button.tsx
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center px-4 py-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Usamos colores estándar de Tailwind (blue-600) para garantizar visibilidad
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
```

### 2. Revisar `src/pages/AdminUsuarios.tsx`

Verificar que, dentro del `<form>` del `<Modal>`, al final, estén los dos botones. Si falta el de "Crear Usuario", agregarlo. Debería verse así:

```tsx
<div className="flex justify-end gap-3 mt-4">
  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
    Cancelar
  </Button>
  <Button type="submit" variant="primary" isLoading={isCreating}>
    Crear Usuario
  </Button>
</div>
```

Si falta el botón de "Crear Usuario" (`type="submit"`), agregalo.

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que el archivo fue modificado y si `npm run build` pasó.

# Tarea 36: Suavizar color de botones y mostrar credenciales de creación

## Contexto

1. El botón `primary` con `bg-blue-600` es demasiado fuerte visualmente para el diseño del sistema.
2. Al crear un usuario, el backend genera una contraseña genérica (ej. "Hief2026!"), pero el Admin no la ve, por lo que no puede pasarle los datos al nuevo usuario.

## Objetivo

1. Suavizar el color del botón `primary`.
2. Mostrar un alert o un mensaje en pantalla con las credenciales generadas al momento de crear el usuario.

## Lo que debés hacer

### 1. Suavizar el color del botón en `src/components/ui/Button.tsx`

Buscar la variante `primary` y cambiarla a un tono más suave (blue-500 o el institucional-500):

```tsx
const variants = {
  // Cambiamos bg-blue-600 a bg-blue-500
  primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
  danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
};
```

### 2. Mostrar credenciales en `src/pages/AdminUsuarios.tsx`

En la función `handleCreateSubmit`, después de crear el usuario exitosamente y recargar la tabla, debemos mostrarle al Admin la contraseña.

_(Nota: Como el backend actualmente genera la contraseña fija `Hief2026!`, usaremos ese texto para el mensaje)._

Modificar la función `handleCreateSubmit` así:

```tsx
const handleCreateSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setModalError("");

  if (
    !formulario.username ||
    !formulario.email ||
    !formulario.first_name ||
    !formulario.last_name
  ) {
    setModalError("Todos los campos son obligatorios");
    return;
  }

  setIsCreating(true);
  try {
    await createUsuario(formulario as unknown as CreateUserRequest);
    await fetchUsuarios(); // Recargamos la tabla

    // MOSTRAMOS LAS CREDENCIALES AL ADMIN
    alert(
      `¡Usuario creado exitosamente!\n\nUsuario: ${formulario.username}\nContraseña temporal: Hief2026!\n\nPor favor, comparta estos datos con el usuario.`,
    );

    setIsModalOpen(false);
    resetForm();
  } catch (err: any) {
    setModalError(err.message || "Error al crear usuario");
  } finally {
    setIsCreating(false);
  }
};
```

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los cambios fueron aplicados y si `npm run build` pasó o falló.

# Tarea 37: Mostrar contraseña generada con botón de copiar

## Contexto

Al crear un usuario, el backend genera una contraseña aleatoria segura y la devuelve en la respuesta. En lugar de mostrar un `alert` (donde es imposible copiar el texto), queremos mostrar un estado de "Éxito" dentro del mismo Modal, con la contraseña en un input de solo lectura y un botón para copiar al portapapeles.

## Objetivo

1. Modificar `src/pages/AdminUsuarios.tsx` para capturar la contraseña que devuelve el backend.
2. Mostrar un mensaje de éxito en el modal con un botón de "Copiar" usando `navigator.clipboard`.

## Lo que debés hacer

### 1. Asumir la estructura del backend

Vamos a asumir que tu compañero configuró el backend para devolver algo así:

```json
{
  "success": true,
  "data": {
    "usuario": { ... },
    "tempPassword": "UNVitDzWIOEJZ_DnEv3y6GE9"
  }
}
```

_(Si el backend devuelve la contraseña en otro campo, como `password` o dentro del mismo objeto usuario, el agente deberá adaptar la variable `tempPassword`)._

### 2. Modificar `src/api/usuarios.api.ts`

Ajustar la función `createUsuario` para que devuelva el tipo correcto:

```typescript
export const createUsuario = async (
  payload: CreateUserRequest,
): Promise<{ usuario: User; tempPassword: string }> => {
  const { data } = await axiosClient.post<
    ApiResponse<{ usuario: User; tempPassword: string }>
  >("/usuarios", payload);
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al crear usuario");
  }
  return data.data;
};
```

### 3. Modificar `src/pages/AdminUsuarios.tsx`

Necesitamos estados para guardar la contraseña generada y saber si acabamos de crear el usuario.

Agregar los estados al inicio:

```tsx
const [createdPassword, setCreatedPassword] = useState<string | null>(null);
const [isCopied, setIsCopied] = useState(false);
```

Modificar `handleCreateSubmit`:

```tsx
const handleCreateSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setModalError("");

  if (
    !formulario.username ||
    !formulario.email ||
    !formulario.first_name ||
    !formulario.last_name
  ) {
    setModalError("Todos los campos son obligatorios");
    return;
  }

  setIsCreating(true);
  try {
    const response = await createUsuario(
      formulario as unknown as CreateUserRequest,
    );
    await fetchUsuarios();

    // En lugar del alert, guardamos la contraseña y mostramos la pantalla de éxito
    setCreatedPassword(response.tempPassword);
  } catch (err: any) {
    setModalError(err.message || "Error al crear usuario");
  } finally {
    setIsCreating(false);
  }
};

const handleCopyPassword = () => {
  if (createdPassword) {
    navigator.clipboard.writeText(createdPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Vuelve al texto original después de 2s
  }
};

const closeModal = () => {
  setIsModalOpen(false);
  resetForm();
  setModalError("");
  setCreatedPassword(null); // Limpiamos la contraseña al cerrar
};
```

### 4. Actualizar el `<Modal>` en `AdminUsuarios.tsx`

Cambiar el contenido del Modal para que muestre el formulario o el mensaje de éxito dependiendo del estado:

```tsx
<Modal
  isOpen={isModalOpen}
  onClose={closeModal}
  title={createdPassword ? "¡Usuario Creado!" : "Registrar Nuevo Usuario"}
>
  {createdPassword ? (
    // PANTALLA DE ÉXITO
    <div className="flex flex-col gap-4 text-center">
      <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
        <CheckCircle className="w-6 h-6" />
      </div>
      <p className="text-gray-600 text-sm">
        El usuario{" "}
        <strong className="text-gray-900">{formulario.username}</strong> fue
        creado correctamente.
      </p>

      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-left">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Contraseña Temporal
        </label>
        <div className="flex items-center justify-between mt-1">
          <code className="text-sm font-mono text-gray-800 select-all">
            {createdPassword}
          </code>
          <button
            onClick={handleCopyPassword}
            className="ml-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Copiar contraseña"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Asegúrate de guardar o enviar esta contraseña. No se volverá a mostrar.
      </p>

      <Button
        type="button"
        variant="primary"
        onClick={closeModal}
        className="mt-2 w-full"
      >
        Entendido
      </Button>
    </div>
  ) : (
    // FORMULARIO (El mismo de la tarea anterior)
    <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
      {/* ... Aquí va el mismo formulario de la tarea 34 ... */}
    </form>
  )}
</Modal>
```

**Importante:** No olvides importar los íconos `CheckCircle`, `Copy` y `Check` de `lucide-react` al inicio del archivo.

### 5. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron modificados y si `npm run build` pasó.

# Tarea 38 (Corregida): Actualizar roles a STAFF/EDITOR, atributo autor y edición

## Contexto

El sistema cambió sus reglas de negocio:

1. El rol `AUTOR` desaparece. Ahora los profesionales base son `STAFF`.
2. Tener permiso para publicar ahora es un atributo booleano llamado `is_author`.
3. Los nuevos roles son: `'STAFF' | 'DDI' | 'COMITE' | 'EDITOR' | 'ADMIN'`.
4. El Admin debe poder editar usuarios y reactivar cuentas suspendidas.

## Objetivo

1. Actualizar `src/types/user.types.ts`.
2. Actualizar `src/api/usuarios.api.ts`.
3. Actualizar `src/pages/AdminUsuarios.tsx` (Formulario con Checkbox de Autor y menú de acciones con Editar y Reactivar).

## Lo que debés hacer

### 1. Sobrescribir `src/types/user.types.ts`

```typescript
export type UserRole = "STAFF" | "DDI" | "COMITE" | "EDITOR" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_author: boolean;
  specialtyId: number | null;
  must_change_password: boolean;
  dni?: string | null;
  active: boolean;
  createdAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_author: boolean;
  specialtyId?: number | null;
  dni?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_author?: boolean;
  specialtyId?: number | null;
  dni?: string;
  active?: boolean;
}
```

### 2. Actualizar `src/api/usuarios.api.ts`

Asegurate de que la función `updateUsuario` esté correcta:

```typescript
export const updateUsuario = async (
  id: number,
  payload: UpdateUserRequest,
): Promise<User> => {
  const { data } = await axiosClient.put<ApiResponse<User>>(
    `/usuarios/${id}`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al actualizar usuario");
  }
  return data.data;
};
```

### 3. Sobrescribir `src/pages/AdminUsuarios.tsx`

```tsx
// src/pages/AdminUsuarios.tsx
import { useEffect, useState } from "react";
import {
  getUsuarios,
  deleteUsuario,
  resetPassword,
  createUsuario,
  updateUsuario,
} from "../api/usuarios.api";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/user.types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import {
  Loader2,
  Plus,
  MoreVertical,
  Ban,
  Key,
  CheckCircle,
  Copy,
  Check,
  Edit,
  UserCheck,
} from "lucide-react";
import { useForm } from "../hooks/useForm";

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState("");
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { formulario, handleChange, resetForm, setFormulario } = useForm({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "STAFF",
    is_author: false,
  });

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const openCreateModal = () => {
    resetForm();
    setEditingUserId(null);
    setCreatedPassword(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setFormulario({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_author: user.is_author,
    });
    setEditingUserId(user.id);
    setCreatedPassword(null);
    setModalError("");
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSuspend = async (id: number) => {
    if (window.confirm("¿Suspender esta cuenta?")) {
      try {
        await updateUsuario(id, { active: false });
        setUsuarios(
          usuarios.map((u) => (u.id === id ? { ...u, active: false } : u)),
        );
      } catch (err) {
        alert("Error al suspender");
      }
    }
    setOpenMenuId(null);
  };

  const handleReactivate = async (id: number) => {
    if (window.confirm("¿Reactivar esta cuenta?")) {
      try {
        await updateUsuario(id, { active: true });
        setUsuarios(
          usuarios.map((u) => (u.id === id ? { ...u, active: true } : u)),
        );
      } catch (err) {
        alert("Error al reactivar");
      }
    }
    setOpenMenuId(null);
  };

  const handleResetPassword = async (id: number) => {
    if (window.confirm("¿Generar nueva contraseña?")) {
      try {
        await resetPassword(id);
        alert("Contraseña reiniciada con éxito.");
      } catch (err) {
        alert("Error al reiniciar contraseña");
      }
    }
    setOpenMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    if (
      !formulario.username ||
      !formulario.email ||
      !formulario.first_name ||
      !formulario.last_name
    ) {
      setModalError("Todos los campos son obligatorios");
      return;
    }

    setIsCreating(true);
    try {
      if (editingUserId) {
        // EDITAR
        await updateUsuario(editingUserId, formulario as UpdateUserRequest);
        await fetchUsuarios();
        setIsModalOpen(false);
      } else {
        // CREAR
        const response = await createUsuario(
          formulario as unknown as CreateUserRequest,
        );
        await fetchUsuarios();
        setCreatedPassword(response.tempPassword || "Revisar sistema");
      }
    } catch (err: any) {
      setModalError(err.message || "Error en la operación");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyPassword = () => {
    if (createdPassword) {
      navigator.clipboard.writeText(createdPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Usuarios
          </h1>
        </div>
        <Button
          onClick={openCreateModal}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Rol / Autor</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, index) => {
                  const isNearBottom = index >= usuarios.length - 2;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-gray-100 hover:bg-gray-50 relative"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">
                          {u.first_name} {u.last_name}
                        </span>
                        <br />
                        <span className="text-xs text-gray-400">
                          @{u.username}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mr-2">
                          {u.role}
                        </span>
                        {u.is_author && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Autor
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${u.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {u.active ? "Activo" : "Suspendido"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === u.id ? null : u.id)
                          }
                          className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 focus:outline-none"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {openMenuId === u.id && (
                          <div
                            className={`absolute right-8 w-52 bg-white border border-gray-200 rounded-md shadow-xl z-50 py-1 ${isNearBottom ? "bottom-10" : "top-10"}`}
                          >
                            <button
                              onClick={() => openEditModal(u)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4 text-blue-500" /> Editar
                            </button>
                            <button
                              onClick={() => handleResetPassword(u.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Key className="w-4 h-4 text-blue-500" />{" "}
                              Reiniciar clave
                            </button>
                            {u.active ? (
                              <button
                                onClick={() => handleSuspend(u.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Ban className="w-4 h-4" /> Suspender
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(u.id)}
                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <UserCheck className="w-4 h-4" /> Reactivar
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          createdPassword
            ? "¡Usuario Creado!"
            : editingUserId
              ? "Editar Usuario"
              : "Registrar Usuario"
        }
      >
        {createdPassword ? (
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Contraseña Temporal
              </label>
              <div className="flex items-center justify-between mt-1">
                <code className="text-sm font-mono text-gray-800 select-all">
                  {createdPassword}
                </code>
                <button
                  onClick={handleCopyPassword}
                  className="ml-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-2"
            >
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                name="first_name"
                value={formulario.first_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido"
                name="last_name"
                value={formulario.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label="Usuario"
              name="username"
              value={formulario.username}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formulario.email}
              onChange={handleChange}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700">
                Rol Principal
              </label>
              <select
                name="role"
                value={formulario.role}
                onChange={handleChange}
                className="px-3 py-2 border rounded-md"
              >
                <option value="STAFF">Staff (Médico/Profesional)</option>
                <option value="COMITE">Comité Científico</option>
                <option value="DDI">Docencia e Investigación</option>
                <option value="EDITOR">Editor de Publicación</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="is_author"
                name="is_author"
                checked={formulario.is_author}
                onChange={(e) =>
                  setFormulario({ ...formulario, is_author: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="is_author"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Habilitar como Autor (puede publicar artículos)
              </label>
            </div>

            {modalError && (
              <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreating}>
                {editingUserId ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
```

### 4. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron actualizados y si `npm run build` pasó.

# Tarea 39 (Backend): Crear endpoint PUT /api/usuarios/:id

## Contexto

El frontend ya está enviando la petición para editar un usuario (`PUT /api/usuarios/:id`), pero el backend no tiene esta ruta implementada. Necesitamos crearla para actualizar los datos, el rol y el estado de autor.

## Objetivo

Implementar el controlador y la ruta para actualizar un usuario existente.

## Lo que debés hacer

### 1. Modificar `src/modules/usuarios/usuarios.controller.ts`

Agregar la siguiente función al final del archivo:

```typescript
// Actualizar usuario
export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, first_name, last_name, role, is_author, active } =
      req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });
    }

    // Actualizamos los campos (sin tocar la contraseña)
    await usuario.update({
      username,
      email,
      first_name,
      last_name,
      roleId: role, // o el nombre del campo que use tu modelo
      is_author, // Asumiendo que agregaste esta columna en la BD
      active,
    });

    // Devolvemos el usuario actualizado sin la contraseña
    const usuarioActualizado = await Usuario.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({ success: true, data: usuarioActualizado });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Error al actualizar usuario" });
  }
};
```

### 2. Modificar `src/modules/usuarios/usuarios.routes.ts`

Importar `updateUsuario` y agregar la ruta:

```typescript
import {
  getUsuarios,
  createUsuario,
  deleteUsuario,
  resetPassword,
  updateUsuario,
} from "./usuarios.controller";

// ... (las rutas que ya tenías)
router.put("/:id", updateUsuario);
```

### 3. Verificación

- Correr `npm run build` en el backend.

## Respuesta esperada

Confirmame que la ruta y el controlador fueron creados y si compila sin errores.

# Tarea 40 (Frontend): Añadir sección desplegable de "Permisos" en el Modal

## Contexto

En el formulario para crear/editar usuarios, queremos agrupar los accesos especiales (como "Permitir publicaciones") dentro de un acordeón o sección desplegable llamada "Permisos", para mantener el formulario limpio.

## Objetivo

Modificar `src/pages/AdminUsuarios.tsx` para agregar una sección desplegable de Permisos que contenga el checkbox de `is_author`.

## Lo que debés hacer

### 1. Actualizar `src/pages/AdminUsuarios.tsx`

1. Importar los íconos `ChevronDown` y `ChevronUp` de `lucide-react`.
2. Agregar un estado para controlar si la sección está abierta o cerrada:
   `const [showPermissions, setShowPermissions] = useState(false);`
3. En el formulario (dentro del `<Modal>`), reemplazar el checkbox suelto de `is_author` por esta sección desplegable:

```tsx
{
  /* Sección desplegable de Permisos */
}
<div className="border border-gray-200 rounded-md overflow-hidden mt-2">
  <button
    type="button"
    onClick={() => setShowPermissions(!showPermissions)}
    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
  >
    <span className="text-sm font-medium text-gray-700">
      Permisos Especiales
    </span>
    {showPermissions ? (
      <ChevronUp className="w-4 h-4 text-gray-500" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-500" />
    )}
  </button>

  {showPermissions && (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="is_author"
          name="is_author"
          checked={formulario.is_author}
          onChange={(e) =>
            setFormulario({ ...formulario, is_author: e.target.checked })
          }
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
        />
        <div>
          <label
            htmlFor="is_author"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Permitir publicaciones de documentos
          </label>
          <p className="text-xs text-gray-500">
            Habilita al usuario para enviar manuscritos como autor.
          </p>
        </div>
      </div>
    </div>
  )}
</div>;
```

### 2. Limpieza

Asegurate de que al abrir el modal (en `openCreateModal` y `openEditModal`), el estado `showPermissions` vuelva a `false` para que empiece cerrado.

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que el archivo fue actualizado y si `npm run build` pasó.

# Tarea 41 (Backend): Actualizar los nombres de los roles en la Base de Datos y Modelos

## Contexto

El frontend ahora envía los roles `STAFF` y `EDITOR`, pero el backend está rechazando la creación/edición de usuarios con el error "el rol no existe". Esto se debe a que el backend y la base de datos todavía tienen los roles antiguos (`AUTOR`, `PUBLISHER`, `MEDICO`, etc.).

## Objetivo

1. Actualizar el modelo (si usa un ENUM) o los seeders/tabla de roles para que los roles válidos sean: `STAFF`, `DDI`, `COMITE`, `EDITOR`, `ADMIN`.
2. Asegurarse de que los controladores busquen y asignen correctamente estos roles.

## Lo que debés hacer

### 1. Revisar el modelo de Usuario o Rol

Buscar el archivo del modelo (ej. `src/modules/usuarios/Rol.model.ts` o `Usuario.model.ts`).
Si el rol está definido como un `ENUM`, actualizarlo:

```typescript
role: {
  type: DataTypes.ENUM('STAFF', 'DDI', 'COMITE', 'EDITOR', 'ADMIN'),
  // ...
}
```

_(Si usás una tabla relacional `roles`, no hace falta tocar el modelo, solo el paso 3)._

### 2. Actualizar el Seeder (Semilla de datos)

Si tienen un archivo `seed.ts` o `seeder.ts` que llena la tabla de roles al inicio, actualizarlo para que inserte:

- `STAFF`
- `DDI`
- `COMITE`
- `EDITOR`
- `ADMIN`
  Y eliminar los antiguos (`AUTOR`, `PUBLISHER`, `MEDICO`).

### 3. Actualizar el Controlador de Usuarios

En `usuarios.controller.ts`, verificar cómo se guarda el rol. Si el frontend envía el nombre (ej. `"STAFF"`) y el controlador espera el ID, ajustar la lógica.
Por ejemplo, si usan una tabla de roles:

```typescript
// Dentro de createUsuario o updateUsuario
import { Rol } from './Rol.model';

// Buscar el rol por nombre
const rolEncontrado = await Rol.findOne({ where: { name: req.body.role } });
if (!rolEncontrado) {
  return res.status(400).json({ success: false, error: 'El rol enviado no existe' });
}

// Asignar el ID del rol al usuario
await usuario.update({ roleId: rolEncontrado.id, ... });
```

### 4. Actualizar la Base de Datos (Sincronización)

- Si usan `sequelize.sync({ alter: true })` en el servidor, al reiniciar el backend la tabla se debería actualizar sola.
- Si no, deberán hacer un script rápido o usar un cliente SQL (pgAdmin/DBeaver) para actualizar manualmente los roles en la tabla `roles`:
  `UPDATE roles SET name = 'STAFF' WHERE name IN ('AUTOR', 'MEDICO');`
  `UPDATE roles SET name = 'EDITOR' WHERE name = 'PUBLISHER';`

### 5. Verificación

- Correr `npm run build` en el backend.
- Reiniciar el servidor backend para que tome los cambios.

## Respuesta esperada

Confirmame qué archivos modificaste para solucionar el problema de los roles y si el backend compila sin errores.

# Tarea 42 (Backend): Devolver la contraseña generada al reiniciarla

## Contexto

Cuando el Admin reinicia la contraseña de un usuario, el backend genera una nueva, pero actualmente no se la devuelve al frontend. El Admin necesita verla para copiarla y pasársela al usuario.

## Objetivo

Modificar `backend/src/modules/usuarios/usuarios.controller.ts` para que la función `resetPassword` devuelva la contraseña generada en texto plano.

## Lo que debés hacer

### 1. Modificar `resetPassword` en `usuarios.controller.ts`

(Asumimos que tienes una función para generar la contraseña, si no, puedes usar un random string simple).

```typescript
import crypto from "crypto";

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Generar contraseña temporal (ej: 16 caracteres aleatorios)
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });
    }

    await usuario.update({
      password: hashedPassword,
      must_change_password: true,
    });

    return res.status(200).json({
      success: true,
      data: { tempPassword }, // Devolvemos la contraseña generada
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error al reiniciar contraseña" });
  }
};
```

### 2. Verificación

- Correr `npm run build` en el backend y reiniciar el servidor.

## Respuesta esperada

Confirmame que el controlador fue modificado y si compila.

# Tarea 43 (Frontend): Mostrar la nueva contraseña en un modal con botón de copiar

## Contexto

El backend ahora devuelve `tempPassword` al reiniciar la contraseña. Queremos mostrar esa contraseña en un modal (igual que cuando creamos un usuario) en lugar de un `alert`.

## Objetivo

1. Actualizar `src/api/usuarios.api.ts`.
2. Modificar `src/pages/AdminUsuarios.tsx` para reutilizar la pantalla de éxito.

## Lo que debés hacer

### 1. Actualizar `src/api/usuarios.api.ts`

Modificar la función `resetPassword` para que retorne la contraseña:

```typescript
export const resetPassword = async (id: number): Promise<string> => {
  const { data } = await axiosClient.post<
    ApiResponse<{ tempPassword: string }>
  >(`/usuarios/${id}/reset-password`);
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al reiniciar contraseña");
  }
  return data.data.tempPassword;
};
```

### 2. Modificar `src/pages/AdminUsuarios.tsx`

En la función `handleResetPassword`:

```tsx
const handleResetPassword = async (id: number) => {
  if (window.confirm("¿Generar nueva contraseña temporal para este usuario?")) {
    try {
      const newPassword = await resetPassword(id);

      // En lugar de un alert, abrimos el modal de éxito
      setCreatedPassword(newPassword);
      setIsModalOpen(true);
      setEditingUserId(null); // Aseguramos que no estamos editando
    } catch (err) {
      alert("Error al reiniciar contraseña");
    }
  }
  setOpenMenuId(null);
};
```

_(Nota: Usamos el estado `createdPassword` que ya tenías para la creación. Al setearlo, el Modal automáticamente mostrará la vista de la contraseña con el botón de copiar en lugar del formulario)._

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron actualizados y si `npm run build` pasó.

# Tarea 44 (Frontend): Mostrar la nueva contraseña en un modal con botón de copiar

## Contexto

El backend ahora devuelve `tempPassword` al reiniciar la contraseña. Queremos mostrar esa contraseña en un modal (igual que cuando creamos un usuario) en lugar de un `alert`.

## Objetivo

1. Actualizar `src/api/usuarios.api.ts`.
2. Modificar `src/pages/AdminUsuarios.tsx` para reutilizar la pantalla de éxito.

## Lo que debés hacer

### 1. Actualizar `src/api/usuarios.api.ts`

Modificar la función `resetPassword` para que retorne la contraseña:

```typescript
export const resetPassword = async (id: number): Promise<string> => {
  const { data } = await axiosClient.post<
    ApiResponse<{ tempPassword: string }>
  >(`/usuarios/${id}/reset-password`);
  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al reiniciar contraseña");
  }
  return data.data.tempPassword;
};
```

### 2. Modificar `src/pages/AdminUsuarios.tsx`

En la función `handleResetPassword`:

```tsx
const handleResetPassword = async (id: number) => {
  if (window.confirm("¿Generar nueva contraseña temporal para este usuario?")) {
    try {
      const newPassword = await resetPassword(id);

      // En lugar de un alert, abrimos el modal de éxito
      setCreatedPassword(newPassword);
      setIsModalOpen(true);
      setEditingUserId(null); // Aseguramos que no estamos editando
    } catch (err) {
      alert("Error al reiniciar contraseña");
    }
  }
  setOpenMenuId(null);
};
```

_(Nota: Usamos el estado `createdPassword` que ya tenías para la creación. Al setearlo, el Modal automáticamente mostrará la vista de la contraseña con el botón de copiar en lugar del formulario)._

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron actualizados y si `npm run build` pasó.

# Tarea 45 (Frontend): Menú desplegable de Perfil de Usuario

## Contexto

En la barra superior (`DashboardLayout.tsx`), al lado del nombre del usuario hay un triángulo (chevron). Queremos que al hacer clic se abra un menú desplegable con opciones para ir al Perfil (cambiar contraseña, foto, etc.) y Cerrar Sesión.

## Objetivo

Modificar `src/layouts/DashboardLayout.tsx` para agregar el menú desplegable.

## Lo que debés hacer

### 1. Modificar `src/layouts/DashboardLayout.tsx`

Agregar un estado para abrir/cerrar el menú:

```tsx
const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
```

Reemplazar la sección del `<header>` donde se muestra el usuario por esta estructura:

```tsx
// Asegurate de importar los íconos: ChevronDown, User, LogOut
import { ChevronDown, User, LogOut } from "lucide-react";

// ... dentro del header:
<div className="flex items-center gap-4 relative">
  <button
    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
    className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-md transition-colors"
  >
    {/* Avatar (círculo con iniciales o imagen) */}
    <div className="w-8 h-8 rounded-full bg-institucional-600 text-white flex items-center justify-center font-bold text-sm">
      {user?.first_name?.charAt(0)}
      {user?.last_name?.charAt(0)}
    </div>
    <div className="text-left hidden md:block">
      <p className="text-sm font-medium text-gray-800">
        {user?.first_name} {user?.last_name}
      </p>
      <p className="text-xs text-gray-500">{user?.role}</p>
    </div>
    <ChevronDown className="w-4 h-4 text-gray-400" />
  </button>

  {/* MENÚ DESPLEGABLE DE PERFIL */}
  {isProfileMenuOpen && (
    <div className="absolute top-12 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
      <Link
        to="/perfil"
        onClick={() => setIsProfileMenuOpen(false)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <User className="w-4 h-4 text-blue-500" /> Editar Perfil
      </Link>
      <div className="border-t border-gray-100 my-1"></div>
      <button
        onClick={handleLogout}
        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <LogOut className="w-4 h-4" /> Cerrar Sesión
      </button>
    </div>
  )}
</div>;
```

### 2. Limpieza

- Quitar el botón de "Cerrar Sesión" que estaba suelto a la derecha (ya que ahora está dentro del menú desplegable).
- Crear un archivo placeholder `src/pages/Perfil.tsx` para que la ruta `/perfil` no rompa la app:

```tsx
export const Perfil = () => (
  <div className="p-8">
    <h1>Mi Perfil</h1>
  </div>
);
```

- Agregar la ruta en `src/routes/AppRoutes.tsx`: `<Route path="perfil" element={<Perfil />} />`.

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron actualizados y si `npm run build` pasó.

# Tarea 46 (Backend): Agregar atributo is_guest para usuarios autoregistrados

## Contexto

Los usuarios ahora pueden registrarse a sí mismos para participar en convocatorias (Invitados). No queremos crear un nuevo Rol para esto, sino un atributo booleano `is_guest` que indique que la cuenta fue creada por el propio usuario y no por un administrador.

## Objetivo

1. Agregar `is_guest` al modelo de Usuario.
2. Asegurar que los controladores de creación y edición acepten este campo.

## Lo que debés hacer

### 1. Modificar el modelo de Usuario (ej. `src/modules/usuarios/Usuario.model.ts`)

Agregar el campo booleano en la definición del modelo Sequelize:

```typescript
  is_guest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
```

### 2. Actualizar controladores (`usuarios.controller.ts`)

Asegurarse de que `createUsuario` y `updateUsuario` guarden/actualicen el campo `is_guest` si viene en el `req.body` (por si el admin quiere quitarle la condición de invitado a alguien).

### 3. Verificación

- Si usan `sequelize.sync({ alter: true })`, reiniciar el backend para que se cree la columna en la base de datos.

## Respuesta esperada

Confirmame que el modelo fue actualizado y si compila.

# Tarea 47 (Frontend): Etiquetas apiladas en la tabla y soporte para Invitado

## Contexto

Vamos a mejorar el diseño de la tabla de usuarios para que las etiquetas (Rol, Autor, Invitado) se apilen verticalmente como en el diseño de referencia. Además, agregaremos el campo `is_guest` a los tipos y a la lógica visual.

## Objetivo

1. Actualizar los tipos en `src/types/user.types.ts`.
2. Modificar la columna "Rol / Autor" en `src/pages/AdminUsuarios.tsx` para usar un flex vertical.

## Lo que debés hacer

### 1. Actualizar `src/types/user.types.ts`

Agregar `is_guest` a `User`, `CreateUserRequest` y `UpdateUserRequest`:

```typescript
// En la interfaz User y Create/Update:
is_guest?: boolean;
```

### 2. Actualizar `src/pages/AdminUsuarios.tsx`

En la tabla (dentro del `<tbody>`), reemplazar la celda de "Rol / Autor" por esta estructura:

```tsx
<td className="py-3 px-4">
  <div className="flex flex-col gap-1.5 items-start">
    {/* Etiqueta del Rol Principal */}
    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
      {u.role}
    </span>

    {/* Etiquetas secundarias (Permisos) */}
    {u.is_author && (
      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
        AUTOR
      </span>
    )}

    {u.is_guest && (
      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
        INVITADO
      </span>
    )}
  </div>
</td>
```

### 3. Actualizar el Formulario del Modal (Opcional pero recomendado)

En la sección "Permisos Especiales" del modal, agregar un checkbox para el estado de invitado, por si el Admin decide ascender a un invitado a un usuario regular:

```tsx
<div className="flex items-start gap-2 mt-3">
  <input
    type="checkbox"
    id="is_guest"
    name="is_guest"
    checked={formulario.is_guest || false}
    onChange={(e) =>
      setFormulario({ ...formulario, is_guest: e.target.checked })
    }
    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
  />
  <div>
    <label
      htmlFor="is_guest"
      className="text-sm font-medium text-gray-700 cursor-pointer"
    >
      Usuario Invitado (Autoregistrado)
    </label>
    <p className="text-xs text-gray-500">
      Indica que el usuario se registró por su cuenta para una convocatoria.
    </p>
  </div>
</div>
```

_(No olvides agregar `is_guest: false` al estado inicial del `useForm`)._

### 4. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron actualizados y si `npm run build` pasó.

# Tarea 48: Crear pantalla de Perfil y conectar cambio de contraseña

## Contexto

El usuario logueado necesita una pantalla en `/perfil` para ver sus datos y, lo más importante, cambiar la contraseña temporal que le asignó el administrador. El backend ya tiene el endpoint `POST /api/auth/change-password`.

## Objetivo

1. Actualizar `src/api/auth.api.ts` con la función `changePassword`.
2. Crear la pantalla `src/pages/Perfil.tsx` con un formulario de cambio de contraseña.
3. Conectar el botón "Editar Perfil" del menú desplegable para que navegue a esta pantalla.

## Lo que debés hacer

### 1. Actualizar `src/api/auth.api.ts`

Agregar esta función al final del archivo:

```typescript
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const { data } = await axiosClient.post<ApiResponse<void>>(
    "/auth/change-password",
    {
      currentPassword,
      newPassword,
    },
  );
  if (!data.success) {
    throw new Error(data.error || "Error al cambiar la contraseña");
  }
};
```

### 2. Crear `src/pages/Perfil.tsx`

Crear la pantalla con los datos del usuario (solo lectura) y un formulario seguro para cambiar la contraseña.

```tsx
// src/pages/Perfil.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/auth.api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { User as UserIcon, Key } from "lucide-react";
import { useForm } from "../hooks/useForm";

export const Perfil = () => {
  const { user } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { formulario, handleChange, resetForm } = useForm({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formulario.newPassword !== formulario.confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (formulario.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsChanging(true);
    try {
      await changePassword(formulario.currentPassword, formulario.newPassword);
      setSuccess("Contraseña actualizada correctamente.");
      resetForm();
    } catch (err: any) {
      setError(err.message || "Error al cambiar la contraseña");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Tarjeta de Datos del Usuario */}
      <div className="flex-1">
        <Card title="Mis Datos">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-institucional-100 text-institucional-700 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-gray-500 text-sm">@{user?.username}</p>
            <span className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
              Rol: {user?.role}
            </span>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-500">Correo:</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-500">
                Especialidad ID:
              </span>
              <span>{user?.specialtyId || "No asignada"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tarjeta de Cambio de Contraseña */}
      <div className="flex-1">
        <Card title="Seguridad">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 text-gray-700">
              <Key className="w-5 h-5 text-blue-500" />
              <p className="text-sm">Cambia tu contraseña regularmente.</p>
            </div>

            <Input
              label="Contraseña Actual"
              type="password"
              name="currentPassword"
              value={formulario.currentPassword}
              onChange={handleChange}
              required
            />
            <Input
              label="Nueva Contraseña"
              type="password"
              name="newPassword"
              value={formulario.newPassword}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              name="confirmPassword"
              value={formulario.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                {success}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isChanging}
              className="mt-2"
            >
              Actualizar Contraseña
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
```

### 3. Actualizar `src/routes/AppRoutes.tsx`

Asegurate de importar y agregar la ruta de perfil dentro de las rutas privadas:

```tsx
import { Perfil } from "../pages/Perfil";

// Dentro de <Route element={<PrivateRoutes />}> y <Route path="/" element={<DashboardLayout />}>
<Route path="perfil" element={<Perfil />} />;
```

### 4. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron creados y si `npm run build` pasó.

# Tarea 49 (Backend): Crear endpoint para que el usuario edite su propio perfil

## Contexto

Los usuarios necesitan poder editar sus datos básicos (nombre, apellido, nombre de usuario) y subir una foto de perfil.

## Objetivo

Crear el controlador y la ruta `PUT /api/auth/profile`.

## Lo que debés hacer

### 1. Modificar `src/modules/usuarios/Usuario.model.ts` (o el modelo correspondiente)

Si no existe, agregar el campo para la foto:

```typescript
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
```

### 2. Modificar `src/modules/auth/auth.controller.ts`

Agregar la función `updateProfile`. (Asumimos que ya tienes un middleware `authMiddleware` que pone al usuario en `req.user`).

```typescript
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // El ID viene del token
    const { first_name, last_name, username, profile_image } = req.body;

    const usuario = await Usuario.findByPk(userId);
    if (!usuario)
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });

    // Actualizar solo los campos enviados
    if (first_name) usuario.first_name = first_name;
    if (last_name) usuario.last_name = last_name;
    if (username) usuario.username = username;
    if (profile_image !== undefined) usuario.profile_image = profile_image;

    await usuario.save();

    return res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error al actualizar perfil" });
  }
};
```

### 3. Modificar `src/modules/auth/auth.routes.ts`

Importar `updateProfile` y agregar la ruta protegida:

```typescript
router.put("/profile", authMiddleware, updateProfile);
```

### 4. Verificación

- Correr `npm run build` en el backend.

## Respuesta esperada

Confirmame que el modelo y el controlador fueron actualizados y si compila.

# Tarea 50 (Frontend): Interfaz completa de Perfil con edición, foto y ver contraseña

## Contexto

Vamos a rediseñar `src/pages/Perfil.tsx` para que sea una pantalla completa. Necesitamos:

1. Un botón de "ojito" (mostrar/ocultar) en los campos de contraseña.
2. Un formulario para editar Nombre, Apellido y Usuario.
3. Un campo para subir una URL de imagen de perfil.
4. (El error de Firefox suele ser por variables de entorno mal configuradas, pero al reescribir el componente nos aseguramos de que no sea un error del código de React).

## Lo que debés hacer

### 1. Actualizar `src/types/user.types.ts`

Agregar el campo de imagen al tipo User:

```typescript
  profile_image?: string | null;
```

### 2. Actualizar `src/api/auth.api.ts`

Agregar la función para guardar los datos del perfil:

```typescript
export const updateProfile = async (data: {
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_image?: string;
}): Promise<User> => {
  const { data: resData } = await axiosClient.put<ApiResponse<User>>(
    "/auth/profile",
    data,
  );
  if (!resData.success || !resData.data)
    throw new Error(resData.error || "Error al actualizar perfil");
  return resData.data;
};
```

### 3. Crear un componente InputPassword en `src/components/ui/InputPassword.tsx`

Para reutilizar el "ojito" (esto arregla el problema de UX):

```tsx
import { useState, forwardRef, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputPasswordProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={show ? "text" : "password"}
            className={`w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  },
);
InputPassword.displayName = "InputPassword";
```

### 4. Sobrescribir `src/pages/Perfil.tsx`

Aquí unimos todo. Usamos un estado local para manejar los cambios y actualizar el contexto:

```tsx
// src/pages/Perfil.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword, updateProfile } from "../api/auth.api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { InputPassword } from "../components/ui/InputPassword"; // El nuevo
import { Button } from "../components/ui/Button";
import { User as UserIcon, Camera } from "lucide-react";

export const Perfil = () => {
  const { user, login } = useAuth(); // 'login' actualiza el contexto global

  // Estados para los datos del perfil
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    profile_image: user?.profile_image || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Estados para la contraseña
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  // Sincronizar si el usuario cambia
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        profile_image: user.profile_image || "",
      });
    }
  }, [user]);

  // --- Lógica de Perfil ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const updatedUser = await updateProfile(profileData);
      login(updatedUser); // Actualizamos el contexto global con los nuevos datos
      setProfileMsg({
        type: "success",
        text: "Perfil actualizado correctamente.",
      });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // --- Lógica de Contraseña ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      return setPassMsg({
        type: "error",
        text: "Las contraseñas nuevas no coinciden.",
      });
    }

    setIsChangingPass(true);
    setPassMsg({ type: "", text: "" });

    try {
      await changePassword(passData.current, passData.new);
      setPassMsg({ type: "success", text: "Contraseña actualizada." });
      setPassData({ current: "", new: "", confirm: "" }); // Limpiar
    } catch (err: any) {
      setPassMsg({ type: "error", text: err.message });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* COLUMNA 1: Mis Datos */}
      <Card title="Mis Datos Personales">
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden relative group">
              {profileData.profile_image ? (
                <img
                  src={profileData.profile_image}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            <div className="w-full">
              <Input
                label="URL de Imagen de Perfil"
                name="profile_image"
                placeholder="https://ejemplo.com/foto.jpg"
                value={profileData.profile_image}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    profile_image: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={profileData.first_name}
              onChange={(e) =>
                setProfileData({ ...profileData, first_name: e.target.value })
              }
              required
            />
            <Input
              label="Apellido"
              value={profileData.last_name}
              onChange={(e) =>
                setProfileData({ ...profileData, last_name: e.target.value })
              }
              required
            />
          </div>
          <Input
            label="Nombre de Usuario"
            value={profileData.username}
            onChange={(e) =>
              setProfileData({ ...profileData, username: e.target.value })
            }
            required
          />
          <Input
            label="Correo Electrónico (No editable)"
            value={user?.email || ""}
            disabled
            className="bg-gray-50 text-gray-500"
          />

          {profileMsg.text && (
            <div
              className={`p-2 text-sm rounded ${profileMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
            >
              {profileMsg.text}
            </div>
          )}

          <Button type="submit" variant="primary" isLoading={isUpdatingProfile}>
            Guardar Cambios
          </Button>
        </form>
      </Card>

      {/* COLUMNA 2: Seguridad (Contraseña) */}
      <Card title="Seguridad">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 mb-2">
            Si tienes una contraseña genérica, cámbiala aquí.
          </p>

          <InputPassword
            label="Contraseña Actual"
            value={passData.current}
            onChange={(e) =>
              setPassData({ ...passData, current: e.target.value })
            }
            required
          />
          <InputPassword
            label="Nueva Contraseña"
            value={passData.new}
            onChange={(e) => setPassData({ ...passData, new: e.target.value })}
            required
          />
          <InputPassword
            label="Confirmar Nueva Contraseña"
            value={passData.confirm}
            onChange={(e) =>
              setPassData({ ...passData, confirm: e.target.value })
            }
            required
          />

          {passMsg.text && (
            <div
              className={`p-2 text-sm rounded ${passMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
            >
              {passMsg.text}
            </div>
          )}

          <Button type="submit" variant="primary" isLoading={isChangingPass}>
            Actualizar Contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
};
```

### 5. Verificación

- Correr `npm run build`.
- Probar en Chrome y en Firefox.

## Respuesta esperada

Confirmame que los archivos fueron creados y si `npm run build` pasó. Si hay algún error en Firefox, pasame el mensaje exacto de la consola.

# Tarea 51 (Backend): Recibir imagen de perfil con Multer

## Contexto

El frontend enviará la foto de perfil como un archivo (`multipart/form-data`) en lugar de una URL de texto. Necesitamos configurar el backend para guardar esa imagen.

## Objetivo

Modificar `updateProfile` para manejar la subida de archivos.

## Lo que debés hacer

### 1. Configurar Multer en `src/modules/auth/auth.routes.ts`

Importar `multer` y crear una instancia para guardar imágenes en `uploads/avatars/` (creá esa carpeta si no existe).

```typescript
import multer from "multer";
import path from "path";

// Configuración básica de Multer para avatares
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// En la ruta:
router.put("/profile", authMiddleware, upload.single("avatar"), updateProfile);
```

### 2. Modificar `updateProfile` en `src/modules/auth/auth.controller.ts`

Ahora la imagen no viene en `req.body`, sino en `req.file`.

```typescript
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { first_name, last_name, username } = req.body;

    const usuario = await Usuario.findByPk(userId);
    if (!usuario)
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });

    if (first_name) usuario.first_name = first_name;
    if (last_name) usuario.last_name = last_name;
    if (username) usuario.username = username;

    // Si se subió un archivo, guardamos la ruta
    if (req.file) {
      // Asumiendo que el servidor sirve la carpeta uploads públicamente
      usuario.profile_image = `/uploads/avatars/${req.file.filename}`;
    }

    await usuario.save();
    return res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error al actualizar perfil" });
  }
};
```

### 3. Verificación

- Correr `npm run build` en el backend.

# Tarea 52 (Frontend): Rediseñar Perfil con modo lectura, edición y subida de imagen

## Contexto

Vamos a rediseñar la pantalla de Perfil. Ahora tendrá dos estados:

1. **Vista (Lectura):** Muestra la foto, datos y un botón "Editar Perfil".
2. **Modo Edición:** Muestra los inputs, un selector de archivo para la foto y un botón de "Guardar".

## Objetivo

1. Cambiar el texto del menú de navegación a "Ver Perfil".
2. Sobrescribir `src/pages/Perfil.tsx` con la lógica de alternancia (Ver/Editar) y subida de archivos.

## Lo que debés hacer

### 1. Actualizar el menú en `src/layouts/DashboardLayout.tsx`

Buscar el enlace que dice "Editar Perfil" y cambiarlo por "Ver Perfil".

### 2. Actualizar `src/api/auth.api.ts`

La función `updateProfile` ahora debe enviar un `FormData` para soportar la imagen:

```typescript
export const updateProfile = async (formData: FormData): Promise<User> => {
  const { data } = await axiosClient.put<ApiResponse<User>>(
    "/auth/profile",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  if (!data.success || !data.data)
    throw new Error(data.error || "Error al actualizar perfil");
  return data.data;
};
```

### 3. Sobrescribir `src/pages/Perfil.tsx`

```tsx
// src/pages/Perfil.tsx
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword, updateProfile } from "../api/auth.api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { InputPassword } from "../components/ui/InputPassword";
import { Button } from "../components/ui/Button";
import { User as UserIcon, Camera, Edit3, ArrowLeft } from "lucide-react";

export const Perfil = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Datos para edición
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    username: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contraseña
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  const startEditing = () => {
    setEditData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
    });
    setAvatarFile(null);
    setProfileMsg({ type: "", text: "" });
    setIsEditing(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg({ type: "", text: "" });

    const formData = new FormData();
    formData.append("first_name", editData.first_name);
    formData.append("last_name", editData.last_name);
    formData.append("username", editData.username);
    if (avatarFile) {
      formData.append("avatar", avatarFile); // 'avatar' debe coincidir con el multer del backend
    }

    try {
      const updatedUser = await updateProfile(formData);
      login(updatedUser);
      setProfileMsg({ type: "success", text: "Perfil actualizado con éxito." });
      setIsEditing(false); // Volver a la vista de lectura
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm)
      return setPassMsg({
        type: "error",
        text: "Las contraseñas no coinciden.",
      });
    setIsChangingPass(true);
    try {
      await changePassword(passData.current, passData.new);
      setPassMsg({ type: "success", text: "Contraseña actualizada." });
      setPassData({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      setPassMsg({ type: "error", text: err.message });
    } finally {
      setIsChangingPass(false);
    }
  };

  const getInitials = () =>
    `${user?.first_name?.charAt(0) || ""}${user?.last_name?.charAt(0) || ""}`;

  // URL de la imagen (asumiendo que el backend la sirve en el puerto 3000)
  const imageUrl = user?.profile_image
    ? `http://localhost:3000${user.profile_image}`
    : null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* --- VISTA DE LECTURA --- */}
      {!isEditing ? (
        <>
          <Card>
            <div className="flex flex-col items-center py-6">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Perfil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-institucional-100 mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-institucional-600 text-white flex items-center justify-center text-3xl font-bold mb-4">
                  {getInitials()}
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-800">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-500 mb-2">@{user?.username}</p>

              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full mb-6">
                Rol: {user?.role}
              </span>

              <div className="w-full max-w-md space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Correo:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Estado:</span>
                  <span className="text-green-600 font-medium">Activo</span>
                </div>
              </div>

              <Button
                onClick={startEditing}
                variant="primary"
                className="mt-6 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Editar Perfil
              </Button>
            </div>
          </Card>
        </>
      ) : (
        /* --- MODO EDICIÓN --- */
        <Card title="Editar Mis Datos">
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800 self-start"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la vista de perfil
            </button>

            {/* Foto de Perfil */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {imageUrl || avatarFile ? (
                <img
                  src={avatarFile ? URL.createObjectURL(avatarFile) : imageUrl!}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) =>
                    setAvatarFile(e.target.files ? e.target.files[0] : null)
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" /> Cambiar Foto
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  JPG o PNG de máx. 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={editData.first_name}
                onChange={(e) =>
                  setEditData({ ...editData, first_name: e.target.value })
                }
                required
              />
              <Input
                label="Apellido"
                value={editData.last_name}
                onChange={(e) =>
                  setEditData({ ...editData, last_name: e.target.value })
                }
                required
              />
            </div>
            <Input
              label="Nombre de Usuario"
              value={editData.username}
              onChange={(e) =>
                setEditData({ ...editData, username: e.target.value })
              }
              required
            />
            <Input
              label="Correo Electrónico (No editable)"
              value={user?.email || ""}
              disabled
              className="bg-gray-50 text-gray-500"
            />

            {profileMsg.text && (
              <div
                className={`p-2 text-sm rounded ${profileMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
              >
                {profileMsg.text}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdatingProfile}
            >
              Guardar Cambios
            </Button>
          </form>
        </Card>
      )}

      {/* --- CAMBIO DE CONTRASEÑA (Siempre visible abajo) --- */}
      <Card title="Seguridad">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 mb-2">
            Cambia tu contraseña regularmente para mantener tu cuenta segura.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputPassword
              label="Contraseña Actual"
              value={passData.current}
              onChange={(e) =>
                setPassData({ ...passData, current: e.target.value })
              }
              required
            />
            <InputPassword
              label="Nueva Contraseña"
              value={passData.new}
              onChange={(e) =>
                setPassData({ ...passData, new: e.target.value })
              }
              required
            />
            <InputPassword
              label="Confirmar Contraseña"
              value={passData.confirm}
              onChange={(e) =>
                setPassData({ ...passData, confirm: e.target.value })
              }
              required
            />
          </div>

          {passMsg.text && (
            <div
              className={`p-2 text-sm rounded ${passMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
            >
              {passMsg.text}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isChangingPass}
            className="self-start"
          >
            Actualizar Contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
};
```

### 4. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron actualizados y si `npm run build` pasó.

# Tarea 53 (Frontend): Arreglar actualización de foto, buscador de usuarios y foto en tabla

## Contexto

1. La foto de perfil se guarda en el backend, pero al actualizarla no se refleja en la barra superior (Navbar) ni en la vista de perfil por culpa de la caché y el estado global.
2. El Admin necesita un buscador en la tabla de usuarios.
3. El Admin debe ver las fotos en la tabla.

## Objetivo

1. Modificar `AuthContext` para que guarde el usuario con la nueva foto.
2. En `Perfil.tsx`, forzar la recarga de la imagen y actualizar el contexto global al guardar.
3. En `AdminUsuarios.tsx`, agregar input de búsqueda y renderizar la foto.

## Lo que debés hacer

### 1. Actualizar `src/context/AuthContext.tsx`

Verificar que exista una función `updateUser` para actualizar los datos del contexto (ya la creamos en tareas anteriores, pero asegurate de que esté exportada):

```tsx
// Ya deberías tener esto en el AuthContext
const login = (userData: User) => {
  setUser(userData);
  setIsAuthenticated(true);
};
```

### 2. Arreglar la imagen en `src/pages/Perfil.tsx`

El problema de la caché se soluciona agregando un parámetro de tiempo a la URL (`?t=123456`).

Cambiar la constante `imageUrl`:

```tsx
// Añadimos un timestamp para evitar que el navegador use la foto vieja de la caché
const timestamp = new Date().getTime();
const imageUrl = user?.profile_image
  ? `http://localhost:3000${user.profile_image}?t=${timestamp}`
  : null;
```

Asegurate de que al guardar, llames a `login(updatedUser)` y se cierre el modo edición.

### 3. Actualizar `src/pages/AdminUsuarios.tsx` (Buscador y Fotos)

Agregar el ícono `Search` a los imports de `lucide-react`.
Agregar un estado para la búsqueda:

```tsx
const [searchTerm, setSearchTerm] = useState("");

// Lógica para filtrar:
const usuariosFiltrados = usuarios.filter(
  (u) =>
    u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()),
);
```

En la interfaz, agregar el buscador justo debajo del botón "Nuevo Usuario" o al lado:

```tsx
<div className="flex justify-between items-center mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
  </div>
  <div className="flex gap-4">
    {/* BUSCADOR */}
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar usuario..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <Button
      onClick={openCreateModal}
      variant="primary"
      className="flex items-center gap-2"
    >
      <Plus className="w-4 h-4" /> Nuevo Usuario
    </Button>
  </div>
</div>
```

En el `map` de la tabla, usar `usuariosFiltrados` en lugar de `usuarios`.
Y en la celda del nombre, agregar la foto:

```tsx
<td className="py-3 px-4">
  <div className="flex items-center gap-3">
    {u.profile_image ? (
      <img
        src={`http://localhost:3000${u.profile_image}`}
        alt="Perfil"
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
        {u.first_name?.charAt(0)}
        {u.last_name?.charAt(0)}
      </div>
    )}
    <div>
      <span className="font-medium text-gray-800 block">
        {u.first_name} {u.last_name}
      </span>
      <span className="text-xs text-gray-400">@{u.username}</span>
    </div>
  </div>
</td>
```

### 4. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron actualizados y si `npm run build` pasó.

# Tarea 54: Filtro por rol y arreglo de caché de imágenes en tabla de Admin

## Contexto

1. La imagen de perfil en la tabla de admin no se actualiza (problema de caché del navegador).
2. Necesitamos un filtro para buscar usuarios por su rol principal (STAFF, COMITE, etc.).

## Objetivo

1. Agregar el estado y la lógica del filtro por rol.
2. Agregar un `<select>` para el filtro en la interfaz.
3. Agregar un timestamp a las URLs de las imágenes para forzar su actualización.

## Lo que debés hacer

### 1. Modificar `src/pages/AdminUsuarios.tsx`

**A. Nuevos estados:**
Agregar el estado para el filtro de rol (cerca de `searchTerm`):

```tsx
const [roleFilter, setRoleFilter] = useState<string>("TODOS");
```

**B. Lógica de filtrado combinada:**
Reemplazar la lógica de `usuariosFiltrados` para que aplique tanto el texto como el rol:

```tsx
const usuariosFiltrados = usuarios.filter((u) => {
  const matchesSearch =
    u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesRole = roleFilter === "TODOS" || u.role === roleFilter;

  return matchesSearch && matchesRole;
});
```

**C. Interfaz del buscador y filtro:**
En la parte superior, donde pusimos el buscador, agregar el `<select>` al lado:

```tsx
        <div className="flex gap-4">
          {/* FILTRO POR ROL */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">Todos los roles</option>
            <option value="STAFF">Staff</option>
            <option value="COMITE">Comité</option>
            <option value="DDI">DDI</option>
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* BUSCADOR */}
          <div className="relative">
             {/* ... input de búsqueda ... */}
```

**D. Arreglar la caché de la imagen en la tabla:**
En la celda de la tabla donde renderizamos la foto (`<img src={...} />`), agregar un timestamp:

```tsx
    {u.profile_image ? (
      <img
        src={`http://localhost:3000${u.profile_image}?t=${new Date().getTime()}`}
        alt="Perfil"
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
      />
    ) : (
      // ... iniciales
```

### 2. Arreglar la caché en el Navbar (`src/layouts/DashboardLayout.tsx`)

Ir al componente del Navbar y hacer lo mismo con la imagen del usuario:

```tsx
{user?.profile_image ? (
  <img
    src={`http://localhost:3000${user.profile_image}?t=${new Date().getTime()}`}
    alt="Perfil"
    className="w-8 h-8 rounded-full object-cover border border-gray-200"
  />
) : (
  // ... iniciales
)}
```

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que el archivo fue actualizado y si `npm run build` pasó.

# Tarea 56 (Backend): Exponer la carpeta uploads para que el frontend vea las imágenes

## Contexto

Las imágenes se están guardando correctamente en el servidor, pero el frontend recibe un error 404 (No encontrado) al intentar mostrarlas. Esto pasa porque Express no está sirviendo la carpeta `uploads` de forma pública.

## Lo que debés hacer

### 1. Modificar `src/app.ts` (o `server.ts`)

Importar el módulo `path` y agregar el middleware `express.static`:

```typescript
import express from "express";
import path from "path";

const app = express();

// ... otros middlewares (cors, json, etc.)

// Servir la carpeta uploads de forma pública
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// (Ajusta la ruta si tu carpeta uploads está en la raíz del backend, usa: path.join(process.cwd(), 'uploads'))
```

### 2. Verificación

- Reiniciar el servidor backend.
- Abrir en el navegador: `http://localhost:3000/uploads/avatars/` (si hay alguna imagen ahí, debería descargarla o mostrarla, no dar error).

# Tarea 57 (Frontend): Forzar actualización de imágenes de perfil

## Contexto

El problema de las imágenes es doble: el navegador cachea las fotos viejas y el componente `Navbar` no se vuelve a renderizar cuando cambia el usuario en el contexto.

## Lo que debés hacer

### 1. Arreglar la vista del Admin (`src/pages/AdminUsuarios.tsx`)

Si el backend ya sirve las imágenes, para evitar la caché, vamos a usar el `id` del usuario y un número aleatorio.
En la celda de la tabla, cambiar el `src` de la imagen:

```tsx
{
  u.profile_image ? (
    <img
      src={`http://localhost:3000${u.profile_image}?v=${u.id}`}
      alt="Perfil"
      className="w-10 h-10 rounded-full object-cover border border-gray-200"
      onError={(e) => {
        // Si la imagen falla, ocultarla y mostrar las iniciales
        e.currentTarget.style.display = "none";
        e.currentTarget.nextElementSibling?.classList.remove("hidden");
      }}
    />
  ) : null;
}

{
  /* El div de las iniciales. Si hay imagen, se oculta. */
}
<div
  className={`w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm ${u.profile_image ? "hidden" : ""}`}
>
  {u.first_name?.charAt(0)}
  {u.last_name?.charAt(0)}
</div>;
```

### 2. Arreglar el Navbar (`src/layouts/DashboardLayout.tsx`)

Hacer lo mismo con la foto en la barra superior:

```tsx
<div className="relative w-8 h-8">
  {user?.profile_image ? (
    <img
      src={`http://localhost:3000${user.profile_image}?v=${new Date().getTime()}`}
      alt="Perfil"
      className="w-8 h-8 rounded-full object-cover border border-gray-200 absolute inset-0"
    />
  ) : null}
  <div
    className={`w-8 h-8 rounded-full bg-institucional-600 text-white flex items-center justify-center font-bold text-sm absolute inset-0 ${user?.profile_image ? "opacity-0" : "opacity-100"}`}
  >
    {user?.first_name?.charAt(0)}
    {user?.last_name?.charAt(0)}
  </div>
</div>
```

### 3. Verificación en `src/pages/Perfil.tsx`

Cuando el usuario guarda su foto nueva, debemos asegurarnos de actualizar el contexto global. Revisar la función `handleUpdateProfile`:

```tsx
const updatedUser = await updateProfile(formData);

// IMPORTANTE: Esto actualiza el Navbar al instante
login(updatedUser);

setProfileMsg({ type: "success", text: "Perfil actualizado con éxito." });
setIsEditing(false);
```

### 4. Verificación

- Correr `npm run build`.

# Tarea 58: Simplificar y arreglar la visualización de fotos de perfil

## Contexto

El backend está devolviendo las imágenes correctamente con status 200 (verificado en Network). Sin embargo, en la tabla de Admin y en el Navbar se siguen mostrando las iniciales en lugar de las fotos. Esto se debe a una lógica compleja de `onError` en el código anterior y a que React no está detectando los cambios en el contexto.

## Objetivo

Simplificar la renderización de la imagen en `AdminUsuarios.tsx` y `DashboardLayout.tsx`.

## Lo que debés hacer

### 1. Limpiar la tabla en `src/pages/AdminUsuarios.tsx`

Buscar la celda donde se renderiza el usuario (dentro del `<tbody>`) y dejarla exactamente así (eliminando la lógica del `onError` y el `hidden`):

```tsx
<td className="py-3 px-4">
  <div className="flex items-center gap-3">
    {u.profile_image ? (
      <img
        src={`http://localhost:3000${u.profile_image}`}
        alt="Perfil"
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
        {u.first_name?.charAt(0)}
        {u.last_name?.charAt(0)}
      </div>
    )}
    <div>
      <span className="font-medium text-gray-800 block">
        {u.first_name} {u.last_name}
      </span>
      <span className="text-xs text-gray-400">@{u.username}</span>
    </div>
  </div>
</td>
```

### 2. Limpiar el Navbar en `src/layouts/DashboardLayout.tsx`

Buscar el botón del perfil de usuario en la barra superior y dejar la imagen así:

```tsx
<div className="w-8 h-8 rounded-full bg-institucional-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
  {user?.profile_image ? (
    <img
      src={`http://localhost:3000${user.profile_image}`}
      alt="Perfil"
      className="w-full h-full object-cover"
    />
  ) : (
    <>
      {user?.first_name?.charAt(0)}
      {user?.last_name?.charAt(0)}
    </>
  )}
</div>
```

### 3. Forzar la recarga del componente al guardar foto (en `Perfil.tsx`)

Cuando el usuario sube una foto, el backend la guarda, pero React puede tardar en actualizar la vista. Vamos a añadir `window.location.reload()` después de actualizar el perfil para asegurarnos de que todo se refresque:

En `src/pages/Perfil.tsx`, dentro de `handleUpdateProfile`, justo después de `login(updatedUser);`, agregar:

```tsx
const updatedUser = await updateProfile(formData);
login(updatedUser);
setProfileMsg({ type: "success", text: "Perfil actualizado con éxito." });
setIsEditing(false);

// RECARGA FORZADA PARA ACTUALIZAR IMÁGENES
setTimeout(() => {
  window.location.reload();
}, 500);
```

### 4. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron actualizados y si `npm run build` pasó.

# Tarea 60 (Backend): Incluir el campo profile_image en el listado de usuarios

## Contexto

En el frontend, la tabla de administración de usuarios sigue mostrando las iniciales (AH, DH, etc.) en lugar de la foto de perfil, a pesar de que el Navbar sí la muestra. Esto ocurre porque el endpoint `GET /api/usuarios` no está devolviendo el campo `profile_image` en el JSON de respuesta.

## Objetivo

Modificar el controlador de usuarios en el backend para asegurar que `profile_image` se envíe en la lista.

## Lo que debés hacer

### 1. Revisar `src/modules/usuarios/Usuario.model.ts`

Asegurarse de que el campo `profile_image` esté definido y **no** tenga `hidden: true` en sus opciones de Sequelize.

```typescript
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
```

### 2. Modificar `src/modules/usuarios/usuarios.controller.ts`

En la función `getUsuarios`, revisar cómo se están obteniendo los datos. Si están usando `attributes: { exclude: ['password'] }`, asegurarse de que `profile_image` NO esté excluido.

```typescript
export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.findAll({
      // Excluimos solo la contraseña, el resto de campos (incluyendo profile_image) pasan
      attributes: { exclude: ['password'] },
      include: [{ model: Rol, as: 'role' }],
    });

    return res.status(200).json({
      success: true,
      data: { items: usuarios, total: usuarios.length, page: 1, limit: usuarios.length }
    });
  } catch (error) {
    // ...
```

### 3. Verificación

- Reiniciar el servidor backend.
- Hacer un `GET` a `http://localhost:3000/api/usuarios` (con Postman o el navegador) y confirmar que en el JSON aparece el campo `"profile_image": "/uploads/avatars/..."`.

# Tarea 61 (Backend): Crear endpoint público para el autorregistro de invitados

## Contexto

Necesitamos permitir que los usuarios (invitados) se registren a sí mismos para participar en convocatorias. Al registrarse, deben obtener el rol `STAFF` y el atributo `is_guest: true`.

## Objetivo

Crear el controlador y la ruta `POST /api/auth/register`.

## Lo que debés hacer

### 1. Modificar `src/modules/auth/auth.controller.ts`

Agregar la función `register`. Asumimos que ya tienen la lógica de encriptación con `bcrypt` y el modelo `Usuario`.

```typescript
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;

    // Validaciones básicas
    if (!username || !email || !password || !first_name || !last_name) {
      return res
        .status(400)
        .json({ success: false, error: "Todos los campos son obligatorios" });
    }

    // Verificar si el correo ya existe
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
      return res
        .status(400)
        .json({ success: false, error: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario (Forzamos rol STAFF e is_guest true)
    // NOTA: Ajusta el roleId según cómo manejen la tabla de roles.
    // Si usan un ENUM, solo pasa role: 'STAFF'.
    const nuevoUsuario = await Usuario.create({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role: "STAFF", // o roleId: ID_DEL_ROL_STAFF
      is_guest: true,
      must_change_password: false, // El eligió su contraseña
      active: true,
    });

    // Opcional: Generar token y cookie para que inicie sesión automáticamente
    // ... (código para setear cookie si lo tienen en el login)

    return res.status(201).json({
      success: true,
      data: { usuario: nuevoUsuario, mensaje: "Registro exitoso" },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Error al registrar usuario" });
  }
};
```

### 2. Modificar `src/modules/auth/auth.routes.ts`

Importar `register` y agregar la ruta (debe ser pública, sin `authMiddleware`):

```typescript
import {
  login,
  logout,
  verify,
  changePassword,
  register,
} from "./auth.controller";

// ... rutas existentes
router.post("/register", register);
```

### 3. Verificación

- Correr `npm run build` en el backend.

# Tarea 63 (Backend): Registro con DNI, cuenta inactiva y notificación al Admin

## Contexto

Vamos a modificar el registro público. Ahora el DNI será obligatorio. Cuando un usuario se registre, su cuenta se creará inactiva (`active: false`) y se deberá notificar al Administrador para que la habilite. Cuando el Admin la active, se le enviará un correo al usuario.

## Lo que debés hacer

### 1. Modificar el modelo `src/modules/usuarios/Usuario.model.ts`

Asegurarse de que el campo `dni` sea obligatorio (`allowNull: false`) y único.

```typescript
  dni: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
```

### 2. Modificar `register` en `src/modules/auth/auth.controller.ts`

Actualizar la función para recibir el DNI, crear el usuario inactivo y simular el aviso al admin.

```typescript
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, first_name, last_name, dni } = req.body;

    if (!username || !email || !password || !first_name || !last_name || !dni) {
      return res.status(400).json({
        success: false,
        error: "Todos los campos, incluyendo el DNI, son obligatorios",
      });
    }

    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
      return res
        .status(400)
        .json({ success: false, error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      dni,
      role: "STAFF",
      is_guest: true,
      must_change_password: false,
      active: false, // 👈 LA CUENTA NACE DESHABILITADA
    });

    // NOTIFICAR AL ADMIN (Aquí usarían su servicio de correos, ej. Nodemailer)
    // Ejemplo conceptual:
    console.log(
      `[EMAIL] Notificar al Admin: El usuario ${username} con DNI ${dni} solicita activación.`,
    );

    return res.status(201).json({
      success: true,
      data: {
        mensaje:
          "Registro exitoso. Tu cuenta está pendiente de aprobación por un Administrador.",
        usuario: nuevoUsuario,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Error al registrar usuario" });
  }
};
```

### 3. Modificar el controlador de actualización de usuarios

En `usuarios.controller.ts`, cuando el Admin cambia `active` a `true`, enviar el correo.

```typescript
export const updateUsuario = async (req: Request, res: Response) => {
  // ... código de búsqueda del usuario
  const isActivating = req.body.active === true && usuario.active === false;

  // ... código que actualiza los datos

  if (isActivating) {
    // NOTIFICAR AL USUARIO (Nodemailer)
    console.log(`[EMAIL] Hola ${usuario.first_name}, tu cuenta ha sido ACTIVADA. Ya puedes iniciar sesión.`);
  }
  // ...
```

### 4. Verificación

- Correr `npm run build`.

# Tarea 64 (Frontend): Añadir DNI, pantalla de espera y renombrar estados

## Contexto

1. El formulario de registro debe pedir el DNI.
2. Al registrarse, no debe loguearse automáticamente, sino mostrar un mensaje de "Esperando aprobación".
3. En la tabla de Admin, los estados deben decir "Habilitada" y "Deshabilitada".

## Lo que debés hacer

### 1. Modificar el Login para mostrar error si está inactivo

En `src/pages/Login.tsx`, el backend ya debería devolver un error si la cuenta está inactiva. Asegurarse de que ese mensaje se muestre en el div rojo de errores.

### 2. Modificar `src/pages/Registro.tsx`

- Agregar `dni: ''` al `useForm`.
- Agregar el input del DNI en el formulario (debajo de nombre y apellido).
- Agregar el estado `const [isSuccess, setIsSuccess] = useState(false);`.
- En `handleSubmit`, QUITAR el `login(userData)` y la redirección. En su lugar, setear `setIsSuccess(true)`.
- Si `isSuccess` es true, mostrar un cartel en lugar del formulario:

```tsx
        {isSuccess ? (
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">¡Registro Exitoso!</h2>
            <p className="text-green-700">
              Tu cuenta ha sido creada. Un Administrador debe habilitar tu cuenta antes de que puedas ingresar. Te enviaremos un correo cuando esté lista.
            </p>
            <Button onClick={() => navigate('/login')} className="mt-6 w-full" variant="primary">
              Volver al Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} ...>
            {/* ... inputs ... */}
          </form>
        )}
```

### 3. Modificar los textos de estado en `src/pages/AdminUsuarios.tsx`

Buscar donde se renderiza el estado del usuario en la tabla (las etiquetas verde/roja) y cambiarlas:

```tsx
<td className="py-3 px-4">
  <span
    className={`px-2 py-1 text-xs font-semibold rounded-full ${u.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
  >
    {u.active ? "Habilitada" : "Deshabilitada"}
  </span>
</td>
```

_(Hacer lo mismo en el menú de 3 puntos si dice "Suspender", cambiarlo a "Deshabilitar")._

### 4. Agregar DNI al Modal de Creación (Admin)

Para que el Admin también pueda crear usuarios con DNI, agregar el campo `dni` al `useForm` del modal en `AdminUsuarios.tsx` y agregar el `<Input label="DNI" name="dni" ... />`.

### 5. Verificación

- Correr `npm run build`.

# Tarea 65 (Backend): Implementar sistema de notificaciones

## Contexto

Necesitamos un sistema de notificaciones. Cuando el admin activa/desactiva a un usuario, se debe crear una notificación en la base de datos y "enviar un correo" (simulado). El frontend consultará estas notificaciones.

## Objetivo

1. Crear el modelo de Notificación.
2. Crear los endpoints para listar y marcar como leídas.
3. Disparar la notificación al cambiar el estado de un usuario.

## Lo que debés hacer

### 1. Crear el modelo `src/modules/notificaciones/Notificacion.model.ts`

```typescript
import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

export class Notificacion extends Model {}
Notificacion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }, // El admin que recibe la notif
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, tableName: "notifications" },
);
```

### 2. Crear controlador y rutas

`src/modules/notificaciones/notificaciones.controller.ts`:

```typescript
import { Request, Response } from "express";
import { Notificacion } from "./Notificacion.model";

export const getNotificaciones = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const notificaciones = await Notificacion.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });
  res.status(200).json({ success: true, data: notificaciones });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Notificacion.update({ read: true }, { where: { id } });
  res.status(200).json({ success: true, data: {} });
};
```

`src/modules/notificaciones/notificaciones.routes.ts`:

```typescript
import { Router } from "express";
import { getNotificaciones, markAsRead } from "./notificaciones.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);
router.get("/", getNotificaciones);
router.put("/:id/read", markAsRead);
export default router;
```

_(No olvides montar la ruta en `app.ts`: `app.use('/api/notificaciones', notificacionesRoutes)`)_.

### 3. Disparar la notificación al Admin al registrarse un usuario

En `auth.controller.ts`, en la función `register`, después de crear el usuario, buscar a todos los usuarios con rol `ADMIN` y crearles una notificación:

```typescript
import { Notificacion } from "../notificaciones/Notificacion.model";

// ... después de crear el nuevoUsuario:
const admins = await Usuario.findAll({ where: { role: "ADMIN" } });
for (const admin of admins) {
  await Notificacion.create({
    userId: admin.id,
    title: "Nueva solicitud de cuenta",
    message: `El usuario ${nuevoUsuario.first_name} ${nuevoUsuario.last_name} (DNI: ${dni}) solicita activación.`,
  });
}
```

### 4. Notificar y simular email al cambiar estado en `usuarios.controller.ts`

En `updateUsuario`, si el estado cambia:

```typescript
if (isActivating) {
  // 1. Simulamos el envío de correo
  console.log(
    `[EMAIL] Hola ${usuario.first_name}, tu cuenta ha sido HABILITADA. Ya puedes iniciar sesión.`,
  );

  // 2. Notificamos al usuario en su panel (si lo tuviera)
  await Notificacion.create({
    userId: usuario.id,
    title: "Cuenta Habilitada",
    message:
      "Un administrador ha habilitado tu cuenta. Ya puedes ingresar al portal.",
  });
}
```

### 5. Verificación

- Correr `npm run build` y reiniciar el backend.

# Tarea 68 (Frontend): Página de Notificaciones y punto rojo en el Sidebar

## Contexto

En lugar de una campanita en el Navbar, vamos a crear un apartado llamado "Notificaciones" en el menú lateral (Sidebar). Este apartado mostrará un punto rojo si hay notificaciones no leídas. También necesitamos crear la página para leerlas.

## Objetivo

1. Crear la página `src/pages/Notificaciones.tsx`.
2. Agregar el ítem en el menú del `DashboardLayout.tsx` con la lógica del punto rojo.
3. Agregar la ruta en `AppRoutes.tsx`.

## Lo que debés hacer

### 1. Crear `src/pages/Notificaciones.tsx`

Esta página listará las notificaciones y permitirá marcarlas como leídas al hacer clic.

```tsx
// src/pages/Notificaciones.tsx
import { useEffect, useState } from "react";
import {
  getNotificaciones,
  markAsRead,
  type Notificacion,
} from "../api/notificaciones.api";
import { Card } from "../components/ui/Card";
import { Loader2, Bell, CheckCircle } from "lucide-react";

export const Notificaciones = () => {
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const data = await getNotificaciones();
      setNotifs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleRead = async (id: number) => {
    const notif = notifs.find((n) => n.id === id);
    if (notif && !notif.read) {
      await markAsRead(id);
      setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
          <p className="text-gray-500 text-sm mt-1">
            Mensajes y avisos del sistema
          </p>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Bell className="w-12 h-12 mb-3 text-gray-300" />
            <p>No tienes notificaciones por el momento.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={`p-4 border-b border-gray-100 flex gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${!n.read ? "bg-blue-50/30" : ""}`}
              >
                <div
                  className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!n.read ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                >
                  {!n.read ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4
                    className={`text-sm ${!n.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
                  >
                    {n.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
```

### 2. Agregar la ruta en `src/routes/AppRoutes.tsx`

Importar `Notificaciones` y agregarla dentro de las rutas privadas:

```tsx
import { Notificaciones } from "../pages/Notificaciones";
// ... dentro de <Route element={<PrivateRoutes />}>
<Route path="notificaciones" element={<Notificaciones />} />;
```

### 3. Modificar el Sidebar en `src/layouts/DashboardLayout.tsx`

- Importar `Bell` y la función `getNotificaciones`.
- Agregar un estado para las notificaciones no leídas:

```tsx
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  const fetchUnread = async () => {
    try {
      const data = await getNotificaciones();
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      /* silencioso */
    }
  };
  fetchUnread();
}, []);
```

- Dentro del `<nav>`, agregar el enlace a Notificaciones (solo visible para ADMIN, o para todos si querés que los usuarios también reciban mensajes):

```tsx
{
  /* En el menú lateral, después de Biblioteca o Dashboard */
}
<Link
  to="/notificaciones"
  className="relative flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors"
>
  <Bell className="w-5 h-5" />
  Notificaciones
  {/* PUNTO ROJO */}
  {unreadCount > 0 && (
    <span className="absolute top-2 left-6 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
  )}
</Link>;
```

### 4. Limpieza

- En el `DashboardLayout.tsx`, borrar el botón de la campanita en la barra superior que habíamos puesto en la tarea anterior (si el agente llegó a crearla). El menú superior solo debe tener el perfil del usuario.

### 5. Verificación

- Correr `npm run build`.

# Tarea 69: Unificar Gestión de Usuarios y Solicitudes en Pestañas

## Contexto

Actualmente, "Manejo de Usuarios" y "Solicitudes de registro" son dos páginas separadas en el menú lateral. Queremos unificarlas en una sola pantalla con dos pestañas en la parte superior. Además, moveremos la lógica de "Solicitudes" dentro de este nuevo diseño.

## Objetivo

1. Modificar el Sidebar (`DashboardLayout.tsx`) para quitar la opción "Solicitudes de registro".
2. Modificar `AdminUsuarios.tsx` para agregar el sistema de pestañas (Tabs).
3. Integrar la vista de solicitudes pendientes como la segunda pestaña.

## Lo que debés hacer

### 1. Limpiar el Sidebar en `src/layouts/DashboardLayout.tsx`

Buscar el enlace a `/admin/solicitudes` o "Solicitudes de registro" y **eliminarlo**. Todo el control de usuarios estará dentro de "Manejo de Usuarios".

### 2. Modificar `src/pages/AdminUsuarios.tsx`

Vamos a reestructurar la pantalla para que tenga el diseño de tu dibujo.

_Nota: Si el agente ya tenía código de "Solicitudes" en otra página, debe copiar la lógica de obtención de datos de esa página y traerla aquí._

```tsx
// src/pages/AdminUsuarios.tsx
import { useEffect, useState } from "react";
import {
  getUsuarios,
  deleteUsuario,
  resetPassword,
  createUsuario,
  updateUsuario,
} from "../api/usuarios.api";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/user.types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import {
  Loader2,
  Plus,
  MoreVertical,
  Ban,
  Key,
  CheckCircle,
  Copy,
  Check,
  Edit,
  UserCheck,
  Search,
} from "lucide-react";
import { useForm } from "../hooks/useForm";

export const AdminUsuarios = () => {
  // --- ESTADOS GLOBALES DE LA PÁGINA ---
  const [activeTab, setActiveTab] = useState<"gestion" | "solicitudes">(
    "gestion",
  );

  // (Aquí va el resto de estados que ya tenías: usuarios, isLoading, openMenuId, isModalOpen, etc.)
  // ...

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER CON PESTAÑAS (Tu dibujo) */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("gestion")}
            className={`pb-3 text-lg font-semibold transition-colors border-b-2 ${
              activeTab === "gestion"
                ? "border-institucional-600 text-institucional-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Gestión de Usuarios
          </button>

          <button
            onClick={() => setActiveTab("solicitudes")}
            className={`pb-3 text-lg font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "solicitudes"
                ? "border-institucional-600 text-institucional-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Solicitudes Pendientes
            {/* Opcional: Un contador rojo si hay solicitudes */}
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
              0
            </span>
          </button>
        </div>

        {/* Botón de Nuevo Usuario (solo se muestra en la pestaña de gestión) */}
        {activeTab === "gestion" && (
          <div className="flex gap-4 mb-3 md:mb-0">
            {/* BUSCADOR Y FILTRO QUE YA TENÍAS */}
            {/* ... */}
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nuevo Usuario
            </Button>
          </div>
        )}
      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA */}
      {activeTab === "gestion" ? (
        // --- PESTAÑA 1: TABLA DE USUARIOS (Tu código actual) ---
        <Card>
          {/* ... Aquí va el renderizado de tu tabla de usuarios, con sus filtros y botones de acción ... */}
          <div className="p-8 text-center text-gray-500">
            Aquí va la tabla de usuarios existente
          </div>
        </Card>
      ) : (
        // --- PESTAÑA 2: SOLICITUDES DE REGISTRO ---
        <Card>
          {/* (Traer aquí el diseño de "Solicitudes de registro" que ya habían hecho) */}
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Cuentas Pendientes
            </h2>

            {/* Ejemplo de cómo debería verse una solicitud */}
            {/* 
             <div className="flex justify-between items-center p-4 border border-gray-100 rounded-lg mb-2">
                <div>
                  <p className="font-medium">Juan Pérez (DNI: 12345678)</p>
                  <p className="text-sm text-gray-500">juan@hief.gob.ar - Solicitado hace 2 horas</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => handleApprove(1)}>Habilitar</Button>
                  <Button variant="danger" onClick={() => handleReject(1)}>Rechazar</Button>
                </div>
             </div>
             */}
          </div>
        </Card>
      )}

      {/* MODAL (Tu código actual) */}
      {/* ... */}
    </div>
  );
};
```

### 3. Verificación

- Correr `npm run build`.
- Hacer clic en "Gestión de Usuarios" en el menú lateral.
- Probar cambiar entre las dos pestañas arriba.

## Respuesta esperada

Confirmame que el archivo fue actualizado y si `npm run build` pasó.

# Tarea 70: Redirección desde notificaciones y acción "Marcar todas como leídas"

## Contexto

En la pantalla de notificaciones, al hacer clic en un mensaje, debe redirigir al usuario a la sección correspondiente (ej. si es una solicitud de registro, ir a `/admin/usuarios`). Además, necesitamos un botón arriba a la derecha para marcar todas las notificaciones como leídas de una sola vez.

## Objetivo

1. Actualizar `src/api/notificaciones.api.ts` con la función para marcar todas.
2. Modificar `src/pages/Notificaciones.tsx` para manejar la redirección según el tipo de mensaje.
3. Agregar el botón "Marcar todas como leídas".

## Lo que debés hacer

### 1. Actualizar `src/api/notificaciones.api.ts`

Agregar la función para marcar todas las notificaciones como leídas (si el backend aún no tiene el endpoint, el agente debe crearlo o simularlo en el frontend).

```typescript
export const markAllAsRead = async (): Promise<void> => {
  await axiosClient.put("/notificaciones/read-all");
};
```

### 2. Modificar `src/pages/Notificaciones.tsx`

- Importar `useNavigate` de `react-router-dom`.
- Importar el ícono `CheckCheck` de `lucide-react` (para el botón de marcar todas).
- Agregar el botón en el encabezado.

```tsx
// src/pages/Notificaciones.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificaciones,
  markAsRead,
  markAllAsRead,
  type Notificacion,
} from "../api/notificaciones.api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Loader2, Bell, CheckCircle, CheckCheck } from "lucide-react";

export const Notificaciones = () => {
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const data = await getNotificaciones();
      setNotifs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleReadAndRedirect = async (notif: Notificacion) => {
    // 1. Marcar como leída
    if (!notif.read) {
      await markAsRead(notif.id);
      setNotifs(
        notifs.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
    }

    // 2. Redirigir según el contenido del mensaje
    // (Usamos el título o el mensaje para saber a dónde ir)
    if (
      notif.title.toLowerCase().includes("solicitud") ||
      notif.message.toLowerCase().includes("habilitar su cuenta")
    ) {
      navigate("/admin/usuarios"); // Redirige a la gestión de usuarios
    } else if (
      notif.title.toLowerCase().includes("artículo") ||
      notif.message.toLowerCase().includes("manuscrito")
    ) {
      navigate("/revisiones"); // Ejemplo futuro
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifs(notifs.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error al marcar todas");
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
          <p className="text-gray-500 text-sm mt-1">
            Mensajes y avisos del sistema
          </p>
        </div>

        {/* BOTÓN MARCAR TODAS */}
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            onClick={handleMarkAll}
            className="flex items-center gap-2 text-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Bell className="w-12 h-12 mb-3 text-gray-300" />
            <p>No tienes notificaciones por el momento.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => handleReadAndRedirect(n)}
                className={`p-4 border-b border-gray-100 flex gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${!n.read ? "bg-blue-50/30" : ""}`}
              >
                <div
                  className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!n.read ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                >
                  {!n.read ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4
                    className={`text-sm ${!n.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
                  >
                    {n.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <span className="text-xs text-blue-500 mt-2 inline-block font-medium">
                    Haz clic para ir a la sección
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
```

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que el archivo fue actualizado y si `npm run build` pasó.

# Tarea 71: Arreglar botón "Marcar todas" y redirección a pestaña de Solicitudes

## Contexto

1. El botón de "Marcar todas" desaparece cuando no hay notificaciones sin leer. Queremos que siempre esté visible, pero deshabilitado si no hay nada que marcar.
2. Al hacer clic en una notificación de solicitud, debe redirigir a `/admin/usuarios` pero abriendo automáticamente la pestaña de "Solicitudes Pendientes".

## Lo que debés hacer

### 1. Modificar `src/pages/Notificaciones.tsx`

En el encabezado, cambiar la condición del botón:

```tsx
{
  /* BOTÓN MARCAR TODAS - Siempre visible, deshabilitado si no hay no leídas */
}
<Button
  variant="secondary"
  onClick={handleMarkAll}
  disabled={unreadCount === 0}
  className={`flex items-center gap-2 text-sm ${unreadCount === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
>
  <CheckCheck className="w-4 h-4" />
  Marcar todas como leídas
</Button>;
```

Y en la función `handleReadAndRedirect`, cambiar la ruta para pasarle un parámetro por URL:

```tsx
if (notif.title.toLowerCase().includes("solicitud")) {
  navigate("/admin/usuarios?tab=solicitudes"); // 👈 Le pasamos el parámetro
}
```

### 2. Modificar `src/pages/AdminUsuarios.tsx`

Necesitamos que esta pantalla "escuche" si la URL tiene `?tab=solicitudes` para abrir esa pestaña automáticamente.

Importar `useSearchParams` de `react-router-dom`:

```tsx
import { useSearchParams } from 'react-router-dom';

// Dentro del componente:
export const AdminUsuarios = () => {
  const [searchParams] = useSearchParams();

  // Inicializamos la pestaña según el parámetro de la URL
  const initialTab = searchParams.get('tab') === 'solicitudes' ? 'solicitudes' : 'gestion';
  const [activeTab, setActiveTab] = useState<'gestion' | 'solicitudes'>(initialTab);

  // ... el resto del código
```

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que los archivos fueron actualizados y si `npm run build` pasó.

# Tarea 72: Mostrar la fecha y hora de las notificaciones

## Contexto

Las notificaciones en `src/pages/Notificaciones.tsx` se muestran sin fecha. Queremos agregar la fecha y hora de creación (`createdAt`) debajo del mensaje, con un formato amigable.

## Objetivo

1. Agregar una función utilitaria para formatear fechas.
2. Mostrar la fecha en cada tarjeta de notificación.

## Lo que debés hacer

### 1. Crear `src/utils/formatDate.ts`

Crear un archivo para centralizar el formato de las fechas (así lo podemos usar en Artículos, Revisiones, etc. más adelante):

```typescript
export const formatDateTime = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Opción 1: Formato completo (ej: 13 nov 2026, 14:30)
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
```

### 2. Modificar `src/pages/Notificaciones.tsx`

- Importar la función: `import { formatDateTime } from '../utils/formatDate';`
- Dentro del `map` de las notificaciones, debajo del `<p>` del mensaje, agregar:

```tsx
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>

                  {/* FECHA Y HORA */}
                  <span className="text-xs text-gray-400 mt-2 block">
                    {formatDateTime(n.createdAt)}
                  </span>

                  <span className="text-xs text-blue-500 mt-1 inline-block font-medium">Haz clic para ir a la sección</span>
```

### 3. Verificación

- Correr `npm run build`.

## Respuesta esperada

Confirmame que el archivo fue actualizado y si `npm run build` pasó.
