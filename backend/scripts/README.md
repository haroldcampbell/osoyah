# Backend Scripts

Short descriptions of helper scripts under `backend/scripts/`.

## `install_deps.py`

Installs backend dependencies from `backend/server/pyproject.toml` in editable
mode so tooling and tests can run locally.

Usage:
```bash
python backend/scripts/install_deps.py
```

## `lint.py`

Runs backend linting and type checks with `ruff` and `mypy`. Output is streamed
to the console with color, and a plain-text log is written to
`backend/server/logs/lint.log`.

Usage:
```bash
python backend/scripts/lint.py
```

## `pytest.py`

Runs backend tests with warning details enabled. Output is streamed to the
console with color, and a plain-text log is written to
`backend/server/logs/pytest.log`.

Usage:
```bash
python backend/scripts/pytest.py
```
