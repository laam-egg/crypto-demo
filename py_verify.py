#!/usr/bin/env python3
import sys, hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

def derive_key_iv(password: str):
    """Derive AES key and IV from password (same as OpenSSL script)."""
    key = hashlib.sha256(password.encode()).digest()   # 32 bytes
    iv  = hashlib.md5(password.encode()).digest()      # 16 bytes
    return key, iv

def main():
    if len(sys.argv) != 4:
        print(f"Usage: {sys.argv[0]} <password> <plaintext-file> <signature-file>")
        sys.exit(1)

    password, plaintext_file, sig_file = sys.argv[1], sys.argv[2], sys.argv[3]

    print(f"[*] Computing SHA256 of {plaintext_file}...")
    with open(plaintext_file, "rb") as f:
        plaintext = f.read()
    sha256_hex = hashlib.sha256(plaintext).hexdigest()
    print(f"[+] SHA256 (plaintext): {sha256_hex}")

    print("[*] Deriving AES key and IV from password...")
    key, iv = derive_key_iv(password)

    print("[*] Reading and decrypting signature...")
    with open(sig_file, "rb") as f:
        ciphertext = f.read()
    cipher = AES.new(key, AES.MODE_CBC, iv)
    try:
        digest = unpad(cipher.decrypt(ciphertext), AES.block_size)
    except ValueError:
        print("[✗] Signature decryption failed (bad padding or wrong password).")
        sys.exit(1)

    sig_hex = digest.hex()
    print(f"[+] SHA256 (from signature): {sig_hex}")

    print("[*] Comparing...")
    if sha256_hex == sig_hex:
        print("[✓] Verification success: signature matches file.")
    else:
        print("[✗] Verification failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
