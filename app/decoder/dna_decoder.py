def extract_dna_sequence(filepath: str) -> str:
    """
    Extract DNA sequence from a FASTA file.
    Ignores header lines starting with '>'.
    """

    dna_sequence = ""

    with open(filepath, "r") as f:
        for line in f:
            line = line.strip()

            # Skip header
            if line.startswith(">"):
                continue

            dna_sequence += line

    return dna_sequence

def extract_stego_sequence(filepath: str) -> str:
    """
    Extract the encoded DNA sequence from the stego FASTA file.
    Looks for header starting with >stego_seq_
    """

    dna_sequence = ""
    capture = False

    with open(filepath, "r") as f:

        for line in f:

            line = line.strip()

            # Detect start of stego sequence
            if line.startswith(">stego_seq_"):
                capture = True
                continue

            # Stop if another header appears
            if capture and line.startswith(">"):
                break

            # Collect DNA sequence
            if capture:
                dna_sequence += line

    return dna_sequence

if __name__ == "__main__":

    file_path = "storage/fasta_files/example_stego.fasta"

    dna = extract_stego_sequence(file_path)

    print("Extracted Stego DNA:")
    print(dna[:120])