#!/usr/bin/env python3
"""
SipSaviya · web-content build step
=================================
Runs during CI (and locally) before the APK is assembled.

  1. Validates every knowledge card, question and solver path that ships
     inside the APK (delegates to tools/verify_content.js, which loads the
     real app files into a sandbox and smoke-tests the AI end to end).
  2. Writes assets/www/data/manifest.json with the content statistics that
     the in-app "About" screen shows.

Exit code is non-zero when the content or the AI is broken, so a bad commit
can never produce a downloadable APK.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WWW = ROOT / "android" / "app" / "src" / "main" / "assets" / "www"
VERIFY = ROOT / "tools" / "verify_content.js"

C = {"B": "\033[1m", "G": "\033[92m", "R": "\033[91m", "Y": "\033[93m", "0": "\033[0m"}


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True)


def main() -> int:
    if not WWW.exists():
        print(f"{C['R']}✖ web assets not found at {WWW}{C['0']}")
        return 2

    print(f"{C['B']}▶ Validating SipSaviya content + AI…{C['0']}")
    node = run(["node", str(VERIFY), "--dump"] if "--dump" in sys.argv else ["node", str(VERIFY)])
    sys.stdout.write(node.stdout)
    if node.returncode != 0:
        sys.stderr.write(node.stderr)
        print(f"{C['R']}✖ content verification failed — APK not built{C['0']}")
        return node.returncode

    # Collect the numbers for manifest.json straight from the app data files.
    counts = run(["node", str(VERIFY), "--stats-json"])
    if counts.returncode != 0:
        print(counts.stderr)
        return counts.returncode

    stats = json.loads(counts.stdout.strip().splitlines()[-1])
    manifest = {
        "app": "SipSaviya",
        "contentVersion": "1.0.0",
        "offline": True,
        "content": stats,
        "ai": {
            "retrieval": "TF-IDF + truncated SVD (LSA) blended with BM25 lexical scoring",
            "solver": "exact fraction arithmetic, linear/quadratic/simultaneous equations, "
                      "geometry, statistics, unit conversion, physics & chemistry formulas",
            "runsOnDevice": True,
            "networkCalls": 0
        },
        "officialSources": {
            "textbooks": "http://www.edupub.gov.lk/",
            "pastPapers": "https://www.doenets.lk/pastpapers",
            "lessons": "https://e-thaksalawa.moe.gov.lk/",
        },
    }
    (WWW / "data" / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"{C['G']}✔ content ok — {stats['cards']} knowledge cards, {stats['questions']} MCQs, "
          f"{stats['flashcards']} flashcards, {stats['subjects']} subjects{C['0']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
