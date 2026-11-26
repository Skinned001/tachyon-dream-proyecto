import asyncio
from io import BytesIO
import json
from pathlib import Path
import tempfile
import unittest

from fastapi import HTTPException
import httpx
from pypdf import PdfWriter
from starlette.datastructures import Headers, UploadFile

from app.main import analyze_similarity
from app.similarity.engine import DEMO_SOURCES, DEMO_TARGET_TEXT, compare_pages
from app.similarity.providers.base import CandidateSource
from app.similarity.providers.internal import InternalCorpusItem, InternalCorpusProvider
from app.similarity.providers.open_web import OpenWebProvider
from app.similarity.providers.scientific import ScientificApisProvider
from app.similarity.query_selector import select_search_queries


def make_text_pdf(text: str) -> bytes:
    stream = f"BT /F1 12 Tf 72 720 Td ({text}) Tj ET".encode("ascii")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        (
            b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>"
        ),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n"
        + stream
        + b"\nendstream",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, content in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("ascii"))
        pdf.extend(content)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        (
            f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("ascii")
    )
    return bytes(pdf)


class SimilarityEngineTests(unittest.TestCase):
    def test_demo_text_finds_a_localized_match(self) -> None:
        report = compare_pages(
            [DEMO_TARGET_TEXT],
            DEMO_SOURCES,
            "demo",
        )

        self.assertEqual(report["status"], "completed")
        findings = report["findings"]
        self.assertTrue(findings)
        self.assertEqual(findings[0]["sourceLabel"], "Referencia sintética 1")
        self.assertEqual(findings[0]["targetPage"], 1)
        self.assertGreaterEqual(findings[0]["matchedTokens"], 8)

    def test_unrelated_text_does_not_claim_a_match(self) -> None:
        report = compare_pages(
            ["Una descripción completamente diferente sobre astronomía."],
            DEMO_SOURCES,
            "demo",
        )

        self.assertEqual(report["status"], "completed")
        self.assertEqual(report["findings"], [])
        self.assertIn("fuentes comparadas", report["message"])

    def test_missing_target_text_is_not_evaluable(self) -> None:
        report = compare_pages(["   "], DEMO_SOURCES, "demo")

        self.assertEqual(report["status"], "not_evaluable")
        self.assertEqual(report["findings"], [])

    def test_demo_endpoint_uses_synthetic_sources(self) -> None:
        report = asyncio.run(
            analyze_similarity(
                source_mode="demo",
                target_file=None,
                target_text=None,
                reference_files=None,
            )
        )["data"]

        self.assertEqual(report["status"], "completed")
        self.assertEqual(report["sourceMode"], "demo")
        self.assertTrue(report["findings"])

    def test_uploaded_mode_requires_reference_files(self) -> None:
        with self.assertRaises(HTTPException) as error:
            asyncio.run(
                analyze_similarity(
                    source_mode="uploaded",
                    target_file=None,
                    target_text="Texto de prueba suficientemente largo.",
                    reference_files=None,
                )
            )

        self.assertEqual(error.exception.status_code, 400)

    def test_pdf_without_extractable_text_is_not_evaluable(self) -> None:
        writer = PdfWriter()
        writer.add_blank_page(width=72, height=72)
        pdf = BytesIO()
        writer.write(pdf)
        target = UploadFile(
            filename="blank.pdf",
            file=BytesIO(pdf.getvalue()),
            headers=Headers({"content-type": "application/pdf"}),
        )

        report = asyncio.run(
            analyze_similarity(
                source_mode="demo",
                target_file=target,
                target_text=None,
                reference_files=None,
            )
        )["data"]

        self.assertEqual(report["status"], "not_evaluable")
        self.assertEqual(report["findings"], [])

    def test_uploaded_pdfs_produce_a_localized_match(self) -> None:
        target_text = (
            "The research team recorded community participation across eight "
            "consecutive weeks."
        )
        reference_text = (
            "During the pilot period, the research team recorded community "
            "participation across eight consecutive weeks for review."
        )
        target = UploadFile(
            filename="target.pdf",
            file=BytesIO(make_text_pdf(target_text)),
            headers=Headers({"content-type": "application/pdf"}),
        )
        reference = UploadFile(
            filename="reference.pdf",
            file=BytesIO(make_text_pdf(reference_text)),
            headers=Headers({"content-type": "application/pdf"}),
        )

        report = asyncio.run(
            analyze_similarity(
                source_mode="uploaded",
                target_file=target,
                target_text=None,
                reference_files=[reference],
            )
        )["data"]

        self.assertEqual(report["status"], "completed")
        self.assertEqual(report["findings"][0]["sourceLabel"], "Referencia cargada 1")
        self.assertEqual(report["findings"][0]["targetPage"], 1)


class MultiSourceSimilarityTests(unittest.TestCase):
    def test_query_selector_sanitizes_pii_and_skips_bibliography(self) -> None:
        pages = [
            (
                "La vigilancia epidemiologica hospitalaria detecto resistencia antimicrobiana "
                "en pacientes adultos con neumonia adquirida en la comunidad. "
                "Contacto del autor investigador@hospital.org y legajo 38492011."
            ),
            "Referencias bibliograficas\n1. Perez J. Estudio previo de neumonia comunitaria 2024.",
        ]

        queries = select_search_queries(pages, max_queries=4)

        self.assertTrue(queries)
        joined = " ".join(queries)
        self.assertNotIn("investigador@hospital.org", joined)
        self.assertNotIn("38492011", joined)
        self.assertNotIn("Perez", joined)

    def test_lexical_similarity_detects_paraphrase_and_citation_flag(self) -> None:
        target = [
            (
                "El protocolo terapeutico temprano disminuyo la mortalidad hospitalaria "
                "en pacientes criticos con sepsis bacteriana aguda."
            ),
            "Referencias\n1. Garcia M. Terapia precoz en sepsis. 10.1234/sepsis.2025",
        ]
        sources = [
            CandidateSource(
                provider="openalex",
                source_type="scientific_api",
                label="OpenAlex: Terapia precoz en sepsis bacteriana",
                doi="10.1234/sepsis.2025",
                url="https://doi.org/10.1234/sepsis.2025",
                year=2025,
                pages=[
                    "La aplicacion temprana del protocolo terapeutico redujo la mortalidad "
                    "hospitalaria entre pacientes criticos con sepsis bacteriana aguda."
                ],
            )
        ]

        report = compare_pages(target, sources, "corpus")

        self.assertEqual(report["status"], "completed")
        self.assertTrue(report["findings"])
        finding = report["findings"][0]
        self.assertEqual(finding["matchType"], "lexical")
        self.assertEqual(finding["provider"], "openalex")
        self.assertTrue(finding["isCited"])
        self.assertGreaterEqual(finding["similarityScore"], 42)

    def test_internal_corpus_reads_pdf_and_blocks_path_traversal(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            articles_dir = root / "articles"
            articles_dir.mkdir()
            pdf_file = articles_dir / "pub-1.pdf"
            pdf_file.write_bytes(
                make_text_pdf("Estudio clinico retrospectivo en terapia intensiva pediatrica.")
            )
            outside_file = root.parent / "secret.pdf"
            outside_file.write_bytes(make_text_pdf("Contenido externo no permitido."))
            try:
                provider = InternalCorpusProvider(
                    items=[
                        InternalCorpusItem(
                            item_id=1,
                            source_type="internal_article",
                            title="Articulo publicado 1",
                            relative_path="articles/pub-1.pdf",
                            url="/api/articulos/publicados/1/pdf",
                        ),
                        InternalCorpusItem(
                            item_id=2,
                            source_type="internal_library",
                            title="Intento traversal",
                            relative_path="../secret.pdf",
                        ),
                    ],
                    uploads_root=root,
                )

                result = asyncio.run(provider.fetch_candidates([]))
            finally:
                outside_file.unlink(missing_ok=True)

            self.assertEqual(len(result.candidates), 1)
            self.assertEqual(result.candidates[0].provider, "internal_corpus")
            self.assertIn("Articulo publicado 1", result.candidates[0].label)
            self.assertTrue(any("ruta no permitida" in w for w in result.warnings))

    def test_scientific_providers_parse_dedupe_and_handle_timeout(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            host = request.url.host
            if host == "api.openalex.org":
                return httpx.Response(
                    200,
                    json={
                        "results": [
                            {
                                "id": "https://openalex.org/W1",
                                "doi": "https://doi.org/10.1000/shared",
                                "display_name": "Control glucemico en internacion",
                                "publication_year": 2024,
                                "open_access": {"oa_url": "https://example.org/oa.pdf"},
                                "authorships": [{"author": {"display_name": "Ana Gomez"}}],
                                "abstract_inverted_index": {
                                    "Protocolo": [0],
                                    "clinico": [1],
                                    "para": [2],
                                    "control": [3],
                                    "glucemico": [4],
                                },
                            }
                        ]
                    },
                )
            if host == "api.crossref.org":
                return httpx.Response(
                    200,
                    json={
                        "message": {
                            "items": [
                                {
                                    "DOI": "10.1000/shared",
                                    "title": ["Control glucemico en internacion"],
                                    "abstract": "<jats:p>Resumen duplicado por DOI.</jats:p>",
                                }
                            ]
                        }
                    },
                )
            raise httpx.ReadTimeout("timeout", request=request)

        async def run() -> object:
            async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
                provider = ScientificApisProvider(client=client)
                return await provider.fetch_candidates(["protocolo control glucemico internacion"])

        result = asyncio.run(run())

        self.assertEqual(len(result.candidates), 1)
        self.assertEqual(result.candidates[0].doi, "10.1000/shared")
        self.assertIn("Protocolo clinico para control glucemico", result.candidates[0].pages[0])
        self.assertTrue(any("europe_pmc" in w for w in result.warnings))

    def test_open_web_provider_returns_graceful_unconfigured_warning(self) -> None:
        result = asyncio.run(OpenWebProvider().fetch_candidates(["consulta prueba"]))
        self.assertEqual(result.candidates, [])
        self.assertTrue(result.warnings)

    def test_corpus_endpoint_validates_empty_sources(self) -> None:
        with self.assertRaises(HTTPException) as error:
            asyncio.run(
                analyze_similarity(
                    source_mode="corpus",
                    target_file=None,
                    target_text="Texto valido de prueba para analisis.",
                    reference_files=None,
                    include_internal_corpus=False,
                    include_scientific_apis=False,
                    include_open_web=False,
                )
            )
        self.assertEqual(error.exception.status_code, 400)


if __name__ == "__main__":
    unittest.main()
