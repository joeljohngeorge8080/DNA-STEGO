def binary_to_dna(binary: str) -> str:
    """
    Convert binary string to DNA sequence using custom mapping.

    Mapping:
    00 -> G
    01 -> C
    10 -> A
    11 -> T
    """

    dna_map = {
        "00": "G",
        "01": "C",
        "10": "A",
        "11": "T"
    }

    dna_sequence = ""

    for i in range(0, len(binary), 2):
        pair = binary[i:i+2]
        dna_sequence += dna_map[pair]

    return dna_sequence

def bytes_to_binary(data: bytes) -> str:
    """
    Convert byte data into binary string
    """

    binary_string = ""

    for byte in data:
        binary_string += format(byte, "08b")

    return binary_string


def binary_to_dna(binary: str) -> str:
    """
    Convert binary string to DNA sequence
    """

    dna_map = {
        "00": "G",
        "01": "C",
        "10": "A",
        "11": "T"
    }

    dna_sequence = ""

    for i in range(0, len(binary), 2):
        pair = binary[i:i+2]
        dna_sequence += dna_map[pair]

    return dna_sequence


if __name__ == "__main__":

    sample = b"HELLO"

    binary = bytes_to_binary(sample)
    dna = binary_to_dna(binary)

    print("Input Bytes:", sample)
    print("Binary:", binary)
    print("DNA Sequence:", dna)