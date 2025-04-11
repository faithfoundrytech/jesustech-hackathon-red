import africastalking
import os

from dotenv import load_dotenv

load_dotenv()

africastalking.initialize(
    username='EMID',
    api_key = os.getenv("AT_API_KEY")
)


sms = africastalking.SMS

def send_sms(phone_number):

    # get_phone = input('Enter phone number')

    recipients = [f"+254{str(phone_number)}"]

    # Set your message
    message = f"Youre officially plugged into a community where faith meets generation. Lets grow, vibe, and build a Christ-led future — together. #KingdomMinded #TechForJesus";

    # Set your shortCode or senderId
    sender = 20880

    try:
        response = sms.send(message, recipients, sender)
        print(response)

    except Exception as e:
        print(f'Houston, we have a problem: {e}')

send_sms('0743158232')
