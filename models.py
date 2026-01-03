from datetime import datetime

class User:
    def __init__(self, wallet_address, user_type, data):
        self.wallet_address = wallet_address
        self.user_type = user_type
        self.data = data
        self.created_at = datetime.now()

class ComplaintData:
    def __init__(self, complaint_id, citizen_address, text, media_path, category, urgency, summary):
        self.complaint_id = complaint_id
        self.citizen_address = citizen_address
        self.text = text
        self.media_path = media_path
        self.category = category
        self.urgency = urgency
        self.summary = summary
        self.created_at = datetime.now()