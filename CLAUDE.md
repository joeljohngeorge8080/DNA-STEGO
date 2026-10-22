# CLAUDE.md — DnaStego

Project-specific rules; they add to the global Intelligence Kit orders in `~/.claude/CLAUDE.md`.

## What this is

DNA steganography web app. A secret message is hidden inside a FASTA file as an extra record of A/C/G/T bases, encrypted with a user password (format v2) or left unencrypted. Files from the older Fernet/rearrange format (v1, "legacy") still decode.

- **Backend**: FastAPI (Python), package `app/`. Entry: `app/main.py`.
- **Frontend**: React 19 + Vite 7 + Tailwind 3 + framer-motion, in `frontend/` (JavaScript/JSX, no TypeScript).
- **Auth**: Google OAuth (authlib) -> backend issues a 24h HS256 JWT -> redirects to `{FRONTEND_URL}/auth/callback?token=...`. Guest mode skips auth.
- **Deploy targets in repo**: Docker Compose, Render (`render.yaml`, backend), Vercel (`vercel.json`, frontend + `api/index.py`), AWS EC2 scripts, nginx config.

## Commands

```bash
# Backend (from repo root; a venv/ exists but is gitignored)
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000     # = `make backend`; docs at /docs
python -m app.pipeline.stego_pipeline                         # round-trip smoke test ("JOEL", enc on/off)

# Frontend
cd frontend && npm install
npm run dev        # Vite on :5173, proxies /api -> localhost:8000
npm run build
npm run lint       # eslint

# Docker
make up / make down / make logs      # docker-compose: backend :8000, frontend :5173
```

Env: copy `.env.example` -> `.env` (needs `GOOGLE_CLIENT_ID/SECRET`, `JWT_SECRET`, `SECRET_KEY`, `FRONTEND_URL`, `ENVIRONMENT`, prod `ALLOWED_ORIGINS`). Frontend reads `VITE_API_BASE` (default `http://localhost:8000`).

Tests: `python -m pytest tests -q` (pytest is a dev-only install, not in `requirements.txt`). `make test` and CI still point at the nonexistent `app/tests/` and need repointing to `tests/` (CI config edit — ask first). The frontend has no `test` script.

## Architecture

### Formats
**v2 (current)** — `encode_message(text, cover, algorithm=..., password=...)`:
1. `crypto/cipher_v2.py` — `encrypt_v2` builds a frame. Algorithms: `none`, `aes-256-gcm`, `chacha20-poly1305` (registry dict `ALGORITHMS`). Key = scrypt(password, 16-byte salt). Encrypted frame: `"DSG2" | version | alg | salt | nonce | ciphertext+tag`, header authenticated as AEAD associated data. `none` frame: `magic | version | alg | u32 length | text | sha256[:8]`. All failures raise `ValueError("Wrong password or corrupted file")`. No rearrange step.
2. `dna/dna_encoder.py` — bytes -> bits -> bases, mapping `00=G 01=C 10=A 11=T`
3. `fasta/fasta_generator.py` — appends record `>stego_seq_<id> DNA-Stego payload | length=… | date=… | mode=encrypted|plain | fmt=2 | alg=<name>`, sequence wrapped at 60 cols; writes `<cover>_stego.fasta`

**v1 (legacy, decode-only in practice)** — `encode_message(..., use_encryption=...)` without `algorithm`: block-reversal (`preprocessing/rearrange.py`) -> UTF-8 -> Fernet (random key returned) or none. Header has no `fmt`/`alg`.

`decode_message(stego_fasta, key)` reads the header (`decoder/dna_decoder.parse_stego_header`); it takes the v2 path if `fmt=2` **or** the payload starts with the `DSG2` magic (legacy payloads never do), otherwise the legacy path. `key` is the password (v2) or the Fernet key (v1). The decoder mapping must stay the exact inverse of the encoder's. Legacy fixtures live in `tests/fixtures/` — keep them decoding.

Default cover file: `storage/fasta_files/default.fasta` (`DEFAULT_FASTA_PATH`). Generated files and uploads also land in `storage/fasta_files/`.

### API (all in `app/main.py`)
`GET /`, `GET /health`, `GET /auth/google/login`, `GET /auth/google/callback`, `GET /auth/me` (Bearer JWT), `POST /api/encrypt` (form: `message`, `algorithm` default `aes-256-gcm`, `password`, optional `fasta_file`; legacy `use_encryption=false` maps to `none`; 400 on unknown algorithm / missing password; no key is returned), `GET /api/download?path=`, `POST /api/decrypt` (form: `stego_file`, `key` = password or legacy key; returns `{message, format}`).
`app/api/routes.py` is a stale duplicate router — **not mounted** anywhere. Edit `main.py`, not `routes.py`.
`api/index.py` just re-exports `app` for Vercel.

### Frontend (`frontend/src`)
- `App.jsx` — routes: `/`, `/login`, `/signup`, `/auth/callback`, protected `/dashboard` (+ `/dashboard/dna-stego`). New tools go under the `DashboardLayout` route (comment marks the spot).
- `context/AuthContext.jsx` — user/guest state, JWT in `localStorage['jwt_token']`. `savedKey`/`saveKey` are now unused (v2 returns no key).
- `services/api.js` — the only place that calls the backend.
- `pages/tools/DnaStego.jsx` — main feature UI (Encrypt/Decrypt tabs).
- `components/ui/*` — Button, Input, TextArea, FileUpload, ResultDisplay, CyberBadge; `components/Prism.jsx`, `FloatingLines.jsx` — WebGL backgrounds (ogl/three).
- Styling: Tailwind with a `cyber.*` palette (`tailwind.config.js`); alias `@` -> `src`. Existing code uses 4-space indent in most files, single quotes, no semicolons.

## Conventions

- Python: type-hinted functions with Google-style docstrings (Args/Returns), section banners like `# ===== NAME =====` in `main.py`. Logging via `logger`.
- Many modules carry an `if __name__ == "__main__":` demo block; keep that habit for small pure modules.
- Match surrounding style; formatter is `black` (Python) and eslint (frontend).

## Known issues (verified in code — don't "fix" unprompted, but know about them)

Security:
- Upload filenames are used unsanitized in `storage/fasta_files/{filename}` (`/api/encrypt`, `/api/decrypt`) -> path traversal / overwrite.
- `/api/download` only rejects `..` and a leading `/`; it serves any relative path (e.g. `.env`). Should be confined to `storage/fasta_files/`.
- `inject_into_fasta` derives output via `replace(".fasta", "_stego.fasta")`; a cover filename without `.fasta` would be overwritten in place.
- JWT secret and session secret fall back to hard-coded defaults; JWT is passed in a URL query string; CORS is `*` outside `ENVIRONMENT=production`.
- `.env.production` is tracked in git — check it holds no real secrets before touching.
- `/api/*` endpoints are unauthenticated; "guest mode" is client-side only.

Correctness / hygiene:
- Legacy (v1) payloads have no framing; the header's `length=` is informational there. v2 frames are length/tag-checked.
- `datetime.utcnow()` in `fasta_generator.py` emits a DeprecationWarning.
- Vercel's filesystem is read-only outside `/tmp`, so the backend's file writes won't work there; Render/Docker is the real backend host.
- `frontend/src/aws-config.js` is dead (leftover Cognito code, references undefined `hasCognitoConfig`; not imported). Some components use `cyber-purple` / `cyber-cyan`, which aren't in the Tailwind palette.
- Repo root has a tracked `node_modules/` (only `three`) and `package.json`; the real frontend deps live in `frontend/`.
- ~60 root-level deployment/status docs (`*_READY.md`, `*_COMPLETE.md`, `FIX_*`, …) are overlapping and likely stale; `README.md` is the nearest thing to canonical. Treat them as historical, verify against code. `temp/` is scratch.

## Rules for working here

- Changing the encode mapping/format breaks decoding of existing stego files — change encoder and decoder together, keep `tests/fixtures/` legacy files decoding, and add round-trip tests (every algorithm, plus empty, non-ASCII/emoji, and length not divisible by 4 messages).
- Never commit `.env`, generated `*_stego.fasta`, or keys (`storage/fasta_files/key.key` exists locally — leave it alone).
- New dependencies, auth changes, and deploy-config edits are hard stops per the global orders — ask first.
