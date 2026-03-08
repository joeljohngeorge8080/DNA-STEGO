from cryptography.fernet import Fernet


def generate_key():
    """
    Generate a new encryption key.
    """
    return Fernet.generate_key()


def encrypt_data(data: bytes, key: bytes) -> bytes:
    """
    Encrypt byte data using Fernet encryption.

    Args:
        data (bytes): input data
        key (bytes): encryption key

    Returns:
        bytes: encrypted data
    """
    cipher = Fernet(key)
    encrypted_data = cipher.encrypt(data)
    return encrypted_data


def decrypt_data(encrypted_data: bytes, key: bytes) -> bytes:
    """
    Decrypt encrypted data.

    Args:
        encrypted_data (bytes): encrypted bytes
        key (bytes): encryption key

    Returns:
        bytes: decrypted data
    """
    cipher = Fernet(key)
    decrypted_data = cipher.decrypt(encrypted_data)
    return decrypted_data

#TESTING 
# if __name__ == "__main__":

#     text = "HELLO WORLD"

#     # convert to UTF-8
#     data = text.encode("utf-8")

#     key = generate_key()

#     encrypted = encrypt_data(data, key)
#     decrypted = decrypt_data(encrypted, key)

#     print("Original:", text)
#     print("Encrypted:", encrypted)
#     print("Decrypted:", decrypted.decode("utf-8"))