import re
import unicodedata
import uuid
from difflib import SequenceMatcher

ANALYZER_VERSION = "0.1.0"
MIN_MATCH_TOKENS = 8
MAX_FINDINGS = 50

DEMO_TARGET_TEXT = (
    "En una evaluación piloto del programa de acompañamiento, el equipo registró "
    "la participación de cada unidad durante ocho semanas."
)

DEMO_SOURCES = [
    {
        "label": "Referencia sintética 1",
        "pages": [
            "En una evaluación piloto del programa de acompañamiento, el equipo registró "
            "la participación de cada unidad durante ocho semanas. Los resultados se "
            "revisaron en una reunión mensual y se publicaron de forma agregada."
        ],
    },
    {
        "label": "Referencia sintética 2",
        "pages": [
            "Un equipo independiente organizó jornadas de capacitación y observó la "
            "asistencia de los participantes durante el período de prueba."
        ],
    },
]

DISCLAIMER = (
    "El análisis compara únicamente las fuentes indicadas. Una coincidencia potencial "
    "no determina plagio; la interpretación requiere revisión humana."
)


def _tokens(text: str) -> list[str]:
    normalized = unicodedata.normalize("NFKC", text).casefold()
    return re.findall(r"\w+", normalized, flags=re.UNICODE)


def compare_pages(
    target_pages: list[str],
    sources: list[dict[str, object]],
    source_mode: str,
    warnings: list[str] | None = None,
) -> dict[str, object]:
    if not any(_tokens(page) for page in target_pages):
        return {
            "analysisId": str(uuid.uuid4()),
            "status": "not_evaluable",
            "sourceMode": source_mode,
            "analyzerVersion": ANALYZER_VERSION,
            "findings": [],
            "warnings": warnings or [],
            "message": "No se pudo extraer texto suficiente del documento objetivo.",
            "disclaimer": DISCLAIMER,
        }

    findings: list[dict[str, object]] = []
    usable_sources = 0

    for source_index, source in enumerate(sources, start=1):
        label = str(source.get("label") or f"Referencia {source_index}")
        source_pages = source.get("pages")
        if not isinstance(source_pages, list):
            continue

        source_has_text = False
        for source_page_number, source_page in enumerate(source_pages, start=1):
            if not isinstance(source_page, str) or not _tokens(source_page):
                continue
            source_has_text = True
            source_tokens = _tokens(source_page)

            for target_page_number, target_page in enumerate(target_pages, start=1):
                target_tokens = _tokens(target_page)
                if not target_tokens:
                    continue
                matcher = SequenceMatcher(
                    None,
                    target_tokens,
                    source_tokens,
                    autojunk=False,
                )
                blocks = [
                    block
                    for block in matcher.get_matching_blocks()
                    if block.size >= MIN_MATCH_TOKENS
                ]
                if not blocks:
                    continue

                for block in blocks:
                    excerpt = " ".join(
                        target_tokens[block.a : block.a + block.size]
                    )
                    findings.append(
                        {
                            "sourceLabel": label,
                            "sourcePage": source_page_number,
                            "targetPage": target_page_number,
                            "excerpt": excerpt,
                            "matchedTokens": block.size,
                        }
                    )
                    if len(findings) >= MAX_FINDINGS:
                        break
                if len(findings) >= MAX_FINDINGS:
                    break
            if len(findings) >= MAX_FINDINGS:
                break

        if source_has_text:
            usable_sources += 1

    if usable_sources == 0:
        return {
            "analysisId": str(uuid.uuid4()),
            "status": "not_evaluable",
            "sourceMode": source_mode,
            "analyzerVersion": ANALYZER_VERSION,
            "findings": [],
            "warnings": warnings or [],
            "message": "No se pudo extraer texto suficiente de las fuentes de comparación.",
            "disclaimer": DISCLAIMER,
        }

    return {
        "analysisId": str(uuid.uuid4()),
        "status": "completed",
        "sourceMode": source_mode,
        "analyzerVersion": ANALYZER_VERSION,
        "findings": findings,
        "warnings": warnings or [],
        "message": (
            "Se encontraron coincidencias potenciales en las fuentes comparadas."
            if findings
            else "No se encontraron coincidencias en las fuentes comparadas."
        ),
        "disclaimer": DISCLAIMER,
    }
