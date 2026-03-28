from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.post import Post
from app.models.user import User
from app import db

class PostList(Resource):
    def get(self):
        posts = Post.query.all()
        result = []
        for post in posts:
            result.append({
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "user_id": post.user_id,
                "created_at": str(post.created_at)
            })
        return result, 200