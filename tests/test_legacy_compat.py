import json
from pathlib import Path

from app.pipeline.stego_pipeline import decode_message

FIXTURES = Path(__file__).parent / "fixtures"
META = json.loads((FIXTURES / "legacy.json").read_text())


def test_legacy_encrypted_file_still_decodes():
    m = META["legacy_encrypted"]
    assert decode_message(str(FIXTURES / m["file"]), m["key"].encode()) == m["message"]


def test_legacy_plain_file_still_decodes():
    m = META["legacy_plain"]
    assert decode_message(str(FIXTURES / m["file"]), b"") == m["message"]
