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
EPHEMERAL_PUB="ephemeral_pub.pem"
SHARED_SECRET="shared_secret.bin"
SYMM_KEY="symm_key.bin"

echo "[*] Deriving shared secret with recipient private key..."
openssl pkeyutl -derive -inkey ecc_private.pem -peerkey "$EPHEMERAL_PUB" -out "$SHARED_SECRET"

echo "[*] Hashing shared secret into 256-bit AES key..."
openssl dgst -sha256 -binary "$SHARED_SECRET" > "$SYMM_KEY"

echo "[*] Decrypting $CIPHERTEXT with AES-256-CBC..."
openssl enc -d -aes-256-cbc -in "$CIPHERTEXT" -out "$PLAINTEXT_OUT" -pass file:"$SYMM_KEY"

echo "[*] Verifying signature with x-verify..."
./x-verify.sh "$PASSWORD" "$PLAINTEXT_OUT" "$SIGFILE"

echo "[+] Done. Decrypted plaintext saved as $PLAINTEXT_OUT"
