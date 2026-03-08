def rearrange_text(text: str, block_size: int = 4) -> str:
    """
    Rearrange text using block-based reversal.

    Args:
        text (str): input text
        block_size (int): size of blocks

    Returns:
        str: rearranged text
    """

    result = ""

    for i in range(0, len(text), block_size):
        block = text[i:i+block_size]
        result += block[::-1]  # reverse block

    return result

#for reverse algorithm 
def restore_text(text: str, block_size: int = 4) -> str:
    """
    Restore original text from rearranged text.

    Args:
        text (str): rearranged text
        block_size (int): block size used earlier

    Returns:
        str: original text
    """

    result = ""

    for i in range(0, len(text), block_size):
        block = text[i:i+block_size]
        result += block[::-1]

    return result

# if __name__ == "__main__":
#     original = "HELLOWORLD"

#     rearranged = rearrange_text(original)
#     restored = restore_text(rearranged)

#     print("Original :", original)
#     print("Rearranged :", rearranged)
#     print("Restored :", restored)