#!/usr/bin/env python3
from __future__ import annotations

import shutil
import subprocess
import os
import re
import sys
from pathlib import Path


def _require_tool(name: str) -> bool:
    if shutil.which(name):
        return True
    print(f"Missing '{name}'. Install it to run linting.")
    return False


def _strip_ansi(value: str) -> str:
    return re.sub(r"\x1b\[[0-9;]*m", "", value)


def main() -> int:
    if not _require_tool("ruff") or not _require_tool("mypy"):
        return 1

    repo_root = Path(__file__).resolve().parents[2]
    log_dir = repo_root / "backend" / "server" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / "lint.log"

    target = "backend/server"
    commands = [
        ["ruff", "check", target],
        ["ruff", "format", "--check", target],
        ["mypy", "--config-file", "backend/server/pyproject.toml", target],
    ]

    exit_code = 0
    with log_path.open("w", encoding="utf-8") as log_file:
        for command in commands:
            env = None
            if command[0] == "ruff":
                env = {**os.environ, "FORCE_COLOR": "1"}
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
                log_file.write(_strip_ansi(line))
            result = process.wait()
            if result != 0 and exit_code == 0:
                exit_code = result
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
