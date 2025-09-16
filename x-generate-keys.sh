# Private key
openssl ecparam -name prime256v1 -genkey -noout -out ecc_private.pem

# Public key
openssl ec -in ecc_private.pem -pubout -out ecc_public.pem
