import shutil
from pathlib import Path

from app.decoder.dna_decoder import parse_stego_header
from app.fasta.fasta_generator import generate_stego_header, inject_into_fasta

FIXTURES = Path(__file__).parent / "fixtures"


def test_legacy_header_has_no_fmt_tokens():
    header = generate_stego_header("ACGT", use_encryption=True)
    assert "fmt=" not in header and "alg=" not in header


def test_v2_header_carries_fmt_and_alg():
    header = generate_stego_header("ACGT", use_encryption=True, algorithm="aes-256-gcm")
    assert "fmt=2" in header and "alg=aes-256-gcm" in header and "mode=encrypted" in header


def test_v2_none_header_is_plain_mode():
    header = generate_stego_header("ACGT", algorithm="none")
    assert "mode=plain" in header and "alg=none" in header


def test_parse_legacy_fixture():
    info = parse_stego_header(str(FIXTURES / "legacy_encrypted_stego.fasta"))
    assert info["fmt"] == 1 and info["mode"] == "encrypted" and info["alg"] is None


def test_parse_v2_after_inject(tmp_path):
    cover = tmp_path / "c.fasta"
    shutil.copy(FIXTURES / "cover.fasta", cover)
    out = inject_into_fasta(str(cover), "ACGT" * 10, algorithm="chacha20-poly1305")
    info = parse_stego_header(out)
    assert info["fmt"] == 2 and info["alg"] == "chacha20-poly1305" and info["length"] == 40


def test_parse_missing_header_returns_none(tmp_path):
    p = tmp_path / "x.fasta"
    p.write_text(">only\nACGT\n")
    assert parse_stego_header(str(p)) is None
