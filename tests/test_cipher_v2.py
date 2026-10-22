import pytest

from app.crypto.cipher_v2 import ALGORITHMS, decrypt_v2, encrypt_v2

MESSAGES = ["hello", "", "héllo wörld 🧬", "abc", "x" * 10_000]
PW = "correct horse battery"


@pytest.mark.parametrize("algo", ["aes-256-gcm", "chacha20-poly1305"])
@pytest.mark.parametrize("msg", MESSAGES)
def test_roundtrip_encrypted(algo, msg):
    frame = encrypt_v2(msg, algo, PW)
    assert decrypt_v2(frame, PW) == msg


@pytest.mark.parametrize("msg", MESSAGES)
def test_roundtrip_none(msg):
    frame = encrypt_v2(msg, "none", None)
    assert decrypt_v2(frame, None) == msg


def test_registry_names():
    assert set(ALGORITHMS) == {"none", "aes-256-gcm", "chacha20-poly1305"}


def test_wrong_password_rejected():
    frame = encrypt_v2("secret", "aes-256-gcm", PW)
    with pytest.raises(ValueError, match="Wrong password or corrupted file"):
        decrypt_v2(frame, "nope-nope-nope")


def test_unknown_algorithm_rejected():
    with pytest.raises(ValueError, match="Unknown algorithm"):
        encrypt_v2("x", "rot13", PW)


def test_password_required_for_encrypted():
    with pytest.raises(ValueError, match="Password required"):
        encrypt_v2("x", "aes-256-gcm", "")
    frame = encrypt_v2("x", "aes-256-gcm", PW)
    with pytest.raises(ValueError, match="Password required"):
        decrypt_v2(frame, "")


@pytest.mark.parametrize("index", [0, 4, 5, 6, 22, 40])  # magic, version, alg, salt, nonce, ct
def test_bit_flip_rejected(index):
    frame = bytearray(encrypt_v2("secret", "chacha20-poly1305", PW))
    frame[index] ^= 0x01
    with pytest.raises(ValueError):
        decrypt_v2(bytes(frame), PW)


def test_none_bit_flip_rejected():
    frame = bytearray(encrypt_v2("secret", "none", None))
    frame[-12] ^= 0x01
    with pytest.raises(ValueError):
        decrypt_v2(bytes(frame), None)


@pytest.mark.parametrize("algo", ["none", "aes-256-gcm"])
def test_truncated_frame_rejected(algo):
    frame = encrypt_v2("secret", algo, PW if algo != "none" else None)
    for cut in (0, 3, 10, len(frame) - 1):
        with pytest.raises(ValueError):
            decrypt_v2(frame[:cut], PW)


def test_salt_and_nonce_are_random():
    a = encrypt_v2("same", "aes-256-gcm", PW)
    b = encrypt_v2("same", "aes-256-gcm", PW)
    assert a != b
