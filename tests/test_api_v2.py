from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
FIXTURES = Path(__file__).parent / "fixtures"
PW = "correct horse battery"


def _encrypt(**form):
    return client.post("/api/encrypt", data={"message": "hello dna", **form})


def _decrypt(stego_path, key=""):
    with open(stego_path, "rb") as f:
        return client.post(
            "/api/decrypt",
            files={"stego_file": ("in_stego.fasta", f)},
            data={"key": key},
        )


@pytest.mark.parametrize("algo", ["aes-256-gcm", "chacha20-poly1305"])
def test_encrypt_decrypt_roundtrip(algo):
    r = _encrypt(algorithm=algo, password=PW)
    assert r.status_code == 200
    body = r.json()
    assert body["algorithm"] == algo and body["format"] == 2 and body["encrypted"] is True
    assert "key" not in body
    d = _decrypt(body["stego_file"], PW)
    assert d.status_code == 200
    assert d.json() == {"message": "hello dna", "format": 2}


def test_default_algorithm_is_aes_gcm():
    r = _encrypt(password=PW)
    assert r.status_code == 200 and r.json()["algorithm"] == "aes-256-gcm"


def test_none_algorithm_needs_no_password():
    r = _encrypt(algorithm="none")
    assert r.status_code == 200 and r.json()["encrypted"] is False
    assert _decrypt(r.json()["stego_file"]).json()["message"] == "hello dna"


def test_legacy_use_encryption_false_maps_to_none():
    r = _encrypt(use_encryption="false")
    assert r.status_code == 200 and r.json()["algorithm"] == "none"


def test_unknown_algorithm_is_400():
    r = _encrypt(algorithm="rot13", password=PW)
    assert r.status_code == 400 and "Unknown algorithm" in r.json()["detail"]


def test_missing_password_is_400():
    r = _encrypt(algorithm="aes-256-gcm")
    assert r.status_code == 400 and "assword" in r.json()["detail"]


def test_wrong_password_is_400():
    path = _encrypt(algorithm="aes-256-gcm", password=PW).json()["stego_file"]
    r = _decrypt(path, "wrong-password-here")
    assert r.status_code == 400
    assert r.json()["detail"] == "Wrong password or corrupted file"


def test_legacy_file_decodes_via_api():
    import json

    m = json.loads((FIXTURES / "legacy.json").read_text())["legacy_encrypted"]
    r = _decrypt(FIXTURES / m["file"], m["key"])
    assert r.status_code == 200
    assert r.json() == {"message": m["message"], "format": 1}
