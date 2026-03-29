from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.post import Post
from app.models.user import User
from app.models import Comment
from app import db


class CommentList(Resource):
    def get(self,post_id):
        post = Post.query.get(post_id)
        if not post:
            return{"message": "Post not found"},404
        comments = Comment.query.filter_by(post_id=post_id).all()
        result = []
        for comment in comments:
            result.append({
                "id": comment.id,
                "content": comment.content,
                "user_id": comment.user_id,
                "post_id": comment.post_id,
                "created_at": str(comment.created_at)
            })
        return result, 200