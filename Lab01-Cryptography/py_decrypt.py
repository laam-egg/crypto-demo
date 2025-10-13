#!/usr/bin/env python3
import sys
import subprocess
from pathlib import Path
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5

def main():
    if len(sys.argv) != 4:
        print(f"Usage: {sys.argv[0]} <password> <ciphertext-file> <signature-file>")
        sys.exit(1)

    password = sys.argv[1]
    ciphertext_file = sys.argv[2]
    sig_file = sys.argv[3]
    plaintext_out = "decrypted.txt"

    # Check files exist
    for f in [ciphertext_file, sig_file]:
        if not Path(f).is_file():
            print(f"ERROR: {f} not found")
            sys.exit(1)

    # Load RSA private key
    print("[*] Loading RSA private key (rsa_private.pem)...")
    with open("rsa_private.pem", "rb") as f:
        key = RSA.import_key(f.read())

    # Decrypt ciphertext
    print(f"[*] Decrypting {ciphertext_file} with RSA private key...")
    cipher = PKCS1_v1_5.new(key)
    with open(ciphertext_file, "rb") as f:
        ciphertext = f.read()

    # PKCS1_v1_5 requires a sentinel in case decryption fails
    sentinel = b"DECRYPT_FAILED"
    plaintext = cipher.decrypt(ciphertext, sentinel)
    if plaintext == sentinel:
        print("[✗] Decryption failed (incorrect key or corrupted file)")
        sys.exit(1)

    # Save decrypted plaintext
    with open(plaintext_out, "wb") as f:
        f.write(plaintext)
    print(f"[+] Decrypted plaintext saved as {plaintext_out}")

    # Verify signature by calling py_verify.py
    print("[*] Verifying signature using py_verify.py...")
    try:
        subprocess.run(
            ["python", "py_verify.py", password, plaintext_out, sig_file],
            check=True
        )
    except subprocess.CalledProcessError:
        print("[✗] Signature verification failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
