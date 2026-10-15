# Reglas Globales de Desarrollo (HIEF Journal)

Antes de generar cualquier código o arquitectura, consulta `#file:spec.md` como única fuente de la verdad.

## Reglas Estrictas de Código (Obligatorias)
1. **TypeScript Estricto:** Todo código en `/backend` y `/frontend` debe estar en TypeScript (`.ts` / `.tsx`). Prohibido usar `any`; define siempre interfaces o tipos.
2. **Arquitectura Modular Backend:** Cada módulo en `backend/src/modules/<modulo>/` lleva su `routes.ts`, `controller.ts`, `service.ts` y `model.ts`.
3. **Cero Dependencias Circulares en Sequelize:** NUNCA declares relaciones (`hasMany`, `belongsTo`) dentro de los archivos `*.model.ts`. Todas las asociaciones van exclusivamente en `backend/src/database/associations.ts`.
4. **Formato de Respuesta API:** Todo controlador de Express debe devolver `{ success: boolean, data?: T, error?: string }`.
5. **Frontend y Estilos:** Usa exclusivamente componentes funcionales en React con **Tailwind CSS**. Prohibido usar `style={{...}}` en línea. Respeta las carpetas `pages/`, `layouts/` y `features/`.
6. **Restricción Legal:** Prohibido crear variables, ejemplos o modelos sobre pacientes, historias clínicas o turnos médicos.