import random


def wrap_sequence(sequence: str, line_length: int = 60) -> str:
    """
    Wrap DNA sequence into fixed length lines
    """

    wrapped = ""

    for i in range(0, len(sequence), line_length):
        wrapped += sequence[i:i+line_length] + "\n"

    return wrapped


def generate_stego_header(sequence: str) -> str:
    """
    Create header for injected DNA sequence
    """

    seq_id = random.randint(1000, 9999)
    length = len(sequence)

    header = f">stego_seq_{seq_id} encoded_payload length={length}"

    return header


def inject_into_fasta(original_fasta: str, encoded_sequence: str) -> str:
    """
    Inject encoded DNA sequence into an existing FASTA file
    """

    output_file = original_fasta.replace(".fasta", "_stego.fasta")

    header = generate_stego_header(encoded_sequence)
    wrapped_sequence = wrap_sequence(encoded_sequence)

    with open(original_fasta, "r") as f:
        original_content = f.read()

    with open(output_file, "w") as f:
        f.write(original_content.strip() + "\n\n")
        f.write(header + "\n")
        f.write(wrapped_sequence)

    return output_file


# Test code
if __name__ == "__main__":

    sample_dna = "CGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGAT"

    original_file = "storage/fasta_files/original.fasta"

    new_file = inject_into_fasta(original_file, sample_dna)

    print("New FASTA file created:", new_file)