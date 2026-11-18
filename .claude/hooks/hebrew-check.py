#!/usr/bin/env python3
"""Stop hook: blocks a final message to Anat that is mostly Latin letters.

Rule: every message to Anat is in Hebrew (rules/language.md). Code blocks, inline code,
URLs and file paths are ignored. Fails open: any error lets the turn end.
"""
import json
import re
import sys

LIMIT = 0.30      # share of Latin letters among Hebrew + Latin letters
MIN_LETTERS = 40  # shorter messages are not checked


def last_assistant_text(data):
    text = data.get("last_assistant_message")
    if isinstance(text, str) and text.strip():
        return text
    path = data.get("transcript_path")
    if not path:
        return ""
    last = ""
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                ev = json.loads(line)
            except ValueError:
                continue
            msg = ev.get("message") if isinstance(ev, dict) else None
            if not isinstance(msg, dict) or msg.get("role") != "assistant":
                continue
            content = msg.get("content")
            if isinstance(content, str):
                parts = [content]
            else:
                parts = [b.get("text", "") for b in content or [] if isinstance(b, dict) and b.get("type") == "text"]
            joined = "\n".join(p for p in parts if p)
            if joined.strip():
                last = joined
    return last


def latin_share(text):
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"`[^`]*`", " ", text)
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"[\w./-]+\.(?:md|json|js|jsx|ts|tsx|css|py|cjs|mjs|sh|html|yml|yaml)\b", " ", text)
    he = len(re.findall(r"[֐-׿]", text))
    la = len(re.findall(r"[A-Za-z]", text))
    return la, he


def main():
    try:
        data = json.load(sys.stdin)
        if data.get("stop_hook_active"):
            return 0
        la, he = latin_share(last_assistant_text(data))
        if la + he < MIN_LETTERS:
            return 0
        if la / (la + he) > LIMIT:
            print(json.dumps({
                "decision": "block",
                "reason": "ההודעה האחרונה לענת ברובה באנגלית. כתוב אותה מחדש בעברית (קוד, כתובות ושמות קבצים יכולים להישאר באנגלית).",
            }, ensure_ascii=False))
    except Exception:
        return 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
