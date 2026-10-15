# Instrucciones Obligatorias para GitHub Copilot (Portal HIEF)

Este repositorio sigue estrictamente la metodología **Spec-Driven Development (SDD)** guiada por los documentos `spec.md` y `contrato.md` ubicados en la raíz. Antes de escribir código, el Agente debe atenerse a estas reglas inquebrantables:

1. **Fuente de la Verdad Dual:** 
   - Para arquitectura, modelos de Sequelize, reglas de negocio y roles (RBAC), consulta `#file:spec.md`.
   - Para rutas de Express (`*.routes.ts`), clientes Axios (`*.api.ts`), payloads, DTOs e interfaces de comunicación Frontend-Backend, consulta obligatoriamente `#file:contrato.md`. No inventes endpoints ni propiedades que no figuren allí.
2. **TypeScript Estricto:** Prohibido el uso del tipo `any`. Define interfaces explícitas o tipos en los módulos y componentes respetando `contrato.md`.
3. **Arquitectura Modular Backend:** Todo el backend se desarrolla bajo `backend/src/modules/<modulo>/` conteniendo `routes.ts`, `controller.ts`, `service.ts` y `model.ts`. Las asociaciones de Sequelize se escriben exclusivamente en `backend/src/database/associations.ts`.
4. **Estructura Frontend:** En React, mantén la separación entre `pages/`, `features/`, `layouts/` y `api/`. Usa exclusivamente **Tailwind CSS** para los estilos visuales (cero estilos inline).
5. **Formato de Respuesta de API:** Todos los controladores de Express deben retornar objetos JSON con la estructura `{ success: boolean, data?: T, error?: string }`.
6. **Restricción Legal Absoluta:** Jamás implementes modelos, atributos o flujos vinculados a datos de pacientes, historias clínicas o turnos médicos.