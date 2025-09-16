#!/bin/bash
set -e

if [ $# -ne 2 ]; then
  echo "Usage: $0 <password> <plaintext-file>"
  exit 1
fi

PASSWORD="$1"
PLAINTEXT="$2"
HASHFILE="${PLAINTEXT}.sha256"
SIGFILE="${PLAINTEXT}.sig"

echo "[*] Computing SHA256 of $PLAINTEXT ..."
HASH=$(openssl dgst -sha256 -binary "$PLAINTEXT")
echo "[+] SHA256 (hex): $(openssl dgst -sha256 "$PLAINTEXT" | awk '{print $2}')"

echo "[*] Saving raw hash to $HASHFILE ..."
openssl dgst -sha256 -binary "$PLAINTEXT" > "$HASHFILE"

echo "[*] Encrypting hash with AES-256-CBC ..."
openssl enc -aes-256-cbc -pbkdf2 -salt \
  -in "$HASHFILE" -out "$SIGFILE" -k "$PASSWORD"

echo "[+] Signature written to $SIGFILE"
