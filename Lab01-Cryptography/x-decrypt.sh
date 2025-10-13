#!/bin/bash
set -e

if [ $# -ne 3 ]; then
  echo "Usage: $0 <password> <ciphertext-file> <signature-file>"
  exit 1
fi

PASSWORD="$1"
CIPHERTEXT="$2"
SIGFILE="$3"
PLAINTEXT_OUT="decrypted.txt"

echo "[*] Decrypting $CIPHERTEXT with RSA private key..."
openssl rsautl -decrypt -inkey rsa_private.pem -in "$CIPHERTEXT" -out "$PLAINTEXT_OUT"

echo "[*] Verifying signature with x-verify.sh..."
./x-verify.sh "$PASSWORD" "$PLAINTEXT_OUT" "$SIGFILE"

echo "[+] Done. Decrypted plaintext saved as $PLAINTEXT_OUT"
