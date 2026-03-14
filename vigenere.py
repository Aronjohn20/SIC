import string

alphabet = string.ascii_uppercase


# Vigenere Encryption
def vigenere_encrypt(plaintext, key):

    plaintext = plaintext.upper()
    key = key.upper()

    encrypted = ""
    key_index = 0

    for char in plaintext:

        if char in alphabet:

            p_index = alphabet.index(char)
            k_index = alphabet.index(key[key_index % len(key)])

            new_index = (p_index + k_index) % 26

            encrypted += alphabet[new_index]

            key_index += 1

        else:
            encrypted += char

    return encrypted


# Vigenere Decryption
def vigenere_decrypt(ciphertext, key):

    ciphertext = ciphertext.upper()
    key = key.upper()

    decrypted = ""
    key_index = 0

    for char in ciphertext:

        if char in alphabet:

            c_index = alphabet.index(char)
            k_index = alphabet.index(key[key_index % len(key)])

            new_index = (c_index - k_index) % 26

            decrypted += alphabet[new_index]

            key_index += 1

        else:
            decrypted += char

    return decrypted


# Test the cipher
if __name__ == "__main__":

    message = "HELLO WORLD"
    key = "KEY"

    encrypted = vigenere_encrypt(message, key)
    decrypted = vigenere_decrypt(encrypted, key)

    print("Plaintext :", message)
    print("Key       :", key)
    print("Encrypted :", encrypted)
    print("Decrypted :", decrypted)