#!/bin/bash
set -e

if [ $# -ne 2 ]; then
  echo "Usage: $0 <password> <plaintext-file>"
  exit 1
fi

PASSWORD="$1"
PLAINTEXT="$2"
SIGFILE="${PLAINTEXT}.sig"

echo "[*] Computing SHA256 of $PLAINTEXT..."
SHA256_HEX=$(openssl dgst -sha256 -hex "$PLAINTEXT" | awk '{print $2}')
echo "[+] SHA256: $SHA256_HEX"

echo "[*] Deriving AES key and IV from password..."
KEY=$(echo -n "$PASSWORD" | openssl dgst -sha256 -binary | xxd -p -c 256)
IV=$(echo -n "$PASSWORD" | openssl dgst -md5 -binary | xxd -p -c 256)

echo "[*] Encrypting SHA256 digest with AES-256-CBC..."
# Convert hex SHA256 to raw binary
echo "$SHA256_HEX" | xxd -r -p > digest.bin
openssl enc -aes-256-cbc -K "$KEY" -iv "$IV" -in digest.bin -out "$SIGFILE"

rm -f digest.bin
echo "[+] Signature written to $SIGFILE"
