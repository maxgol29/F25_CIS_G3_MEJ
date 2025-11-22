# ======== NOT EXECUTED YET ==========
from db.models import db

class ReviewService:
    def get_all_reviews(self, limit=None):
        return db.get_all_reviews(limit)

    def create_review(self, review_text, label):
        if label not in ['0', '1', '2']:
            raise ValueError('Label must be 0, 1, or 2')
        return db.add_review(review_text, label)

review_service = ReviewService()   
# =========================================     