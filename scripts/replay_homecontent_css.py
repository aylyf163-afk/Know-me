"""Replay HomeContent.css patches from Cursor transcript (dev utility)."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

TRANSCRIPT = Path(
    "/Users/liyunfei/.cursor/projects/Users-liyunfei-Documents-reactbits-demo/"
    "agent-transcripts/12bb5d3d-766e-4dc7-9ed6-ef0086992c08/"
    "12bb5d3d-766e-4dc7-9ed6-ef0086992c08.jsonl"
)
OUT = Path(__file__).resolve().parents[1] / "src/components/layout/HomeContent.css"


def collect_css_patches() -> list[str]:
    patches: list[str] = []
    with TRANSCRIPT.open(encoding="utf-8") as f:
        for line in f:
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if obj.get("role") != "assistant":
                continue
            for part in obj.get("message", {}).get("content", []):
                if part.get("type") != "tool_use" or part.get("name") != "ApplyPatch":
                    continue
                inp = part.get("input")
                text = inp if isinstance(inp, str) else (inp or {}).get("input", "")
                if not text:
                    continue
                inner = text.split("*** Begin Patch", 1)[-1].split("*** End Patch")[0]
                first_lines = "\n".join(inner.strip().split("\n")[:2])
                if "HomeContent.css" in first_lines and (
                    "Add File:" in first_lines or "Update File:" in first_lines
                ):
                    patches.append(text)
    return patches


def parse_blocks(text: str) -> list[tuple[str, str]]:
    blocks: list[tuple[str, str]] = []
    for raw in text.split("*** Begin Patch")[1:]:
        raw = raw.split("*** End Patch")[0]
        lines = raw.strip("\n").split("\n")
        if not lines:
            continue
        blocks.append((lines[0].strip(), "\n".join(lines[1:])))
    return blocks


def apply_add(body: str) -> str:
    out: list[str] = []
    for ln in body.split("\n"):
        if ln.startswith("+") and not ln.startswith("+++"):
            out.append(ln[1:])
    return "\n".join(out)


def split_hunks(body: str) -> list[str]:
    lines = body.split("\n")
    hunks: list[str] = []
    cur: list[str] = []
    for ln in lines:
        if ln.strip() == "@@":
            if cur:
                hunks.append("\n".join(cur))
                cur = []
        else:
            cur.append(ln)
    if cur:
        hunks.append("\n".join(cur))
    return hunks


def parse_hunk_lines(hunk_body: str) -> tuple[list[str], list[str]]:
    hl = hunk_body.split("\n")
    old_lines: list[str] = []
    merge_ops: list[tuple[str, str]] = []
    for x in hl:
        if x == "":
            old_lines.append("")
            merge_ops.append((" ", ""))
            continue
        t, rest = x[0], x[1:]
        if t == " ":
            old_lines.append(rest)
            merge_ops.append((" ", rest))
        elif t == "-":
            old_lines.append(rest)
            merge_ops.append(("-", rest))
        elif t == "+":
            merge_ops.append(("+", rest))
        else:
            old_lines.append(x)
            merge_ops.append((" ", x))
    merged: list[str] = []
    for op, rest in merge_ops:
        if op == " ":
            merged.append(rest)
        elif op == "-":
            continue
        elif op == "+":
            merged.append(rest)
    return old_lines, merged


def apply_hunk(content: str, hunk_body: str) -> str:
    old_lines, merged = parse_hunk_lines(hunk_body)
    if not old_lines:
        return content
    lines = content.split("\n")
    m = len(old_lines)
    found = -1
    for i in range(len(lines) - m + 1):
        if lines[i : i + m] == old_lines:
            found = i
            break
    if found == -1:
        ro = [s.rstrip() for s in old_lines]
        rl = [s.rstrip() for s in lines]
        for i in range(len(rl) - m + 1):
            if rl[i : i + m] == ro:
                found = i
                break
    if found == -1:
        raise RuntimeError("MISS:\n" + "\n".join(old_lines[:30]))
    lines = lines[:found] + merged + lines[found + m :]
    return "\n".join(lines)


def apply_update(content: str, body: str) -> str:
    for h in split_hunks(body):
        if h.strip() == "":
            continue
        content = apply_hunk(content, h)
    return content


def strip_main_hero_grid(css: str) -> str:
    """Transcript patch 10 assumes .hero no longer has display:grid; our replay still has it from patch 3–5."""
    return re.sub(
        r"(\.hero \{[^}]*?)(\n  display: grid;\n  place-items: center;)",
        r"\1",
        css,
        count=1,
        flags=re.DOTALL,
    )


def mend_patch_10_body(body: str) -> str:
    """Patch 10 was authored after a different .bottom-hint snapshot; align − lines with post–patch-9 replay."""
    return body.replace("-  bottom: 40px;\n", "-  bottom: 16px;\n").replace(
        "-  font-size: 18px;\n", "-  font-size: 13px;\n"
    )


def mend_hero_copy_margin_top(body: str) -> str:
    """Several hunks assume margin-top:30vh on .hero-copy; replay uses transform from patch 7."""
    return body.replace(
        "\n   margin-top: 30vh;\n",
        "\n   transform: translateY(-56px);\n",
    )


def mend_patch_30_body(body: str) -> str:
    """Patch 30 − line expects ::after background 0.9; replay has 0.96 from earlier tweaks."""
    return body.replace(
        "-  background: rgba(255, 255, 255, 0.9);\n",
        "-  background: rgba(255, 255, 255, 0.96);\n",
    )


def mend_patch_37_body(body: str) -> str:
    """Patch 37 context uses --card-ty: -12px; replay has -10px from patch 33."""
    return body.replace("\n   --card-ty: -12px;\n", "\n   --card-ty: -10px;\n")


def remove_project_glow_spin_keyframes(css: str) -> str:
    """Transcript places this block next to skills-grid-drift; replay may place it earlier."""
    marker = "@keyframes project-glow-spin"
    i = css.find(marker)
    if i == -1:
        return css
    brace = css.find("{", i)
    if brace == -1:
        return css
    depth = 0
    k = brace
    while k < len(css):
        ch = css[k]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                k += 1
                break
        k += 1
    end = k
    while end < len(css) and css[end] in "\r\n":
        end += 1
    if css[end : end + 1] == "\n":
        end += 1
    return css[:i] + css[end:]


def main() -> None:
    if not TRANSCRIPT.is_file():
        print("Transcript not found:", TRANSCRIPT, file=sys.stderr)
        sys.exit(1)
    max_n = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    css = ""
    patches = collect_css_patches()
    print("patches", len(patches), file=sys.stderr)
    for i, p in enumerate(patches, 1):
        # Patch 6 in transcript expects .hero-copy without margin-inline, but patch 2
        # already added margin-inline; patch 7 supersedes the same edits with correct context.
        if i == 6:
            print("skip", i, "(superseded by patch 7)", file=sys.stderr)
            continue
        if i == 34:
            print("skip", i, "(duplicate of patch 33 project-card refactor)", file=sys.stderr)
            continue
        if i == 10:
            css = strip_main_hero_grid(css)
        for hdr, body in parse_blocks(p):
            if hdr.startswith("*** Add File:") and "HomeContent.css" in hdr:
                css = apply_add(body)
            elif hdr.startswith("*** Update File:") and "HomeContent.css" in hdr:
                if i == 10:
                    body = mend_patch_10_body(body)
                if i in (11, 18):
                    body = mend_hero_copy_margin_top(body)
                if i == 30:
                    body = mend_patch_30_body(body)
                if i == 37:
                    body = mend_patch_37_body(body)
                if i == 33:
                    hunks = split_hunks(body)
                    for h in hunks[:-1]:
                        if h.strip():
                            css = apply_hunk(css, h)
                    css = remove_project_glow_spin_keyframes(css)
                    continue
                css = apply_update(css, body)
        print("ok", i, "lines", css.count("\n") + 1, file=sys.stderr)
        if max_n and i >= max_n:
            print(css, end="")
            return
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(css + ("" if css.endswith("\n") else "\n"), encoding="utf-8")
    print("wrote", OUT, "bytes", len(css.encode()))


if __name__ == "__main__":
    main()
