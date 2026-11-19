import asyncio
from io import BytesIO
import unittest

from fastapi import HTTPException
from pypdf import PdfWriter
from starlette.datastructures import Headers, UploadFile

from app.main import analyze_similarity
from app.similarity.engine import DEMO_SOURCES, DEMO_TARGET_TEXT, compare_pages


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


if __name__ == "__main__":
    unittest.main()
