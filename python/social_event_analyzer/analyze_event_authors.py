#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import csv
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return " ".join(ascii_only.casefold().split())


def parse_authors(raw_value: str) -> List[str]:
    if not raw_value.strip():
        return []
    return [author.strip() for author in raw_value.split(",") if author.strip()]


def extract_day(raw_value: str) -> str:
    raw_value = raw_value.strip()
    if not raw_value:
        return ""

    try:
        return datetime.strptime(raw_value, "%d/%m/%Y %H:%M").strftime("%Y-%m-%d")
    except ValueError:
        return raw_value


def analyze_csv(path: Path, target_name: str = "") -> Dict[str, object]:
    interaction_counts: Counter[str] = Counter()
    matched_rows = []
    target_norm = normalize_text(target_name) if target_name else ""
    counted_author_days = set()

    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        for row in reader:
            authors = parse_authors(row.get("autores_evidencia", ""))
            day_key = extract_day(row.get("block_inicio", ""))
            for author in authors:
                author_day_key = (author, day_key)
                if author_day_key not in counted_author_days:
                    interaction_counts[author] += 1
                    counted_author_days.add(author_day_key)

            if target_norm and any(normalize_text(author) == target_norm for author in authors):
                matched_rows.append(
                    {
                        "arquivo": str(path),
                        "block_id": row.get("block_id", ""),
                        "block_inicio": row.get("block_inicio", ""),
                        "dia": day_key,
                        "autores_evidencia": row.get("autores_evidencia", ""),
                        "tipo_convite": row.get("tipo_convite", ""),
                        "resumo_llm": row.get("resumo_llm", ""),
                    }
                )

    least_interactions = min(interaction_counts.values()) if interaction_counts else 0
    least_active_members = sorted(
        [author for author, count in interaction_counts.items() if count == least_interactions]
    )

    return {
        "arquivo": str(path),
        "interaction_counts": interaction_counts,
        "least_interactions": least_interactions,
        "least_active_members": least_active_members,
        "matched_rows": matched_rows,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Analisa os CSVs de eventos e conta interacoes por membro usando o campo "
            "'autores_evidencia'."
        )
    )
    parser.add_argument("input", nargs="+", help="Um ou mais arquivos CSV gerados pelo classificador")
    parser.add_argument(
        "--name",
        help="Nome especifico para localizar nas colunas 'autores_evidencia' (case/acento-insensitive)",
    )
    parser.add_argument(
        "--top",
        type=int,
        default=10,
        help="Quantidade de membros para mostrar no ranking. Padrao: 10",
    )
    args = parser.parse_args()

    aggregate_counts: Counter[str] = Counter()
    aggregate_matches = []

    for input_path in args.input:
        result = analyze_csv(Path(input_path), target_name=args.name or "")
        aggregate_counts.update(result["interaction_counts"])
        aggregate_matches.extend(result["matched_rows"])

        print(f"\nArquivo: {result['arquivo']}")
        print(f"Membros distintos: {len(result['interaction_counts'])}")
        if result["interaction_counts"]:
            print("Top interacoes:")
            for author, count in result["interaction_counts"].most_common(args.top):
                print(f"  {author}: {count}")

            print(
                f"Menor numero de dias com interacao: {result['least_interactions']} | "
                f"Membros: {', '.join(result['least_active_members'])}"
            )
        else:
            print("Nenhuma interacao encontrada em 'autores_evidencia'.")

    if len(args.input) > 1:
        print("\nConsolidado")
        print(f"Membros distintos: {len(aggregate_counts)}")
        if aggregate_counts:
            print("Top interacoes:")
            for author, count in aggregate_counts.most_common(args.top):
                print(f"  {author}: {count}")

            least_interactions = min(aggregate_counts.values())
            least_active_members = sorted(
                [author for author, count in aggregate_counts.items() if count == least_interactions]
            )
            print(
                f"Menor numero de dias com interacao: {least_interactions} | "
                f"Membros: {', '.join(least_active_members)}"
            )

    if args.name:
        print(f"\nOcorrencias para '{args.name}': {len(aggregate_matches)}")
        for row in aggregate_matches:
            print(
                f"  {row['arquivo']} | bloco {row['block_id']} | {row['block_inicio']} | dia {row['dia']} | "
                f"{row['autores_evidencia']} | {row['tipo_convite']} | {row['resumo_llm']}"
            )


if __name__ == "__main__":
    main()
