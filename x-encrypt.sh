#!/bin/bash
set -e

if [ $# -ne 2 ]; then
  echo "Usage: $0 <password> <plaintext-file>"
  exit 1
fi

PASSWORD="$1"
PLAINTEXT="$2"
CIPHERTEXT="${PLAINTEXT}.enc"

echo "[*] Encrypting $PLAINTEXT with RSA public key..."
openssl rsautl -encrypt -inkey rsa_public.pem -pubin -in "$PLAINTEXT" -out "$CIPHERTEXT"

echo "[*] Signing plaintext with x-sign.sh..."
./x-sign.sh "$PASSWORD" "$PLAINTEXT"

echo "[+] Done. Ciphertext: $CIPHERTEXT | Signature: ${PLAINTEXT}.sig"
