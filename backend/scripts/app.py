#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the Osoyah API server.")
    parser.add_argument(
        "--env",
        choices=["dev", "prod", "test"],
        default="dev",
        help="Target environment for database selection.",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[2]
    env = os.environ.copy()
    pythonpath = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = (
        f"{repo_root}{os.pathsep}{pythonpath}" if pythonpath else str(repo_root)
    )
    env["OSOYAH_ENV"] = args.env
    command = [
        "python",
        "-m",
        "uvicorn",
        "backend.server.app.main:app",
        "--reload",
    ]
    return subprocess.call(command, cwd=repo_root, env=env)


if __name__ == "__main__":
    raise SystemExit(main())
