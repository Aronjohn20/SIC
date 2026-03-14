from Crypto.Cipher import AES
import hashlib
import base64

# AES key (must be 16 bytes)
key = b'Sixteen byte key'


def aes_encrypt(message):
    cipher = AES.new(key, AES.MODE_EAX)

    ciphertext, tag = cipher.encrypt_and_digest(message.encode())

    encrypted = base64.b64encode(ciphertext).decode()

    return encrypted


def sha256_hash(message):
    return hashlib.sha256(message.encode()).hexdigest()


# test the module
if __name__ == "__main__":

    message = "HELLO WORLD"

    aes_result = aes_encrypt(message)
    hash_result = sha256_hash(message)

    print("AES Encrypted:", aes_result)
    print("SHA256 Hash:", hash_result)