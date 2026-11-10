# Especificacion SDD - Modulo de IA

**Proyecto:** Portal Cientifico HIEF  
**Modulo:** Microservicio de analisis asistido  
**Version:** 0.1.0  
**Estado:** Borrador para validacion editorial y tecnica  
**Fuente de contexto:** [`../spec.md`](../spec.md)  
**Contrato global:** [`../Contrato.md`](../Contrato.md)

> Esta especificacion define una propuesta de alcance. No habilita por si sola
> el procesamiento de documentos reales ni convierte las reglas observadas en
> una publicacion en normas editoriales oficiales. Los puntos marcados como
> pendientes requieren aprobacion antes de implementar el comportamiento
> correspondiente.

## 1. Contexto

El proyecto cuenta con un microservicio Python y FastAPI en `ai-service/`.
Actualmente expone comprobaciones basicas de salud y nombres de checklists; sus
funciones de similitud son prototipos y no constituyen una herramienta validada
para decisiones editoriales.

Se autorizo utilizar una edicion en PDF de la revista institucional como guia
para conocer su presentacion y variedad de contribuciones. La edicion contiene
material clinico, por lo que su autorizacion de uso no elimina la restriccion
del proyecto sobre datos de pacientes.

## 2. Objetivo

Construir, por etapas, una herramienta que ayude a revisar la integridad formal
de un manuscrito contra requisitos editoriales aprobados, mostrando hallazgos
explicables y evidencia localizable. La herramienta apoya al personal editorial;
no reemplaza su criterio ni decide la aceptacion, el rechazo o la existencia de
plagio.

## 3. Alcance propuesto del primer MVP

### Incluido

- Definir reglas editoriales versionadas, aprobadas por el equipo editorial.
- Recibir un PDF y el tipo de contribucion declarado por la persona usuaria.
- Comprobar si el PDF es valido y si permite extraer texto.
- Evaluar un conjunto acotado de requisitos formales verificables.
- Devolver el estado de cada comprobacion, una explicacion y evidencia, como
  pagina o fragmento breve cuando pueda identificarse.
- Marcar como no evaluable aquello que la extraccion o las reglas no permitan
  determinar con fiabilidad.
- Usar documentos sinteticos y casos controlados en las pruebas automatizadas.

### Excluido del primer MVP

- Determinar plagio, mala conducta, calidad cientifica, validez clinica o
  aceptabilidad editorial.
- Comparar manuscritos contra la revista, internet u otro corpus.
- Generar recomendaciones clinicas o interpretar informacion medica.
- Entrenar modelos con la revista o enviar documentos a proveedores externos.
- OCR de documentos escaneados; inicialmente esos archivos se reportan como no
  evaluables. OCR requiere una decision y evaluacion posteriores.
- Rechazar automaticamente un manuscrito o cambiar su estado editorial.

## 4. Privacidad y manejo de documentos

1. No se deben procesar historias clinicas, turnos ni datos sensibles de
   pacientes. Si un documento pudiera contenerlos, no se debe cargar al analizador.
2. La revista autorizada puede usarse para estudiar su estructura editorial,
   pero no como corpus de similitud ni como fuente de ejemplos con contenido
   clinico. La curacion debe limitarse a nombres de secciones y otros elementos
   editoriales necesarios, evitando copiar contenido de articulos.
3. El MVP debe procesar archivos localmente dentro de la infraestructura del
   proyecto y no transmitir su contenido a servicios externos.
4. El contenido del PDF y los fragmentos extraidos no deben aparecer en logs.
5. El comportamiento propuesto es procesamiento temporal sin persistir el PDF
   ni el texto extraido. Cualquier necesidad de retencion requiere aprobacion
   explicita, finalidad definida y plazo documentado.
6. La autorizacion institucional para usar la revista debe registrarse fuera de
   los datos del manuscrito; no es una autorizacion para procesar datos de
   pacientes.

## 5. Requisitos funcionales

| ID | Requisito |
|---|---|
| AI-FR-01 | El solicitante declara un tipo de contribucion de un catalogo aprobado; el servicio no lo infiere automaticamente en el MVP. |
| AI-FR-02 | El servicio valida que se recibio un archivo PDF y rechaza formatos invalidos con un error explicito. |
| AI-FR-03 | El limite de tamano propuesto es 10 MB, en consonancia con las cargas existentes. Debe confirmarse antes de implementarlo. |
| AI-FR-04 | Si no se extrae texto suficiente, el analisis devuelve un resultado `not_evaluable` y no marca requisitos como cumplidos. |
| AI-FR-05 | Cada regla aplicada se identifica por un `ruleId` estable y una version del conjunto de reglas. |
| AI-FR-06 | Cada resultado de regla usa uno de estos estados: `pass`, `needs_review` o `not_evaluable`. Ninguno representa una decision editorial. |
| AI-FR-07 | Cuando sea posible, cada hallazgo incluye evidencia localizable, como numero de pagina y un fragmento acotado. |
| AI-FR-08 | Los errores de archivo, extraccion y solicitud se distinguen de un analisis completado con hallazgos. |
| AI-FR-09 | El servicio no persiste el archivo ni el texto extraido en el MVP. |

## 6. Requisitos no funcionales

- **Explicabilidad:** cada estado debe apuntar a una regla y describir que se
  encontro o por que no pudo evaluarse.
- **Seguridad:** el servicio de IA es interno; el backend autentica al usuario y
  controla permisos. El servicio no debe exponerse directamente al navegador o
  a internet.
- **Privacidad por defecto:** registros tecnicos limitados a identificadores de
  solicitud, duracion, resultado tecnico y errores sin contenido documental.
- **Reproducibilidad:** toda respuesta completada identifica las versiones del
  analizador y de las reglas.
- **Aislamiento:** una falla al extraer texto se comunica como falla o resultado
  no evaluable, nunca como aprobacion implicita.

## 7. Contrato propuesto para el MVP

Este contrato es una propuesta para revisar; aun no forma parte del contrato
global aprobado.

### Solicitud

`POST /analyze/checklist` en el microservicio interno, con
`Content-Type: multipart/form-data`:

- `file`: PDF a evaluar.
- `contributionType`: identificador de un tipo de contribucion aprobado.

### Respuesta completada

El estado global del analisis sera `completed` si se pudieron evaluar las
reglas aplicables y `not_evaluable` si la extraccion no permite un analisis
utilizable. Los estados de cada hallazgo describen el resultado individual de
las reglas.

```json
{
  "success": true,
  "data": {
    "analysisId": "identificador-opaco",
    "status": "completed",
    "contributionType": "approved-type-id",
    "analyzerVersion": "0.1.0",
    "rulesetVersion": "draft-1",
    "findings": [
      {
        "ruleId": "abstract.presence",
        "status": "needs_review",
        "message": "No se pudo identificar con suficiente confianza una seccion de resumen.",
        "evidence": {
          "page": 2
        }
      }
    ],
    "disclaimer": "Resultado de apoyo; requiere revision editorial humana."
  }
}
```

### Errores

Las respuestas de error deben seguir el envoltorio global:

```json
{
  "success": false,
  "error": "El archivo supera el tamano maximo permitido."
}
```

Los codigos HTTP y los limites de longitud de fragmentos de evidencia deben
acordarse al aprobar el contrato. No se devuelve un porcentaje global ni una
etiqueta de plagio en este MVP. Antes de aprobarlo, se debe revisar el
`AIReportDTO` existente en `Contrato.md`, que actualmente contiene campos de
porcentaje de plagio/similitud y no representa este contrato propuesto.

## 8. Reglas editoriales y uso de la revista

La revista permite observar ejemplos de secciones institucionales, editoriales,
entrevistas, casos clinicos, revisiones narrativas, analisis de implementacion y
otros contenidos. Esta observacion no determina por si sola los requisitos
obligatorios de envio.

Antes de activar una regla, el equipo editorial debe aprobar:

- tipos de contribucion admitidos;
- secciones obligatorias u opcionales por tipo;
- sinonimos o encabezados aceptados;
- criterios verificables automaticamente;
- casos que requieren revision humana;
- ejemplos de prueba autorizados y libres de datos sensibles.

Los nombres y reglas concretos del catalogo quedan pendientes de validacion.
No se deben codificar como requisitos institucionales hasta recibir esa
aprobacion.

## 9. Criterios de aceptacion propuestos

1. Un PDF valido con texto seleccionable puede producir hallazgos con reglas
   identificables y versiones declaradas.
2. Un PDF corrupto o de otro formato devuelve un error explicito y no genera un
   resultado de cumplimiento.
3. Un PDF escaneado o sin texto suficiente queda como `not_evaluable`.
4. Las pruebas cubren, como minimo, presencia, ausencia, sinonimos aprobados,
   evidencia de pagina y contenido insuficiente, con documentos sinteticos.
5. Ninguna respuesta o interfaz afirma que el manuscrito es plagio, aceptado o
   rechazado.
6. Las pruebas verifican que el texto del documento no se escribe en logs ni
   se envia a servicios externos.
7. El analisis no altera el estado del articulo ni toma una decision editorial.

Los umbrales de extraccion suficiente, tamano maximo, tiempos de respuesta y
limites de evidencia son decisiones pendientes; se fijaran antes de convertir
estos criterios en pruebas normativas.

## 10. Etapas de desarrollo SDD

1. **Acordar:** obtener del equipo editorial tipos de contribucion, reglas
   formales y ejemplos autorizados sin datos de pacientes.
2. **Especificar:** actualizar este documento y aprobar los criterios de
   aceptacion y el contrato del endpoint.
3. **Diseñar:** definir el formato versionado de reglas, extractor de PDF,
   limites de evidencia y manejo de errores.
4. **Probar primero:** preparar documentos sinteticos y pruebas para los casos
   de aceptacion.
5. **Implementar:** construir extraccion, evaluacion determinista de checklist
   y endpoint interno en incrementos pequenos.
6. **Integrar:** conectar el backend, que autentica al usuario y aplica RBAC,
   con el servicio interno.
7. **Revisar:** demostrar resultados y limitaciones al equipo editorial;
   incorporar sus cambios actualizando version de reglas y especificacion.
8. **Considerar similitud:** tratarla como una iniciativa separada, con corpus
   autorizado, protocolo de evaluacion y aprobacion de privacidad antes de
   definir algoritmo o umbrales.

## 11. Decisiones pendientes

- [ ] Confirmar tipos de contribucion y reglas obligatorias con el equipo
  editorial.
- [ ] Confirmar que la primera version solo evalua checklist y no similitud.
- [ ] Aprobar el limite de 10 MB o definir otro.
- [ ] Definir umbral tecnico de texto extraido y comportamiento de PDFs mixtos
  (texto mas paginas escaneadas).
- [ ] Aprobar el contrato final, incluidos codigos HTTP y limites de evidencia.
- [ ] Confirmar despliegue interno, autenticacion entre servicios y politica de
  logs/retencion.
- [ ] Definir quien aprueba nuevas versiones del conjunto de reglas.
- [ ] Acordar si y como el comite autorizara en el futuro un corpus de
  similitud, independiente de la revista usada como guia.
