import shutil
from pathlib import Path

import pytest

from app.pipeline.stego_pipeline import decode_message, encode_message

FIXTURES = Path(__file__).parent / "fixtures"
PW = "correct horse battery"


@pytest.fixture
def cover(tmp_path):
    p = tmp_path / "cover.fasta"
    shutil.copy(FIXTURES / "cover.fasta", p)
    return str(p)


@pytest.mark.parametrize("algo", ["aes-256-gcm", "chacha20-poly1305"])
@pytest.mark.parametrize("msg", ["hello", "", "héllo 🧬", "abc", "y" * 5000])
def test_roundtrip_encrypted(cover, algo, msg):
    out, key = encode_message(msg, cover, algorithm=algo, password=PW)
    assert key is None
    assert decode_message(out, PW.encode()) == msg


@pytest.mark.parametrize("msg", ["hello", "", "héllo 🧬", "abc"])
def test_roundtrip_none_needs_no_password(cover, msg):
    out, _ = encode_message(msg, cover, algorithm="none")
    assert decode_message(out, b"") == msg


def test_wrong_password_raises(cover):
    out, _ = encode_message("secret", cover, algorithm="aes-256-gcm", password=PW)
    with pytest.raises(ValueError, match="Wrong password or corrupted file"):
        decode_message(out, b"not-the-password")


def test_missing_password_raises(cover):
    out, _ = encode_message("secret", cover, algorithm="aes-256-gcm", password=PW)
    with pytest.raises(ValueError, match="Password required"):
        decode_message(out, b"")


def test_header_fmt_stripped_still_decodes_via_magic(cover):
    out, _ = encode_message("secret", cover, algorithm="none")
    text = Path(out).read_text().replace(" | fmt=2 | alg=none", "")
    Path(out).write_text(text)
    assert decode_message(out, b"") == "secret"


def test_unknown_algorithm_raises(cover):
    with pytest.raises(ValueError, match="Unknown algorithm"):
        encode_message("x", cover, algorithm="rot13", password=PW)


def test_legacy_encode_args_still_work(cover):
    out, key = encode_message("hi", cover, use_encryption=True)
    assert key and decode_message(out, key) == "hi"
