from cryptography.fernet import Fernet
from ..core.config import settings

def encrypt_data(data: str) -> str:
    f = Fernet(settings.encryption_key.encode())
    encrypted_data = f.encrypt(data.encode())
    return encrypted_data.decode()

def decrypt_data(encrypted_data: str) -> str:
    f = Fernet(settings.encryption_key.encode())
    decrypted_data = f.decrypt(encrypted_data.encode())
    return decrypted_data.decode()

def generate_encryption_key() -> str:
    return Fernet.generate_key().decode()
