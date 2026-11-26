from dataclasses import dataclass, field
from typing import Protocol


@dataclass(frozen=True)
class CandidateSource:
    provider: str
    source_type: str
    label: str
    pages: list[str]
    url: str | None = None
    doi: str | None = None
    year: int | None = None
    authors: tuple[str, ...] = ()


@dataclass
class ProviderResult:
    candidates: list[CandidateSource] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


class SourceProvider(Protocol):
    name: str

    async def fetch_candidates(self, queries: list[str]) -> ProviderResult: ...
