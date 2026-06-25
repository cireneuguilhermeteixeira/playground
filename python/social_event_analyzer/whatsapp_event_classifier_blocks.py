#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
whatsapp_event_classifier_blocks.py

Reads a WhatsApp-exported `.txt`, groups messages into 2 to 6 hour blocks,
uses an LLM to classify invites/events, and generates a reviewable CSV.

Usage:
  pip install openai python-dotenv
  export OPENAI_API_KEY="your-key"

  python whatsapp_event_classifier_blocks.py conversation.txt --out events.csv
  python whatsapp_event_classifier_blocks.py conversation.txt --out events.csv --block-hours 2
  python whatsapp_event_classifier_blocks.py conversation.txt --out events.csv --block-hours 6

Rules:
- Any invite in the group is treated as a general invite.
- The script does not try to decide whether a specific person attended.
- The LLM only classifies invites/events within time blocks.
- The script handles counting/deduplication and generates a CSV for manual review.
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
        "Missing dependency: install the 'openai' package before running the script.\n"
        "Command: pip install openai python-dotenv"
    )

try:
    from dotenv import load_dotenv
except ImportError:
    raise SystemExit(
        "Missing dependency: install the 'python-dotenv' package before running the script.\n"
        "Command: pip install openai python-dotenv"
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
You are a WhatsApp message classifier.

Task:
Analyze a conversation time block and extract ALL invites, proposals, or plans
for a social event, outing, meetup, barbecue, bar, birthday, movie, beach, lunch,
dinner, party, hangout, or group activity.

Rules:
1. Treat it as an invite even if no specific names are mentioned.
2. If someone mentions only one person, still classify the message as an invite.
3. Do not infer individual invitees.
4. Do not decide whether a person attended. That will be handled in manual review.
5. If there is more than one invite in the block, return all of them in the "invites" list.
6. If there is no real invite, return "invites": [].
7. Return only valid JSON using the requested schema.
8. If there is reasonable doubt, include the invite with lower confidence.
9. Use evidence_message_ids with the IDs of the most important messages.
10. Do not invent messages or IDs.

Fields for each invite:
- invite_type: string. Example: "bar", "barbecue", "movie", "birthday", "beach", "dinner", "lunch", "generic", "other"
- event_date_text: string or null. Event date/time mentioned in the text, if any. Example: "Saturday", "today", "tomorrow", "the 12th", null.
- summary: short string explaining the invite.
- evidence_message_ids: list of the most relevant message IDs.
- confidence: number from 0 to 1.
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
    Tolerant parser for WhatsApp exports in Portuguese.
    Accepts common formats:
      21/06/2026 10:32 - João: message
      21/06/2026, 10:32 - João: message
      [21/01/26, 19:39:18] João: message
      [21/06/2026, 10:32:10] João: message

    Multiline messages are appended to the previous message.
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
    raise ValueError(f"Invalid date: {date_s}. Use DD/MM/YY or DD/MM/YYYY.")


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
    Groups messages into fixed blocks during the day:
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
    Cheap pre-filter:
    only sends blocks to the LLM if they contain at least one invite keyword.
    """
    return [
        block for block in blocks
        if any(looks_like_invite(msg.text) for msg in block.messages)
    ]


def format_block(block: Block) -> str:
    lines = [
        f"BLOCK {block.id}: {block.start.strftime('%d/%m/%Y %H:%M')} to {block.end.strftime('%d/%m/%Y %H:%M')}"
    ]

    for m in block.messages:
        lines.append(f"[id={m.id}] [{m.date_raw}] {m.author}: {m.text}")

    return "\n".join(lines)


def build_llm_context(block: Block, radius: int = LLM_CONTEXT_RADIUS) -> str:
    """
    Reduces tokens sent to the LLM:
    keeps invite-like messages and a small amount of surrounding context.
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
            f"BLOCK {block.id}: {block.start.strftime('%d/%m/%Y %H:%M')} "
            f"to {block.end.strftime('%d/%m/%Y %H:%M')} "
            f"(excerpt with {len(selected_indexes)}/{len(block.messages)} messages)"
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

    raise ValueError("The API response did not contain usable JSON.")


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
                        "Classify ALL invites present in the block below.\n\n"
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
        print(f"API error in block {block.id}:", flush=True)
        print(summarize_exception_debug(exc), flush=True)
        raise

    try:
        return parse_response_json(response)
    except Exception as exc:
        write_debug_artifacts(block, context, response)
        print(f"Failed to parse response for block {block.id}: {exc}", flush=True)
        print("Excerpt from raw API response:", flush=True)
        print(summarize_response_debug(response), flush=True)
        print(
            f"Debug files saved to {DEBUG_DIRNAME}/block_{block.id:04d}.context.txt "
            f"and {DEBUG_DIRNAME}/block_{block.id:04d}.response.txt",
            flush=True,
        )
        raise


def make_context_excerpt(block: Block, evidence_ids: List[int], radius: int = 6) -> str:
    """
    Instead of saving the full block in the CSV, saves an excerpt around the evidence.
    This keeps the CSV lighter.
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
        f"BLOCK EXCERPT {block.id}: {block.start.strftime('%d/%m/%Y %H:%M')} to {block.end.strftime('%d/%m/%Y %H:%M')}"
    ]

    for m in excerpt:
        lines.append(f"[id={m.id}] [{m.date_raw}] {m.author}: {m.text}")

    return "\n".join(lines)


def build_rows_from_invites(block: Block, result: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows = []

    for invite in result.get("invites", []):
        evidence_ids = invite.get("evidence_message_ids") or []
        evidence_messages = [m for m in block.messages if m.id in set(evidence_ids)]

        # Fallback: if the LLM does not point to valid IDs, use candidate messages from the block.
        if not evidence_messages:
            evidence_messages = [m for m in block.messages if looks_like_invite(m.text)]

        evidence_text = "\n".join(
            f"[id={m.id}] [{m.date_raw}] {m.author}: {m.text}"
            for m in evidence_messages
        )

        rows.append({
            "block_id": block.id,
            "block_start": block.start.strftime("%d/%m/%Y %H:%M"),
            "block_end": block.end.strftime("%d/%m/%Y %H:%M"),
            "evidence_message_ids": ",".join(str(m.id) for m in evidence_messages),
            "first_evidence_date": evidence_messages[0].date_raw if evidence_messages else "",
            "evidence_authors": ", ".join(sorted(set(m.author for m in evidence_messages))),
            "invite_type": invite.get("invite_type"),
            "mentioned_event_date": invite.get("event_date_text"),
            "confidence": invite.get("confidence"),
            "llm_summary": invite.get("summary"),
            "evidence_messages": evidence_text,
            "context_excerpt": make_context_excerpt(block, evidence_ids),
            "manual_review_is_invite": "",
            "manual_review_person_attended": "",
            "manual_review_notes": ""
        })

    return rows


def build_output_path(input_path: str, out_arg: Optional[str], multiple_inputs: bool) -> Path:
    input_file = Path(input_path)

    if not out_arg:
        return input_file.with_name(f"{input_file.stem}_events.csv")

    out_path = Path(out_arg)
    if multiple_inputs:
        out_path.mkdir(parents=True, exist_ok=True)
        return out_path / f"{input_file.stem}_events.csv"

    return out_path


def process_input_file(client: OpenAI, input_path: str, args: argparse.Namespace, min_date: datetime) -> None:
    output_path = build_output_path(input_path, args.out, len(args.input) > 1)
    original_messages = parse_whatsapp_txt(input_path)
    messages = filter_messages_since(original_messages, min_date)
    blocks = group_messages_by_time_block(messages, args.block_hours)

    candidate_blocks = blocks if args.no_prefilter else filter_candidate_blocks(blocks)

    print(f"\nFile: {input_path}")
    print(f"Messages read: {len(original_messages)}")
    print(f"Messages considered since {min_date.strftime('%d/%m/%Y')}: {len(messages)}")
    print(f"Total {args.block_hours}h blocks: {len(blocks)}")
    print(f"Blocks sent to the LLM: {len(candidate_blocks)}")

    rows = []

    for idx, block in enumerate(candidate_blocks, start=1):
        print(
            f"Classifying block {idx}/{len(candidate_blocks)} "
            f"({block.start.strftime('%d/%m/%Y %H:%M')} - {block.end.strftime('%H:%M')})..."
        )

        try:
            result = classify_block(client, args.model, block)
        except Exception as e:
            print(f"Error in block {block.id}: {e}")
            continue

        rows.extend(build_rows_from_invites(block, result))
        time.sleep(args.sleep)

    dedup = {}
    for row in rows:
        key = (
            row["evidence_message_ids"],
            row["invite_type"],
            row["mentioned_event_date"],
            row["llm_summary"]
        )
        dedup[key] = row

    rows = list(dedup.values())
    rows.sort(key=lambda r: (r["block_start"], r["evidence_message_ids"]))

    fieldnames = [
        "block_id",
        "block_start",
        "block_end",
        "evidence_message_ids",
        "first_evidence_date",
        "evidence_authors",
        "invite_type",
        "mentioned_event_date",
        "confidence",
        "llm_summary",
        "evidence_messages",
        "context_excerpt",
        "manual_review_is_invite",
        "manual_review_person_attended",
        "manual_review_notes"
    ]

    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Invites found for review: {len(rows)}")
    print(f"Generated file: {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="+", help="One or more WhatsApp-exported .txt files")
    parser.add_argument("--out", help="Output CSV for a single file, or output directory when processing multiple files")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Model used for classification")
    parser.add_argument("--min-date", default=DEFAULT_MIN_DATE, help="Ignore messages before this date. Default: 25/06/2024")
    parser.add_argument("--block-hours", type=int, default=4, choices=[2, 3, 4, 5, 6], help="Time block size in hours. Default: 4")
    parser.add_argument("--sleep", type=float, default=0.2, help="Pause between API calls")
    parser.add_argument("--no-prefilter", action="store_true", help="Send all blocks to the LLM, even without keywords")
    args = parser.parse_args()

    load_dotenv()

    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("Set OPENAI_API_KEY in the environment.")

    client = OpenAI()
    min_date = parse_date_or_fail(args.min_date)

    for input_path in args.input:
        process_input_file(client, input_path, args, min_date)


if __name__ == "__main__":
    main()
    
