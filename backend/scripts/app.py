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
    parser.add_argument(
        "--log-level",
        default="info",
        help="Uvicorn log level (e.g. debug, info, warning).",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[2]
    env = os.environ.copy()
    pythonpath = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = (
        f"{repo_root}{os.pathsep}{pythonpath}" if pythonpath else str(repo_root)
    )
    env["OSOYAH_ENV"] = args.env
    env["PYTHONUNBUFFERED"] = "1"
    log_path = repo_root / "backend" / "server" / "logs" / "server.log"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"\nOsoyah: Starting API with OSOYAH_ENV={args.env}")
    print(f"Osoyah: Log Level={args.log_level}")
    print(f"Osoyah: Log File={log_path}\n")

    command = [
        "python",
        "-m",
        "uvicorn",
        "backend.server.app.main:app",
        "--reload",
        "--use-colors",
        "--access-log",
        "--log-level",
        args.log_level,
        "--port",
        "9876",
    ]
    process = subprocess.Popen(
        command,
        cwd=repo_root,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    if process.stdout is None:
        return process.wait()
    with log_path.open("w", encoding="utf-8") as log_file:
        for line in process.stdout:
            log_file.write(line)
            log_file.flush()
            sys.stdout.write(line)
            sys.stdout.flush()
    return process.wait()


if __name__ == "__main__":
    raise SystemExit(main())
