def requirements_for_checklist(checklist_name: str) -> dict[str, object]:
    return {
        "checklist": checklist_name,
        "required_fields": ["title", "authors", "abstract", "keywords"],
        "status": "ready",
    }
