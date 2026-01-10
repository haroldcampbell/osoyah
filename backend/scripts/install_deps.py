#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> int:
    repo_root = Path(__file__).resolve().parents[2]
    server_path = repo_root / "backend" / "server"
    command = [sys.executable, "-m", "pip", "install", "-e", str(server_path)]
    result = subprocess.run(command, check=False, cwd=repo_root)
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
