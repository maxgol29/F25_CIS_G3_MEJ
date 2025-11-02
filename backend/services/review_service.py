from db.models import db

class ReviewService:
    @staticmethod
    def get_all_reviews(self):
        return db.get_all_reviews()  
    
    @staticmethod
    def create_review(review_text, label):
        if label not in ['0', '1', '2']:
            raise ValueError('Label must be 0, 1, or 2')
        return db.add_review(review_text, label)

review_service = ReviewService()        