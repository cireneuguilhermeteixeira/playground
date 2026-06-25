#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import csv
import unicodedata
from pathlib import Path
from typing import Dict, List


LEGACY_TO_ENGLISH_COLUMNS = {
    "autores_evidencia": "evidence_authors",
}


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return " ".join(ascii_only.casefold().split())


def parse_authors(raw_value: str) -> List[str]:
    if not raw_value.strip():
        return []
    return [author.strip() for author in raw_value.split(",") if author.strip()]


def default_output_path(input_path: Path, person_name: str) -> Path:
    safe_name = normalize_text(person_name).replace(" ", "_")
    return input_path.with_name(f"{input_path.stem}_{safe_name}.csv")


def get_row_value(row: Dict[str, str], column_name: str) -> str:
    if column_name in row:
        return row.get(column_name, "")

    legacy_name = next(
        (legacy for legacy, english in LEGACY_TO_ENGLISH_COLUMNS.items() if english == column_name),
        None,
    )
    if legacy_name:
        return row.get(legacy_name, "")

    return ""


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Filters an event CSV and generates a new CSV containing only the rows for one person."
    )
    parser.add_argument("input", help="Input CSV, e.g. conversation/bsof_events.csv")
    parser.add_argument("--name", required=True, help="Person name to search for in 'evidence_authors'")
    parser.add_argument("--out", help="Output CSV. If omitted, it is generated automatically next to the original file.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.out) if args.out else default_output_path(input_path, args.name)
    target_name = normalize_text(args.name)

    matched_rows = []

    with open(input_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames

        if not fieldnames:
            raise RuntimeError("CSV has no header.")

        for row in reader:
            authors = parse_authors(get_row_value(row, "evidence_authors"))
            if any(normalize_text(author) == target_name for author in authors):
                matched_rows.append(row)

    with open(output_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(matched_rows)

    print(f"Filtered person: {args.name}")
    print(f"Rows found: {len(matched_rows)}")
    print(f"Generated file: {output_path}")


if __name__ == "__main__":
    main()
