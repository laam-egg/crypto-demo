#!/bin/bash
set -e

if [ $# -ne 3 ]; then
  echo "Usage: $0 <password> <plaintext-file> <signature-file>"
  exit 1
fi

PASSWORD="$1"
PLAINTEXT="$2"
SIGFILE="$3"

echo "[*] Computing SHA256 of $PLAINTEXT..."
SHA256_HEX=$(openssl dgst -sha256 -hex "$PLAINTEXT" | awk '{print $2}')
echo "[+] SHA256 (plaintext): $SHA256_HEX"

echo "[*] Deriving AES key and IV from password..."
KEY=$(echo -n "$PASSWORD" | openssl dgst -sha256 -binary | xxd -p -c 256)
IV=$(echo -n "$PASSWORD" | openssl dgst -md5 -binary | xxd -p -c 256)

echo "[*] Decrypting signature..."
openssl enc -d -aes-256-cbc -K "$KEY" -iv "$IV" -in "$SIGFILE" -out digest_dec.bin

SIG_HEX=$(xxd -p digest_dec.bin | tr -d '\n')
rm -f digest_dec.bin
echo "[+] SHA256 (from signature): $SIG_HEX"

echo "[*] Comparing..."
if [ "$SHA256_HEX" = "$SIG_HEX" ]; then
  echo "[✓] Verification success: signature matches file."
else
  echo "[✗] Verification failed!"
  exit 1
fi
