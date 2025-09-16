#!/bin/bash
set -e

if [ $# -ne 2 ]; then
  echo "Usage: $0 <password> <plaintext-file>"
  exit 1
fi

PASSWORD="$1"
PLAINTEXT="$2"
CIPHERTEXT="${PLAINTEXT}.enc"
EPHEMERAL_PRIV="ephemeral_priv.pem"
EPHEMERAL_PUB="ephemeral_pub.pem"
SHARED_SECRET="shared_secret.bin"
SYMM_KEY="symm_key.bin"

echo "[*] Generating ephemeral ECC keypair..."
openssl ecparam -name prime256v1 -genkey -noout -out "$EPHEMERAL_PRIV"
openssl ec -in "$EPHEMERAL_PRIV" -pubout -out "$EPHEMERAL_PUB"

echo "[*] Deriving shared secret with recipient public key..."
openssl pkeyutl -derive -inkey "$EPHEMERAL_PRIV" -peerkey ecc_public.pem -out "$SHARED_SECRET"

echo "[*] Hashing shared secret into 256-bit AES key..."
openssl dgst -sha256 -binary "$SHARED_SECRET" > "$SYMM_KEY"

echo "[*] Encrypting $PLAINTEXT with AES-256-CBC..."
openssl enc -aes-256-cbc -salt -in "$PLAINTEXT" -out "$CIPHERTEXT" -pass file:"$SYMM_KEY"

echo "[*] Signing plaintext with x-sign..."
./x-sign.sh "$PASSWORD" "$PLAINTEXT"

echo "[+] Done. Ciphertext: $CIPHERTEXT | Ephemeral pubkey: $EPHEMERAL_PUB | Signature: ${PLAINTEXT}.sig"
