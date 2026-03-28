from app import db
from datetime import datetime

class Comment(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key = True)
    content = db.Column(db.Text, nullable = True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    created_at = db.Column(db.Datetime, default = datetime.utcnow)
    updated_at = db.Column(db.Datetime, default = datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return{
            'id' : self.id,
            'title' : self.title,
            'content' : self.content,
            'user_id' : self. user_id,
            'created_at' : self.created_at.isoformat(),
            'updated_at' : self.updated_at.isoformat()
        }