def bytes_to_binary(data: bytes) -> str:
    """
    Convert byte data into a binary string.

    Args:
        data (bytes): encrypted byte data

    Returns:
        str: binary representation
    """

    binary_string = ""

    for byte in data:
        binary_string += format(byte, "08b")

    return binary_string

if __name__ == "__main__":

    sample_data = b"HELLO"

    binary = bytes_to_binary(sample_data)

    print("Input Bytes:", sample_data)
    print("Binary:", binary)