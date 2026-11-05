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
