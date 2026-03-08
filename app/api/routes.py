from fastapi import APIRouter, UploadFile, File, Form
from app.pipeline.stego_pipeline import encode_message, decode_message
import shutil

router = APIRouter()


@router.post("/encrypt")
async def encrypt_message(
    message: str = Form(...),
    fasta_file: UploadFile = File(...)
):
    """
    Encode a message into a FASTA file
    """

    temp_path = f"storage/fasta_files/{fasta_file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(fasta_file.file, buffer)

    stego_file, key = encode_message(message, temp_path)

    return {
        "stego_file": stego_file,
        "key": key.decode()
    }


@router.post("/decrypt")
async def decrypt_message_api(
    key: str = Form(...),
    stego_file: UploadFile = File(...)
):
    """
    Decode message from stego FASTA
    """

    temp_path = f"storage/fasta_files/{stego_file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(stego_file.file, buffer)

    message = decode_message(temp_path, key.encode())

    return {
        "message": message
    }