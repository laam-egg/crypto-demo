# Usage

## Setup

1. If you want to use the Python scripts,
	setup the virtual environment:

	```sh
	virtualenv venv
	source ./venv/bin/activate
	pip install -r requirements.txt
	```

2. Create a plaintext file, e.g. `plaintext.txt`.

## Sign then Verify

```sh
./x-sign.sh YOUR_PASSWORD plaintext.txt
```

then either

```sh
./x-verify.sh YOUR_PASSWORD plaintext.txt plaintext.txt.sig
```

or

```sh
python py_verify.py YOUR_PASSWORD plaintext.txt plaintext.txt.sig
```

## Encrypt and Sign, then Decrypt and Verify

Setup: Generate keys for RSA encryption/decryption:

```sh
./x-generate-encryption-keys.sh
```

Encrypt and sign:

```sh
./x-encrypt.sh YOUR_PASSWORD plaintext.txt
```

then either

```sh
./x-decrypt.sh YOUR_PASSWORD plaintext.txt.enc plaintext.txt.sig
```

or

```sh
python py_decrypt.py YOUR_PASSWORD plaintext.txt.enc plaintext.txt.sig
```
