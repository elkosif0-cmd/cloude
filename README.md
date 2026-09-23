# Aghnam Alwadi — locked full-data build

The full business dataset is committed only in encrypted form.

- The unlock password is **not stored in this repository**.
- PBKDF2-HMAC-SHA-256 derives independent encryption and authentication keys.
- The dataset uses ChaCha20 encryption plus HMAC-SHA-256 authentication.
- The browser decrypts the data only after the correct password is entered.
