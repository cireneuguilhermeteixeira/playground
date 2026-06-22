#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import csv
import unicodedata
from pathlib import Path
from typing import List


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


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Filtra um CSV de eventos e gera um novo CSV contendo apenas as linhas de uma pessoa."
    )
    parser.add_argument("input", help="CSV de entrada, ex.: conversation/bsof_eventos.csv")
    parser.add_argument("--name", required=True, help="Nome da pessoa a procurar em 'autores_evidencia'")
    parser.add_argument("--out", help="CSV de saída. Se omitido, gera automaticamente ao lado do arquivo original.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.out) if args.out else default_output_path(input_path, args.name)
    target_name = normalize_text(args.name)

    matched_rows = []

    with open(input_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames

        if not fieldnames:
            raise RuntimeError("CSV sem cabecalho.")

        for row in reader:
            authors = parse_authors(row.get("autores_evidencia", ""))
            if any(normalize_text(author) == target_name for author in authors):
                matched_rows.append(row)

    with open(output_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(matched_rows)

    print(f"Pessoa filtrada: {args.name}")
    print(f"Linhas encontradas: {len(matched_rows)}")
    print(f"Arquivo gerado: {output_path}")


if __name__ == "__main__":
    main()
