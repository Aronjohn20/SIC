document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const messageInput = document.getElementById('message');
    const caesarShiftInput = document.getElementById('caesarShift');
    const vigenereKeyInput = document.getElementById('vigenereKey');
    const encryptBtn = document.getElementById('encryptBtn');
    const runAttackBtn = document.getElementById('runAttack');
    
    const decrementShiftBtn = document.getElementById('decrementShift');
    const incrementShiftBtn = document.getElementById('incrementShift');

    const caesarOutput = document.getElementById('caesarOutput');
    const vigenereOutput = document.getElementById('vigenereOutput');
    const aesOutput = document.getElementById('aesOutput');
    const shaOutput = document.getElementById('shaOutput');
    const attackList = document.getElementById('attackList');

    // Initialize Lucide Icons
    lucide.createIcons();

    // --- Encryption Logic ---

    // Caesar Cipher
    function caesarEncrypt(text, shift) {
        return text.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const code = char.charCodeAt(0);
                const base = code >= 65 && code <= 90 ? 65 : 97;
                return String.fromCharCode(((code - base + shift) % 26 + 26) % 26 + base);
            }
            return char;
        }).join('');
    }

    // Vigenère Cipher
    function vigenereEncrypt(text, key) {
        key = key.toUpperCase();
        let keyIndex = 0;
        return text.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const code = char.charCodeAt(0);
                const isUpper = code >= 65 && code <= 90;
                const base = isUpper ? 65 : 97;
                const kShift = key[keyIndex % key.length].charCodeAt(0) - 65;
                keyIndex++;
                return String.fromCharCode(((code - base + kShift) % 26 + 26) % 26 + base);
            }
            return char;
        }).join('');
    }

    // SHA-256 Hashing
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // AES-GCM Encryption
    async function aesEncrypt(message) {
        const keyData = new TextEncoder().encode('Sixteen byte key'); // Ideally should be derived securely
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM' },
            false,
            ['encrypt']
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedMessage = new TextEncoder().encode(message);

        const ciphertextBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            cryptoKey,
            encodedMessage
        );

        const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertextBuffer), iv.length);

        return btoa(String.fromCharCode.apply(null, combined));
    }

    // --- Brute Force Attack ---
    function looksLikeEnglish(text) {
        const commonWords = ["THE", "AND", "HELLO", "WORLD", "IS", "THIS", "FOR", "YOU", "WITH"];
        const upper = text.toUpperCase();
        return commonWords.some(word => upper.includes(word));
    }

    function runAttack() {
        const ciphertext = caesarOutput.textContent;
        if (!ciphertext || ciphertext === "Waiting for input...") {
            alert("No Caesar ciphertext to attack!");
            return;
        }

        attackList.innerHTML = '';
        let foundPossible = false;

        for (let shift = 1; shift < 26; shift++) {
            const decrypted = caesarEncrypt(ciphertext, 26 - shift);
            const isEnglish = looksLikeEnglish(decrypted);

            const item = document.createElement('div');
            item.className = `attack-item ${isEnglish ? 'possible-match' : ''}`;
            
            item.innerHTML = `
                <div class="shift-badge">Shift ${shift}</div>
                <div class="plain-text">${decrypted}</div>
                <div class="confidence-tag ${isEnglish ? 'confidence-high' : ''}">
                    ${isEnglish ? 'High Confidence' : 'Low Confidence'}
                </div>
            `;

            attackList.appendChild(item);
            if (isEnglish) foundPossible = true;
        }

        if (!foundPossible) {
            const item = document.createElement('div');
            item.className = 'empty-state';
            item.textContent = "No likely candidates found. Try a common English phrase.";
            attackList.appendChild(item);
        }
    }

    // --- UI Handlers ---

    async function handleEncrypt() {
        const text = messageInput.value;
        const shift = parseInt(caesarShiftInput.value) || 0;
        const key = vigenereKeyInput.value || "KEY";

        if (!text) {
            alert("Please enter a message.");
            return;
        }

        // Classical
        caesarOutput.textContent = caesarEncrypt(text, shift);
        vigenereOutput.textContent = vigenereEncrypt(text, key);

        // Modern
        try {
            aesOutput.textContent = await aesEncrypt(text);
            shaOutput.textContent = await sha256(text);
        } catch (e) {
            console.error(e);
            aesOutput.textContent = "Encryption Error";
            shaOutput.textContent = "Hashing Error";
        }
    }

    // Copy to Clipboard
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const target = document.getElementById(targetId);
            const text = target.textContent;

            if (text && text !== "Waiting for input...") {
                navigator.clipboard.writeText(text).then(() => {
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i data-lucide="check"></i>';
                    lucide.createIcons();
                    btn.style.color = 'var(--success-color)';
                    btn.style.borderColor = 'var(--success-color)';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        lucide.createIcons();
                        btn.style.color = '';
                        btn.style.borderColor = '';
                    }, 2000);
                });
            }
        });
    });

    // Stepper Listeners
    decrementShiftBtn.addEventListener('click', () => {
        let val = parseInt(caesarShiftInput.value) || 0;
        if (val > 0) {
            caesarShiftInput.value = val - 1;
            if (messageInput.value) handleEncrypt();
        }
    });

    incrementShiftBtn.addEventListener('click', () => {
        let val = parseInt(caesarShiftInput.value) || 0;
        if (val < 25) {
            caesarShiftInput.value = val + 1;
            if (messageInput.value) handleEncrypt();
        }
    });

    // Main Listeners
    encryptBtn.addEventListener('click', handleEncrypt);
    runAttackBtn.addEventListener('click', runAttack);

    // Initial state cleanup
    messageInput.addEventListener('input', () => {
        if (!messageInput.value) {
            caesarOutput.textContent = "Waiting for input...";
            vigenereOutput.textContent = "Waiting for input...";
            aesOutput.textContent = "Waiting for input...";
            shaOutput.textContent = "Waiting for input...";
            attackList.innerHTML = '<div class="empty-state">No attack results yet.</div>';
        }
    });
});
