#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
whatsapp_event_classifier.py

Lê um .txt exportado do WhatsApp, agrupa mensagens em blocos de 2 a 6 horas,
usa uma LLM para classificar convites/eventos e gera um CSV revisável.

Uso:
  pip install openai python-dotenv
  export OPENAI_API_KEY="sua-chave"

  python whatsapp_event_classifier.py conversa.txt --out eventos.csv
  python whatsapp_event_classifier.py conversa.txt --out eventos.csv --block-hours 2
  python whatsapp_event_classifier.py conversa.txt --out eventos.csv --block-hours 6

Regras adotadas:
- Qualquer convite no grupo é tratado como convite geral.
- O script não tenta decidir se uma pessoa específica foi ou não.
- A LLM só classifica convites/eventos dentro de blocos temporais.
- O script faz a contagem/deduplicação e gera CSV para revisão manual.
"""

import argparse
import csv
import json
import os
from pathlib import Path
import re
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple

try:
    from openai import OpenAI
except ImportError:
    raise SystemExit(
        "Dependência ausente: instale o pacote 'openai' antes de rodar o script.\n"
        "Comando: pip install openai python-dotenv"
    )

try:
    from dotenv import load_dotenv
except ImportError:
    raise SystemExit(
        "Dependência ausente: instale o pacote 'python-dotenv' antes de rodar o script.\n"
        "Comando: pip install openai python-dotenv"
    )


DEFAULT_MODEL = "gpt-4.1-nano"
DEFAULT_MIN_DATE = "25/06/2024"
LLM_CONTEXT_RADIUS = 2
LLM_MAX_OUTPUT_TOKENS = 800
DEBUG_DIRNAME = "debug_llm"

INVITE_KEYWORDS = [
    "bora", "vamos", "kd","vamo", "partiu", "sair", "rolê", "role", "bar",
    "barzinho", "churrasco","cuida", "cinema", "partiu", "88bier", "tomar umas", "paraiba", "paraíba", "praia", "restaurante", "pizzaria",
    "aniversário", "aniversario", "festa", "resenha", "sextou",
    "quem vai", "topa", "topam", "marcar", "marcamos", "combinar",
    "encontrar", "juntar", "junta", "tomar uma", "beber", "jogar bola",
    "racha", "trilha", "viagem", "almoço", "almoco", "jantar", "caf[eé]",
    "hoje", "amanhã", "amanha", "sábado", "sabado", "domingo"
]

SYSTEM_PROMPT = """
Você é um classificador de mensagens de WhatsApp.

Tarefa:
Analisar um bloco temporal de conversa e extrair TODOS os convites, propostas ou combinações
para evento social, saída, encontro, churrasco, bar, aniversário, cinema, praia, almoço, jantar,
festa, rolê ou atividade em grupo.

Regras:
1. Considere convite mesmo sem citar nomes específicos.
2. Se alguém citar apenas uma pessoa, ainda assim classifique a mensagem como convite.
3. Não tente inferir convidados individuais.
4. Não decida se uma pessoa foi ou não. Isso será revisão manual.
5. Se houver mais de um convite no bloco, retorne todos na lista "invites".
6. Se não houver convite real, retorne "invites": [].
7. Retorne somente JSON válido no schema pedido.
8. Se houver dúvida razoável, inclua o convite com confidence menor.
9. Use evidence_message_ids com os ids das mensagens mais importantes.
10. Não invente mensagens nem ids.

Campos de cada convite:
- invite_type: string. Ex: "bar", "churrasco", "cinema", "aniversario", "praia", "jantar", "almoco", "generico", "outro"
- event_date_text: string ou null. Data/hora do evento mencionada no texto, se houver. Ex: "sábado", "hoje", "amanhã", "dia 12", null.
- summary: string curta explicando o convite.
- evidence_message_ids: lista de ids das mensagens mais relevantes.
- confidence: número de 0 a 1.
"""

JSON_SCHEMA = {
    "name": "whatsapp_invites_block_classification",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "invites": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "invite_type": {"type": "string"},
                        "event_date_text": {"type": ["string", "null"]},
                        "summary": {"type": "string"},
                        "evidence_message_ids": {
                            "type": "array",
                            "items": {"type": "integer"}
                        },
                        "confidence": {"type": "number"}
                    },
                    "required": [
                        "invite_type",
                        "event_date_text",
                        "summary",
                        "evidence_message_ids",
                        "confidence"
                    ]
                }
            }
        },
        "required": ["invites"]
    },
    "strict": True
}


@dataclass
class Message:
    id: int
    dt: Optional[datetime]
    date_raw: str
    author: str
    text: str


@dataclass
class Block:
    id: int
    start: datetime
    end: datetime
    messages: List[Message]


def parse_whatsapp_txt(path: str) -> List[Message]:
    """
    Parser tolerante para exports em português.
    Aceita formatos comuns:
      21/06/2026 10:32 - João: mensagem
      21/06/2026, 10:32 - João: mensagem
      [21/01/26, 19:39:18] João: mensagem
      [21/06/2026, 10:32:10] João: mensagem

    Mensagens multilinha são anexadas à mensagem anterior.
    """
    patterns = [
        re.compile(r"^(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+-\s+([^:]+):\s?(.*)$"),
        re.compile(r"^\[(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\]\s+([^:]+):\s?(.*)$"),
    ]

    messages: List[Message] = []

    def parse_dt(date_s: str, time_s: str) -> Optional[datetime]:
        for fmt in ("%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M", "%d/%m/%y %H:%M:%S", "%d/%m/%y %H:%M"):
            try:
                return datetime.strptime(f"{date_s} {time_s}", fmt)
            except ValueError:
                pass
        return None

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.rstrip("\n")
            matched = None

            for p in patterns:
                m = p.match(line)
                if m:
                    matched = m
                    break

            if matched:
                date_s, time_s, author, text = matched.groups()
                dt = parse_dt(date_s, time_s)

                messages.append(
                    Message(
                        id=len(messages),
                        dt=dt,
                        date_raw=f"{date_s} {time_s}",
                        author=author.strip(),
                        text=text.strip()
                    )
                )
            else:
                if messages:
                    messages[-1].text += "\n" + line.strip()

    return messages


def parse_date_or_fail(date_s: str) -> datetime:
    for fmt in ("%d/%m/%Y", "%d/%m/%y"):
        try:
            return datetime.strptime(date_s, fmt)
        except ValueError:
            pass
    raise ValueError(f"Data inválida: {date_s}. Use DD/MM/AA ou DD/MM/AAAA.")


def filter_messages_since(messages: List[Message], min_date: datetime) -> List[Message]:
    filtered = [msg for msg in messages if msg.dt and msg.dt >= min_date]

    return [
        Message(
            id=idx,
            dt=msg.dt,
            date_raw=msg.date_raw,
            author=msg.author,
            text=msg.text,
        )
        for idx, msg in enumerate(filtered)
    ]


def looks_like_invite(text: str) -> bool:
    t = text.lower()

    for kw in INVITE_KEYWORDS:
        if re.search(rf"\b{kw}\b", t, flags=re.IGNORECASE):
            return True

    return False


def floor_datetime_to_block(dt: datetime, block_hours: int) -> datetime:
    hour = (dt.hour // block_hours) * block_hours
    return dt.replace(hour=hour, minute=0, second=0, microsecond=0)


def group_messages_by_time_block(messages: List[Message], block_hours: int) -> List[Block]:
    """
    Agrupa mensagens por blocos fixos do dia:
    block_hours=2 => 00-02, 02-04, 04-06...
    block_hours=4 => 00-04, 04-08, 08-12...
    block_hours=6 => 00-06, 06-12, 12-18...
    """
    grouped: Dict[Tuple[datetime, datetime], List[Message]] = {}

    for msg in messages:
        if msg.dt is None:
            continue

        start = floor_datetime_to_block(msg.dt, block_hours)
        end = start + timedelta(hours=block_hours)
        grouped.setdefault((start, end), []).append(msg)

    blocks = []
    for idx, ((start, end), block_messages) in enumerate(sorted(grouped.items()), start=1):
        blocks.append(Block(id=idx, start=start, end=end, messages=block_messages))

    return blocks


def filter_candidate_blocks(blocks: List[Block]) -> List[Block]:
    """
    Pré-filtro barato:
    só envia para a LLM blocos que tenham pelo menos uma palavra-chave de convite.
    """
    return [
        block for block in blocks
        if any(looks_like_invite(msg.text) for msg in block.messages)
    ]


def format_block(block: Block) -> str:
    lines = [
        f"BLOCO {block.id}: {block.start.strftime('%d/%m/%Y %H:%M')} até {block.end.strftime('%d/%m/%Y %H:%M')}"
    ]

    for m in block.messages:
        lines.append(f"[id={m.id}] [{m.date_raw}] {m.author}: {m.text}")

    return "\n".join(lines)


def build_llm_context(block: Block, radius: int = LLM_CONTEXT_RADIUS) -> str:
    """
    Reduz tokens enviados para a LLM:
    mantém mensagens com cara de convite e um pequeno contexto ao redor.
    """
    candidate_indexes = [
        idx for idx, msg in enumerate(block.messages)
        if looks_like_invite(msg.text)
    ]

    if not candidate_indexes:
        return format_block(block)

    selected_indexes = set()
    for idx in candidate_indexes:
        start = max(0, idx - radius)
        end = min(len(block.messages), idx + radius + 1)
        selected_indexes.update(range(start, end))

    lines = [
        (
            f"BLOCO {block.id}: {block.start.strftime('%d/%m/%Y %H:%M')} "
            f"até {block.end.strftime('%d/%m/%Y %H:%M')} "
            f"(recorte com {len(selected_indexes)}/{len(block.messages)} mensagens)"
        )
    ]

    for idx, msg in enumerate(block.messages):
        if idx in selected_indexes:
            lines.append(f"[id={msg.id}] [{msg.date_raw}] {msg.author}: {msg.text}")

    return "\n".join(lines)


def extract_json_candidate(text: str) -> str:
    cleaned = text.strip()
    if not cleaned:
        return ""

    fenced_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, flags=re.DOTALL)
    if fenced_match:
        return fenced_match.group(1).strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        return cleaned[start:end + 1].strip()

    return cleaned


def parse_response_json(response: Any) -> Dict[str, Any]:
    if getattr(response, "output_parsed", None):
        return response.output_parsed

    output_text = getattr(response, "output_text", "") or ""
    if output_text.strip():
        return json.loads(extract_json_candidate(output_text))

    for item in getattr(response, "output", []) or []:
        for content in getattr(item, "content", []) or []:
            parsed = getattr(content, "parsed", None)
            if parsed:
                return parsed

            text_value = getattr(content, "text", "") or ""
            if text_value.strip():
                return json.loads(extract_json_candidate(text_value))

    raise ValueError("Resposta da API veio sem JSON utilizável.")


def summarize_response_debug(response: Any, max_chars: int = 1200) -> str:
    parts = []

    output_text = getattr(response, "output_text", None)
    if output_text is not None:
        parts.append(f"output_text={repr(output_text[:max_chars])}")

    output_items = getattr(response, "output", None)
    if output_items:
        for item_idx, item in enumerate(output_items[:3]):
            item_type = getattr(item, "type", type(item).__name__)
            parts.append(f"output[{item_idx}].type={item_type}")

            for content_idx, content in enumerate((getattr(item, "content", []) or [])[:3]):
                content_type = getattr(content, "type", type(content).__name__)
                text_value = getattr(content, "text", None)
                parsed = getattr(content, "parsed", None)
                parts.append(
                    f"output[{item_idx}].content[{content_idx}].type={content_type}"
                )
                if text_value is not None:
                    parts.append(
                        f"output[{item_idx}].content[{content_idx}].text="
                        f"{repr(text_value[:max_chars])}"
                    )
                if parsed is not None:
                    parts.append(
                        f"output[{item_idx}].content[{content_idx}].parsed={repr(parsed)}"
                    )

    if not parts:
        parts.append(repr(response))

    debug_text = "\n".join(parts)
    return debug_text[:max_chars]


def write_debug_artifacts(block: Block, context: str, response: Any) -> None:
    debug_dir = Path(DEBUG_DIRNAME)
    debug_dir.mkdir(exist_ok=True)

    base_path = debug_dir / f"block_{block.id:04d}"
    response_text = summarize_response_debug(response, max_chars=20000)

    with open(base_path.with_suffix(".context.txt"), "w", encoding="utf-8") as f:
        f.write(context)

    with open(base_path.with_suffix(".response.txt"), "w", encoding="utf-8") as f:
        f.write(response_text)


def summarize_exception_debug(exc: Exception, max_chars: int = 4000) -> str:
    parts = [
        f"exception_type={type(exc).__name__}",
        f"exception_str={str(exc)}",
    ]

    for attr_name in ("status_code", "request_id", "body", "response"):
        attr_value = getattr(exc, attr_name, None)
        if attr_value is not None:
            parts.append(f"{attr_name}={repr(attr_value)}")

    debug_text = "\n".join(parts)
    return debug_text[:max_chars]


def classify_block(client: OpenAI, model: str, block: Block) -> Dict[str, Any]:
    context = build_llm_context(block)
    try:
        response = client.responses.create(
            model=model,
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        "Classifique TODOS os convites existentes no bloco abaixo.\n\n"
                        f"{context}"
                    )
                }
            ],
            text={
                "format": {
                    "type": "json_schema",
                    "name": JSON_SCHEMA["name"],
                    "schema": JSON_SCHEMA["schema"],
                    "strict": True
                }
            },
            max_output_tokens=LLM_MAX_OUTPUT_TOKENS,
        )
    except Exception as exc:
        print(f"Erro da API no bloco {block.id}:", flush=True)
        print(summarize_exception_debug(exc), flush=True)
        raise

    try:
        return parse_response_json(response)
    except Exception as exc:
        write_debug_artifacts(block, context, response)
        print(f"Falha ao interpretar resposta do bloco {block.id}: {exc}", flush=True)
        print("Trecho da resposta bruta da API:", flush=True)
        print(summarize_response_debug(response), flush=True)
        print(
            f"Arquivos de debug salvos em {DEBUG_DIRNAME}/block_{block.id:04d}.context.txt "
            f"e {DEBUG_DIRNAME}/block_{block.id:04d}.response.txt",
            flush=True,
        )
        raise


def make_context_excerpt(block: Block, evidence_ids: List[int], radius: int = 6) -> str:
    """
    Em vez de salvar o bloco inteiro no CSV, salva um recorte ao redor das evidências.
    Isso deixa o CSV mais leve.
    """
    if not evidence_ids:
        return format_block(block)

    indexes = [
        i for i, msg in enumerate(block.messages)
        if msg.id in set(evidence_ids)
    ]

    if not indexes:
        return format_block(block)

    start_idx = max(0, min(indexes) - radius)
    end_idx = min(len(block.messages), max(indexes) + radius + 1)

    excerpt = block.messages[start_idx:end_idx]
    lines = [
        f"RECORTE DO BLOCO {block.id}: {block.start.strftime('%d/%m/%Y %H:%M')} até {block.end.strftime('%d/%m/%Y %H:%M')}"
    ]

    for m in excerpt:
        lines.append(f"[id={m.id}] [{m.date_raw}] {m.author}: {m.text}")

    return "\n".join(lines)


def build_rows_from_invites(block: Block, result: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows = []

    for invite in result.get("invites", []):
        evidence_ids = invite.get("evidence_message_ids") or []
        evidence_messages = [m for m in block.messages if m.id in set(evidence_ids)]

        # fallback: se a LLM não apontar ids válidos, pega mensagens candidatas do bloco
        if not evidence_messages:
            evidence_messages = [m for m in block.messages if looks_like_invite(m.text)]

        evidence_text = "\n".join(
            f"[id={m.id}] [{m.date_raw}] {m.author}: {m.text}"
            for m in evidence_messages
        )

        rows.append({
            "block_id": block.id,
            "block_inicio": block.start.strftime("%d/%m/%Y %H:%M"),
            "block_fim": block.end.strftime("%d/%m/%Y %H:%M"),
            "message_ids_evidencia": ",".join(str(m.id) for m in evidence_messages),
            "data_primeira_evidencia": evidence_messages[0].date_raw if evidence_messages else "",
            "autores_evidencia": ", ".join(sorted(set(m.author for m in evidence_messages))),
            "tipo_convite": invite.get("invite_type"),
            "data_evento_mencionada": invite.get("event_date_text"),
            "confianca": invite.get("confidence"),
            "resumo_llm": invite.get("summary"),
            "mensagens_evidencia": evidence_text,
            "contexto": make_context_excerpt(block, evidence_ids),
            "revisao_manual_eh_convite": "",
            "revisao_manual_pessoa_foi": "",
            "revisao_manual_observacao": ""
        })

    return rows


def build_output_path(input_path: str, out_arg: Optional[str], multiple_inputs: bool) -> Path:
    input_file = Path(input_path)

    if not out_arg:
        return input_file.with_name(f"{input_file.stem}_eventos.csv")

    out_path = Path(out_arg)
    if multiple_inputs:
        out_path.mkdir(parents=True, exist_ok=True)
        return out_path / f"{input_file.stem}_eventos.csv"

    return out_path


def process_input_file(client: OpenAI, input_path: str, args: argparse.Namespace, min_date: datetime) -> None:
    output_path = build_output_path(input_path, args.out, len(args.input) > 1)
    original_messages = parse_whatsapp_txt(input_path)
    messages = filter_messages_since(original_messages, min_date)
    blocks = group_messages_by_time_block(messages, args.block_hours)

    candidate_blocks = blocks if args.no_prefilter else filter_candidate_blocks(blocks)

    print(f"\nArquivo: {input_path}")
    print(f"Mensagens lidas: {len(original_messages)}")
    print(f"Mensagens consideradas desde {min_date.strftime('%d/%m/%Y')}: {len(messages)}")
    print(f"Blocos totais de {args.block_hours}h: {len(blocks)}")
    print(f"Blocos enviados para LLM: {len(candidate_blocks)}")

    rows = []

    for idx, block in enumerate(candidate_blocks, start=1):
        print(
            f"Classificando bloco {idx}/{len(candidate_blocks)} "
            f"({block.start.strftime('%d/%m/%Y %H:%M')} - {block.end.strftime('%H:%M')})..."
        )

        try:
            result = classify_block(client, args.model, block)
        except Exception as e:
            print(f"Erro no bloco {block.id}: {e}")
            continue

        rows.extend(build_rows_from_invites(block, result))
        time.sleep(args.sleep)

    dedup = {}
    for row in rows:
        key = (
            row["message_ids_evidencia"],
            row["tipo_convite"],
            row["data_evento_mencionada"],
            row["resumo_llm"]
        )
        dedup[key] = row

    rows = list(dedup.values())
    rows.sort(key=lambda r: (r["block_inicio"], r["message_ids_evidencia"]))

    fieldnames = [
        "block_id",
        "block_inicio",
        "block_fim",
        "message_ids_evidencia",
        "data_primeira_evidencia",
        "autores_evidencia",
        "tipo_convite",
        "data_evento_mencionada",
        "confianca",
        "resumo_llm",
        "mensagens_evidencia",
        "contexto",
        "revisao_manual_eh_convite",
        "revisao_manual_pessoa_foi",
        "revisao_manual_observacao"
    ]

    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Convites encontrados para revisão: {len(rows)}")
    print(f"Arquivo gerado: {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="+", help="Um ou mais arquivos .txt exportados do WhatsApp")
    parser.add_argument("--out", help="CSV de saída para arquivo único, ou diretório de saída quando houver múltiplos arquivos")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Modelo usado na classificação")
    parser.add_argument("--min-date", default=DEFAULT_MIN_DATE, help="Ignora mensagens anteriores a esta data. Padrão: 25/06/2024")
    parser.add_argument("--block-hours", type=int, default=4, choices=[2, 3, 4, 5, 6], help="Tamanho do bloco temporal em horas. Padrão: 4")
    parser.add_argument("--sleep", type=float, default=0.2, help="Pausa entre chamadas")
    parser.add_argument("--no-prefilter", action="store_true", help="Envia todos os blocos para a LLM, mesmo sem palavras-chave")
    args = parser.parse_args()

    load_dotenv()

    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("Defina OPENAI_API_KEY no ambiente.")

    client = OpenAI()
    min_date = parse_date_or_fail(args.min_date)

    for input_path in args.input:
        process_input_file(client, input_path, args, min_date)


if __name__ == "__main__":
    main()
    