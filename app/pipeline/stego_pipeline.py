from app.preprocessing.rearrange import rearrange_text, restore_text
from app.crypto.encryption import encrypt_data, decrypt_data, generate_key
from app.dna.dna_encoder import bytes_to_binary, binary_to_dna
from app.crypto.cipher_v2 import MAGIC, decrypt_v2, encrypt_v2
from app.decoder.dna_decoder import (
    extract_stego_sequence,
    parse_stego_header,
    dna_to_binary,
    binary_to_bytes,
    bytes_to_text,
)
from app.fasta.fasta_generator import inject_into_fasta

DEFAULT_FASTA_PATH = "storage/fasta_files/default.fasta"


# =========================
# ENCODER PIPELINE
# =========================


def encode_message(
    text: str,
    original_fasta: str,
    use_encryption: bool = True,
    algorithm: str = None,
    password: str = None,
):
    """
    Full encoding pipeline.

    Args:
        text:            The secret message to hide.
        original_fasta:  Path to the cover FASTA file.
        use_encryption:  Legacy mode. If True, encrypt with AES (Fernet) and return a key.
                         If False, skip encryption — anyone can decode this file.
        algorithm:       If set, use the v2 format ("aes-256-gcm", "chacha20-poly1305"
                         or "none"); use_encryption is ignored.
        password:        Password for v2 encrypted algorithms.

    Returns:
        (stego_file_path, key_or_None)
        key is bytes for legacy encrypted files, None otherwise (v2 uses a password).
    """

    if algorithm is not None:
        frame = encrypt_v2(text, algorithm, password)
        dna_sequence = binary_to_dna(bytes_to_binary(frame))
        return inject_into_fasta(original_fasta, dna_sequence, algorithm=algorithm), None

    # Step 1: rearrange text
    rearranged = rearrange_text(text)

    # Step 2: UTF-8 encode
    utf8_bytes = rearranged.encode("utf-8")

    key = None
    if use_encryption:
        # Step 3: generate key & encrypt
        key = generate_key()
        data_bytes = encrypt_data(utf8_bytes, key)
    else:
        # No encryption — raw bytes go straight to DNA
        data_bytes = utf8_bytes

    # Step 4: bytes -> binary
    binary = bytes_to_binary(data_bytes)

    # Step 5: binary -> DNA
    dna_sequence = binary_to_dna(binary)

    # Step 6: inject DNA into FASTA
    stego_file = inject_into_fasta(original_fasta, dna_sequence, use_encryption)

    return stego_file, key


# =========================
# DECODER PIPELINE
# =========================


def decode_message(stego_fasta: str, key: bytes = b""):
    """
    Full decoding pipeline.

    Args:
        stego_fasta: Path to the stego FASTA file.
        key:         Legacy files: Fernet key bytes (b"" if encoded without
                     encryption). v2 files: the password, as bytes or str.

    Returns:
        The original plaintext message.
    """

    # Step 1: extract DNA
    dna_sequence = extract_stego_sequence(stego_fasta)

    # Step 2: DNA -> binary
    binary = dna_to_binary(dna_sequence)

    # Step 3: binary -> bytes
    raw_bytes = binary_to_bytes(binary)

    # v2 files: header says fmt=2, or the payload itself starts with the v2 magic
    # (legacy payloads are rearranged/Fernet, so they never start with it)
    header = parse_stego_header(stego_fasta)
    if (header and header["fmt"] == 2) or raw_bytes.startswith(MAGIC):
        password = key.decode("utf-8") if isinstance(key, bytes) else key
        return decrypt_v2(raw_bytes, password)

    # Step 4: decrypt only if a key was supplied
    if key:
        raw_bytes = decrypt_data(raw_bytes, key)

    # Step 5: UTF-8 decode
    decoded_text = bytes_to_text(raw_bytes)

    # Step 6: restore rearranged text
    original_text = restore_text(decoded_text)

    return original_text


if __name__ == "__main__":
    for use_enc in [True, False]:
        print(f"\n=== use_encryption={use_enc} ===")
        message = "JOEL"
        original_fasta = "storage/fasta_files/default.fasta"

        stego_file, key = encode_message(
            message, original_fasta, use_encryption=use_enc
        )
        print("Stego file:", stego_file)
        print("Key:", key)

        recovered = decode_message(stego_file, key if key else b"")
        print("Recovered:", recovered)

    for algo in ["aes-256-gcm", "chacha20-poly1305", "none"]:
        print(f"\n=== v2 algorithm={algo} ===")
        pw = None if algo == "none" else "demo-password"
        stego_file, _ = encode_message(
            "JOEL", "storage/fasta_files/default.fasta", algorithm=algo, password=pw
        )
        print("Stego file:", stego_file)
        print("Recovered:", decode_message(stego_file, (pw or "").encode()))
