from app.crypto.encryption import decrypt_data
from app.preprocessing.rearrange import restore_text

def extract_stego_sequence(filepath: str) -> str:
    """
    E
    xtract the encoded DNA sequence from a stego FASTA file.
    It looks for a header starting with '>stego_seq_'.
    """

    dna_sequence = ""
    capture = False

    with open(filepath, "r") as f:

        for line in f:

            line = line.strip()

            # Start capturing after stego header
            if line.startswith(">stego_seq_"):
                capture = True
                continue

            # Stop if another header appears
            if capture and line.startswith(">"):
                break

            # Collect DNA sequence lines
            if capture:
                dna_sequence += line

    return dna_sequence


def dna_to_binary(dna_sequence: str) -> str:
    """
    Convert DNA sequence back into binary string.

    Mapping (reverse of encoder):

    G -> 00
    C -> 01
    A -> 10
    T -> 11
    """

    dna_map = {
        "G": "00",
        "C": "01",
        "A": "10",
        "T": "11"
    }

    binary = ""

    for base in dna_sequence:
        binary += dna_map[base]

    return binary
def binary_to_bytes(binary: str) -> bytes:
    """
    Convert binary string into bytes.
    Binary must be divisible by 8.
    """

    byte_array = bytearray()

    for i in range(0, len(binary), 8):
        byte = binary[i:i+8]
        byte_array.append(int(byte, 2))

    return bytes(byte_array)

def decrypt_bytes(encrypted_bytes: bytes, key: bytes) -> bytes:
    """
    Decrypt encrypted byte data using the provided key.
    """

    decrypted_data = decrypt_data(encrypted_bytes, key)

    return decrypted_data
def bytes_to_text(data: bytes) -> str:
    """
    Convert UTF-8 byte data back to text.
    """

    return data.decode("utf-8")
def restore_original_text(text: str) -> str:
    """
    Reverse the rearrangement algorithm
    """

    return restore_text(text)


# Test code
if __name__ == "__main__":

    from app.crypto.encryption import generate_key
    from app.crypto.encryption import decrypt_data

    # Load key used during encryption
    key = generate_key()   # replace later with stored key

    file_path = "storage/fasta_files/example_stego.fasta"

    # Step 1: extract DNA
    dna = extract_stego_sequence(file_path)
    print("DNA Preview:", dna[:80])

    # Step 2: DNA → binary
    binary = dna_to_binary(dna)
    print("Binary Preview:", binary[:64])

    # Step 3: binary → bytes
    encrypted_bytes = binary_to_bytes(binary)
    print("Encrypted Bytes Preview:", encrypted_bytes[:20])

    # Step 4: decrypt
    decrypted_bytes = decrypt_bytes(encrypted_bytes, key)

    # Step 5: UTF-8 decode
    decoded_text = bytes_to_text(decrypted_bytes)

    # Step 6: restore rearranged text
    original_text = restore_original_text(decoded_text)

    print("\nRecovered Message:")
    print(original_text)