from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    repo_root: Path
    backend_root: Path
    assets_dir: Path
    db_path: Path
    data_json_path: Path

    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.db_path}"


@lru_cache
def get_settings() -> Settings:
    repo_root = Path(__file__).resolve().parents[4]
    backend_root = repo_root / "backend" / "server"
    assets_dir = backend_root / "assets"
    db_path = assets_dir / "osoyah.db"
    data_json_path = repo_root / "client" / "public" / "assets" / "data.json"
    return Settings(
        repo_root=repo_root,
        backend_root=backend_root,
        assets_dir=assets_dir,
        db_path=db_path,
        data_json_path=data_json_path,
    )
