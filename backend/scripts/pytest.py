#!/usr/bin/env python3
from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path


def main() -> int:
    repo_root = Path(__file__).resolve().parents[2]
    log_dir = repo_root / "backend" / "server" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / "pytest.log"

    env = os.environ.copy()
    env.setdefault("PYTHONUNBUFFERED", "1")
    env.setdefault("PYTEST_FORCE_COLOR", "1")
    command = [
        "pytest",
        "-rA",
        "-W",
        "default",
        "--color=yes",
        "backend/server/tests",
    ]

    def strip_ansi(value: str) -> str:
        return re.sub(r"\x1b\[[0-9;]*m", "", value)

    with log_path.open("w", encoding="utf-8") as log_file:
        process = subprocess.Popen(
            command,
            cwd=repo_root,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            env=env,
            text=True,
            bufsize=1,
        )
        assert process.stdout is not None
        for line in process.stdout:
            sys.stdout.write(line)
            log_file.write(strip_ansi(line))
        return process.wait()


if __name__ == "__main__":
    raise SystemExit(main())
