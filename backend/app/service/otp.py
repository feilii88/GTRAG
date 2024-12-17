import pyotp
import time

class OTP:
    def __init__(self):
        self.totp = pyotp.TOTP("ABCDEFGHIJKLM124")

    def generate_otp(self):
        return self.totp.now()
    
    def verify_otp(self, otp):
        return self.totp.verify(otp)