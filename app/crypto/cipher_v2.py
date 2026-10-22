import hashlib
import os
import struct

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM, ChaCha20Poly1305
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt

MAGIC = b"DSG2"
VERSION = 2

SALT_LEN = 16
NONCE_LEN = 12
CHECK_LEN = 8  # truncated sha256 for the unencrypted ("none") mode

# scrypt parameters are fixed per format version and not stored in the frame
SCRYPT_N = 2**15
SCRYPT_R = 8
SCRYPT_P = 1

# name -> (id byte, AEAD class or None)
ALGORITHMS = {
    "none": (0, None),
    "aes-256-gcm": (1, AESGCM),
    "chacha20-poly1305": (2, ChaCha20Poly1305),
}
_BY_ID = {alg_id: (name, cls) for name, (alg_id, cls) in ALGORITHMS.items()}

_PREFIX_LEN = len(MAGIC) + 2  # magic + version + alg
_HEADER_LEN = _PREFIX_LEN + SALT_LEN + NONCE_LEN
_BAD = "Wrong password or corrupted file"


def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = Scrypt(salt=salt, length=32, n=SCRYPT_N, r=SCRYPT_R, p=SCRYPT_P)
    return kdf.derive(password.encode("utf-8"))


def encrypt_v2(text: str, algorithm: str, password) -> bytes:
    """
    Build a v2 frame for the given message.

    Frame layout (encrypted):
        magic(4) | version(1) | alg(1) | salt(16) | nonce(12) | ciphertext+tag
    Frame layout (none):
        magic(4) | version(1) | alg(1) | u32 length | plaintext | sha256[:8]

    The encrypted header is authenticated as AEAD associated data.

    Raises:
        ValueError: unknown algorithm, or a missing password for an encrypted mode.
    """
    if algorithm not in ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    alg_id, cls = ALGORITHMS[algorithm]
    data = text.encode("utf-8")
    prefix = MAGIC + bytes([VERSION, alg_id])

    if cls is None:
        check = hashlib.sha256(data).digest()[:CHECK_LEN]
        return prefix + struct.pack(">I", len(data)) + data + check

    if not password:
        raise ValueError("Password required for this algorithm")
    salt = os.urandom(SALT_LEN)
    nonce = os.urandom(NONCE_LEN)
    header = prefix + salt + nonce
    ciphertext = cls(_derive_key(password, salt)).encrypt(nonce, data, header)
    return header + ciphertext


def decrypt_v2(frame: bytes, password) -> str:
    """
    Parse and decrypt a v2 frame.

    Raises:
        ValueError: malformed frame, wrong password, or tampered data.
    """
    if len(frame) < _PREFIX_LEN or frame[: len(MAGIC)] != MAGIC:
        raise ValueError(_BAD)
    if frame[len(MAGIC)] != VERSION or frame[len(MAGIC) + 1] not in _BY_ID:
        raise ValueError(_BAD)
    _, cls = _BY_ID[frame[len(MAGIC) + 1]]

    if cls is None:
        body = frame[_PREFIX_LEN:]
        if len(body) < 4 + CHECK_LEN:
            raise ValueError(_BAD)
        (length,) = struct.unpack(">I", body[:4])
        data, check = body[4:-CHECK_LEN], body[-CHECK_LEN:]
        if len(data) != length or hashlib.sha256(data).digest()[:CHECK_LEN] != check:
            raise ValueError(_BAD)
    else:
        if not password:
            raise ValueError("Password required to decrypt this file")
        if len(frame) <= _HEADER_LEN:
            raise ValueError(_BAD)
        header = frame[:_HEADER_LEN]
        salt = header[_PREFIX_LEN : _PREFIX_LEN + SALT_LEN]
        nonce = header[_PREFIX_LEN + SALT_LEN :]
        try:
            data = cls(_derive_key(password, salt)).decrypt(nonce, frame[_HEADER_LEN:], header)
        except InvalidTag:
            raise ValueError(_BAD) from None

    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        raise ValueError(_BAD) from None


if __name__ == "__main__":
    for algo in ALGORITHMS:
        pw = None if algo == "none" else "demo-password"
        frame = encrypt_v2("JOEL 🧬", algo, pw)
        print(algo, len(frame), "bytes ->", decrypt_v2(frame, pw))
