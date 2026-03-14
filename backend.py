from flask import Flask, request, jsonify
from vigenere import vigenere_encrypt
from crypto_utils import aes_encrypt, sha256_hash
from attack_demo import caesar_decrypt, looks_like_english
app = Flask(__name__)
@app.route('/process', methods=['POST'])
def process_message():
    data = request.json
    original_message = data.get('message')
    vigenere_key = data.get('key', 'KEY') 
    # 1. Classical Layer: Vigenere Encryption
    vigenere_ciphertext = vigenere_encrypt(original_message, vigenere_key)
    # 2. Modern Layer: AES Encryption (encrypting the Vigenere output)
    final_aes_ciphertext = aes_encrypt(vigenere_ciphertext)
    # 3. Integrity: SHA-256 Hash of the original message
    message_hash = sha256_hash(original_message)
    return jsonify({
        "original": original_message,
        "vigenere_step": vigenere_ciphertext,
        "aes_final": final_aes_ciphertext,
        "hash": message_hash
    })
@app.route('/demo-attack', methods=['POST'])
def demo_attack():
    data = request.json
    ciphertext = data.get('ciphertext', 'KHOOR ZRUOG')
    results = []
    for shift in range(1, 26):
        decrypted = caesar_decrypt(ciphertext, shift)
        is_possible = looks_like_english(decrypted)
        results.append({"shift": shift, "text": decrypted, "possible": is_possible})
    return jsonify({"attack_results": results})
if __name__ == "__main__":
    app.run(debug=True)