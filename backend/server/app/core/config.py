from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from os import getenv
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    repo_root: Path
    backend_root: Path
    assets_dir: Path
    db_path: Path
    data_json_path: Path
    relationship_max_depth: int
    environment: str

    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.db_path}"


@lru_cache
def get_settings() -> Settings:
    repo_root = Path(__file__).resolve().parents[4]
    backend_root = repo_root / "backend" / "server"
    assets_dir = backend_root / "assets"
    raw_env = getenv("OSOYAH_ENV", "dev").lower()
    env = {"development": "dev", "production": "prod", "testing": "test"}.get(
        raw_env, raw_env
    )
    if env not in {"dev", "prod", "test"}:
        env = "dev"
    db_path = assets_dir / f"osoyah-{env}.db"
    data_json_path = assets_dir / "seed-2026-01-13.json"
    max_depth_raw = getenv("OSOYAH_RELATIONSHIP_MAX_DEPTH", "7")
    try:
        relationship_max_depth = max(1, int(max_depth_raw))
    except ValueError:
        relationship_max_depth = 7
    return Settings(
        repo_root=repo_root,
        backend_root=backend_root,
        assets_dir=assets_dir,
        db_path=db_path,
        data_json_path=data_json_path,
        relationship_max_depth=relationship_max_depth,
        environment=env,
    )
