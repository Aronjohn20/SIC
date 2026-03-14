from flask import Flask, render_template, request, jsonify
from Crypto.Cipher import AES
import hashlib
import base64
import string

app = Flask(__name__, template_folder='templates', static_folder='static')
AES_KEY = b'Sixteen byte key' # 16 bytes for AES-128
def vigenere_encrypt(plaintext, key):
    alphabet = string.ascii_uppercase
    plaintext, key = plaintext.upper(), key.upper()
    encrypted, key_idx = "", 0
    for char in plaintext:
        if char in alphabet:
            p_idx = alphabet.index(char)
            k_idx = alphabet.index(key[key_idx % len(key)])
            encrypted += alphabet[(p_idx + k_idx) % 26]
            key_idx += 1
        else:
            encrypted += char
    return encrypted
def aes_encrypt(message):
    cipher = AES.new(AES_KEY, AES.MODE_EAX)
    ciphertext, tag = cipher.encrypt_and_digest(message.encode())
    return base64.b64encode(cipher.nonce + ciphertext).decode()
def sha256_hash(message):
    return hashlib.sha256(message.encode()).hexdigest()
# --- Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/encrypt', methods=['POST'])
def handle_encryption():
    data = request.json
    msg = data.get('message', '')
    key = data.get('key', 'KEY')
    v_out = vigenere_encrypt(msg, key)
    a_out = aes_encrypt(v_out)
    h_out = sha256_hash(msg)
    return jsonify({
        "vigenere": v_out,
        "aes": a_out,
        "hash": h_out
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
