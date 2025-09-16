#!/bin/bash
set -e

if [ $# -ne 3 ]; then
  echo "Usage: $0 <password> <plaintext-file> <signature-file>"
  exit 1
fi

PASSWORD="$1"
PLAINTEXT="$2"
SIGFILE="$3"
DECRYPTED_HASH="decrypted_hash.bin"
PLAINTEXT_HASH="plaintext_hash.bin"

echo "[*] Decrypting signature with AES-256-CBC ..."
openssl enc -d -aes-256-cbc -pbkdf2 \
  -in "$SIGFILE" -out "$DECRYPTED_HASH" -k "$PASSWORD"

echo "[*] Computing SHA256 of $PLAINTEXT ..."
openssl dgst -sha256 -binary "$PLAINTEXT" > "$PLAINTEXT_HASH"
echo "[+] SHA256 (hex): $(openssl dgst -sha256 "$PLAINTEXT" | awk '{print $2}')"

echo "[*] Comparing hashes ..."
if cmp -s "$DECRYPTED_HASH" "$PLAINTEXT_HASH"; then
  echo "[✓] Verification success: signature matches file."
else
  echo "[✗] Verification failed: signature does NOT match."
fi

# Clean up temporary hashes
rm -f "$DECRYPTED_HASH" "$PLAINTEXT_HASH"
