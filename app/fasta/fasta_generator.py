import random
from datetime import datetime

SEQUENCE_LINE_LENGTH = 60  # standard NCBI/FASTA line wrap


def wrap_sequence(sequence: str, line_length: int = SEQUENCE_LINE_LENGTH) -> str:
    """Wrap a nucleotide sequence to standard FASTA line width."""
    return "\n".join(
        sequence[i : i + line_length] for i in range(0, len(sequence), line_length)
    )


def generate_stego_header(sequence: str, use_encryption: bool = True) -> str:
    """
    Generate a biologically plausible FASTA header for the injected sequence.

    The header embeds metadata that the decoder uses to identify the payload.
    Format follows NCBI convention:  >stego_seq_<id> <desc> [key=<mode>]
    """
    seq_id = random.randint(10000, 99999)
    length = len(sequence)
    ts = datetime.utcnow().strftime("%Y%m%d")
    mode = "encrypted" if use_encryption else "plain"

    header = (
        f">stego_seq_{seq_id} DNA-Stego payload | "
        f"length={length} | date={ts} | mode={mode}"
    )
    return header


def clean_fasta_content(lines: list) -> list:
    """
    Normalise existing FASTA lines:
    - Keep valid header lines (starting with '>') unchanged.
    - Strip whitespace from sequence lines.
    - Remove blank lines so we can control spacing ourselves.
    """
    cleaned = []
    for line in lines:
        line = line.rstrip("\n")
        if not line.strip():
            continue  # drop blank lines — we'll re-add spacing ourselves
        if line.startswith(">"):
            cleaned.append(line)
        else:
            cleaned.append(line.strip().upper())
    return cleaned


def inject_into_fasta(
    original_fasta: str,
    encoded_sequence: str,
    use_encryption: bool = True,
) -> str:
    """
    Append the encoded DNA sequence to an existing FASTA file.

    The output strictly follows the NCBI/GenBank FASTA convention:
      - Header lines begin with '>'
      - Sequence lines wrap at 60 characters
      - A blank line separates each record
    """
    output_file = original_fasta.replace(".fasta", "_stego.fasta")

    header = generate_stego_header(encoded_sequence, use_encryption)
    wrapped_sequence = wrap_sequence(encoded_sequence)

    with open(original_fasta, "r") as f:
        raw_lines = f.readlines()

    cleaned_lines = clean_fasta_content(raw_lines)

    with open(output_file, "w") as f:
        # Write original records (already cleaned / normalised)
        current_is_header = False
        for line in cleaned_lines:
            if line.startswith(">"):
                if current_is_header:
                    # separate consecutive records with a blank line
                    f.write("\n")
                current_is_header = True
            f.write(line + "\n")

        # Blank line to separate original content from injected payload
        f.write("\n")

        # Injected stego record
        f.write(header + "\n")
        f.write(wrapped_sequence + "\n")

    return output_file


# Quick test
if __name__ == "__main__":
    sample_dna = "CGATCG" * 20
    new_file = inject_into_fasta(
        "storage/fasta_files/default.fasta", sample_dna, use_encryption=False
    )
    print("Stego FASTA created:", new_file)
