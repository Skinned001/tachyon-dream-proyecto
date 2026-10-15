# Instrucciones Obligatorias para GitHub Copilot (Portal HIEF)

Este repositorio sigue estrictamente la metodología **Spec-Driven Development (SDD)** guiada por el documento `spec.md`. Antes de escribir código, el Agente debe atenerse a estas reglas inquebrantables:

1. **Fuente de la Verdad:** Toda entidad, ruta, modelo de Sequelize y rol institucional debe ajustarse al 100% a los lineamientos descritos en `#file:spec.md`. No inventes campos ni rutas no especificadas.
2. **TypeScript Estricto:** Prohibido el uso del tipo `any`. Define interfaces explícitas o tipos en los módulos y componentes.
3. **Arquitectura Modular Backend:** Todo el backend se desarrolla bajo `backend/src/modules/<modulo>/` conteniendo `routes.ts`, `controller.ts`, `service.ts` y `model.ts`. Las asociaciones de Sequelize se escriben exclusivamente en `backend/src/database/associations.ts`.
4. **Estructura Frontend:** En React, mantén la separación entre `pages/`, `features/` y `layouts/`. Usa exclusivamente **Tailwind CSS** para los estilos visuales (cero estilos inline).
5. **Formato de Respuesta de API:** Todos los controladores de Express deben retornar los objetos JSON con las propiedades estándar `{ success, data, error }`.
6. **Restricción Legal Absoluta:** Jamás implementes modelos, atributos o flujos vinculados a datos de pacientes, historias clínicas o turnos médicos.