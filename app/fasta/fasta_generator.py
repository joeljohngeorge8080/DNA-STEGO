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


def clean_fasta_content(lines):
    """
    Fix invalid FASTA formatting where sequence lines start with '>'
    """

    cleaned_lines = []

    for line in lines:

        line = line.strip()

        if line.startswith(">"):

            # Check if it looks like a sequence accidentally starting with >
            possible_sequence = line[1:]

            if all(base in "ACGTNRYWSKM" for base in possible_sequence):
                cleaned_lines.append(possible_sequence)
            else:
                cleaned_lines.append(line)

        else:
            cleaned_lines.append(line)

    return cleaned_lines


def inject_into_fasta(original_fasta: str, encoded_sequence: str) -> str:
    """
    Inject encoded DNA sequence into existing FASTA file
    """

    output_file = original_fasta.replace(".fasta", "_stego.fasta")

    header = generate_stego_header(encoded_sequence)
    wrapped_sequence = wrap_sequence(encoded_sequence)

    with open(original_fasta, "r") as f:
        lines = f.readlines()

    cleaned_lines = clean_fasta_content(lines)

    with open(output_file, "w") as f:

        for line in cleaned_lines:
            f.write(line + "\n")

        f.write("\n")
        f.write(header + "\n")
        f.write(wrapped_sequence)

    return output_file


# Test
if __name__ == "__main__":

    sample_dna = "CGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGAT"

    original_file = "storage/fasta_files/original.fasta"

    new_file = inject_into_fasta(original_file, sample_dna)

    print("Stego FASTA created:", new_file)