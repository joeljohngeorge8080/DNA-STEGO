from app.preprocessing.rearrange import rearrange_text, restore_text
from app.crypto.encryption import encrypt_data, decrypt_data, generate_key
from app.dna.dna_encoder import bytes_to_binary, binary_to_dna
from app.decoder.dna_decoder import (
    extract_stego_sequence,
    dna_to_binary,
    binary_to_bytes,
    bytes_to_text,
)
from app.fasta.fasta_generator import inject_into_fasta

DEFAULT_FASTA_PATH = "storage/fasta_files/default.fasta"


# =========================
# ENCODER PIPELINE
# =========================


def encode_message(text: str, original_fasta: str, use_encryption: bool = True):
    """
    Full encoding pipeline.

    Args:
        text:            The secret message to hide.
        original_fasta:  Path to the cover FASTA file.
        use_encryption:  If True, encrypt with AES (Fernet) and return a key.
                         If False, skip encryption — anyone can decode this file.

    Returns:
        (stego_file_path, key_or_None)
        key is bytes when use_encryption=True, None otherwise.
    """

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
        key:         AES key bytes. Pass b"" (empty) if the file was encoded
                     without encryption.

    Returns:
        The original plaintext message.
    """

    # Step 1: extract DNA
    dna_sequence = extract_stego_sequence(stego_fasta)

    # Step 2: DNA -> binary
    binary = dna_to_binary(dna_sequence)

    # Step 3: binary -> bytes
    raw_bytes = binary_to_bytes(binary)

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
