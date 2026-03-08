def text_to_utf8_bytes(text: str) -> bytes:
    """
    Convert input text into UTF-8 encoded bytes.
    
    Args:
        text (str): Input string from user
        
    Returns:
        bytes: UTF-8 encoded byte representation
    """
    try:
        utf8_bytes = text.encode("utf-8")
        return utf8_bytes
    except Exception as e:
        raise ValueError(f"UTF-8 encoding failed: {e}")
    
if __name__ == "__main__":
    text = "HELLO"
    result = text_to_utf8_bytes(text)

    print("Original Text:", text)
    print("UTF-8 Bytes:", result)