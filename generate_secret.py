#!/usr/bin/env python3
"""
Generate a secure secret key for production
"""
import secrets
import string

def generate_secret_key():
    """Generate a secure secret key for Flask"""
    # Generate a 32-byte random key and encode as hex
    return secrets.token_hex(32)

def generate_password(length=16):
    """Generate a secure password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

if __name__ == "__main__":
    print("🔐 Security Key Generator")
    print("=" * 50)
    print(f"SECRET_KEY={generate_secret_key()}")
    print(f"Sample password: {generate_password()}")
    print("\n⚠️  IMPORTANT: Keep these keys secure and never commit them to version control!")
