import string

alphabet = string.ascii_uppercase

# Caesar decryption
def caesar_decrypt(ciphertext, shift):
    decrypted = ""

    for char in ciphertext:
        if char.upper() in alphabet:
            index = alphabet.index(char.upper())
            new_index = (index - shift) % 26
            decrypted += alphabet[new_index]
        else:
            decrypted += char

    return decrypted


# English word detection
def looks_like_english(text):
    common_words = ["THE", "AND", "HELLO", "WORLD", "IS", "THIS"]

    text = text.upper()

    for word in common_words:
        if word in text:
            return True

    return False


# Attack demonstration
def attack_demo(ciphertext):

    print("\nIntercepted Ciphertext:")
    print(ciphertext)

    print("\nTrying all possible Caesar cipher shifts...\n")

    for shift in range(1, 26):

        decrypted = caesar_decrypt(ciphertext, shift)

        flag = ""
        if looks_like_english(decrypted):
            flag = " <-- Possible plaintext"

        print(f"Shift {shift:2}: {decrypted}{flag}")


# Run the demo
if __name__ == "__main__":

    ciphertext = "KHOOR ZRUOG"

    attack_demo(ciphertext)