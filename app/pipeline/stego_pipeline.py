from app.preprocessing.rearrange import rearrange_text, restore_text
from app.crypto.encryption import encrypt_data, decrypt_data, generate_key
from app.dna.dna_encoder import bytes_to_binary, binary_to_dna
from app.decoder.dna_decoder import (
    extract_stego_sequence,
    dna_to_binary,
    binary_to_bytes,
    bytes_to_text
)
from app.fasta.fasta_generator import inject_into_fasta


# =========================
# ENCODER PIPELINE
# =========================

def encode_message(text: str, original_fasta: str):
    """
    Full encoding pipeline.
    Returns generated stego FASTA file and encryption key.
    """

    # Step 1: rearrange text
    rearranged = rearrange_text(text)

    # Step 2: UTF-8 encode
    utf8_bytes = rearranged.encode("utf-8")

    # Step 3: generate encryption key
    key = generate_key()

    # Step 4: encrypt data
    encrypted_bytes = encrypt_data(utf8_bytes, key)

    # Step 5: bytes -> binary
    binary = bytes_to_binary(encrypted_bytes)

    # Step 6: binary -> DNA
    dna_sequence = binary_to_dna(binary)

    # Step 7: inject DNA into FASTA
    stego_file = inject_into_fasta(original_fasta, dna_sequence)

    return stego_file, key


# =========================
# DECODER PIPELINE
# =========================

def decode_message(stego_fasta: str, key: bytes):
    """
    Full decoding pipeline.
    Returns the original message.
    """

    # Step 1: extract DNA
    dna_sequence = extract_stego_sequence(stego_fasta)

    # Step 2: DNA -> binary
    binary = dna_to_binary(dna_sequence)

    # Step 3: binary -> bytes
    encrypted_bytes = binary_to_bytes(binary)

    # Step 4: decrypt
    decrypted_bytes = decrypt_data(encrypted_bytes, key)

    # Step 5: UTF-8 decode
    decoded_text = bytes_to_text(decrypted_bytes)

    # Step 6: restore rearranged text
    original_text = restore_text(decoded_text)

    return original_text

if __name__ == "__main__":

    message = "JOEL"

    original_fasta = "storage/fasta_files/original.fasta"

    print("Encoding message...")

    stego_file, key = encode_message(message, original_fasta)

    print("Stego file created:", stego_file)

    print("\nDecoding message...")

    recovered = decode_message(stego_file, key)

    print("Recovered message:", recovered)