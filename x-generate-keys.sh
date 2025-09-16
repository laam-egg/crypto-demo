#!/bin/bash
set -e

# Generate 2048-bit RSA keypair
echo "[*] Generating RSA private key..."
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out rsa_private.pem

echo "[*] Extracting RSA public key..."
openssl rsa -in rsa_private.pem -pubout -out rsa_public.pem

echo "[+] Done. Keys saved as rsa_private.pem and rsa_public.pem"
