#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from urllib.request import urlopen


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Export FastAPI OpenAPI schema to docs/api/openapi.json."
    )
    parser.add_argument(
        "--url",
        default="http://127.0.0.1:9876/openapi.json",
        help="OpenAPI JSON endpoint to fetch.",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[2]
    target_path = repo_root / "docs" / "api" / "openapi.json"
    target_path.parent.mkdir(parents=True, exist_ok=True)

    with urlopen(args.url) as response:
        payload = json.loads(response.read().decode("utf-8"))

    target_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", "utf-8")
    print(f"Wrote OpenAPI schema to {target_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
