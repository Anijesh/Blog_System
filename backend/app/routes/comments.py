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
    

    @jwt_required()
    def post(self, post_id):
        post = Post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404
        data = request.get_json()
        current_user_id = get_jwt_identity()
        if not data:
            return {"message": "No data provided"}, 400
        
        if "content" not in data:
            return {"message": "Content is required"}, 400

        comment = Comment(
            content=data["content"],
            user_id=int(current_user_id),
            post_id=post_id
        )
        db.session.add(comment)
        db.session.commit()
        return {"message": "Comment added successfully"}, 201


class CommentDetail(Resource):

    @jwt_required()
    def put(self, comment_id):
        current_user_id = get_jwt_identity()
        comment = Comment.query.get(comment_id)
        if not comment:
            return {"message": "Comment not found"}, 404

        if comment.user_id != int(current_user_id):
            return {"message": "You can only edit your own comments"}, 403
        
        data = request.get_json()
        if not data:
            return {"message": "No data provided"}, 400
        
        if "content" in data:
            comment.content = data["content"]
        db.session.commit()

        return {"message": "Comment updated successfully"}, 200

    @jwt_required()
    def delete(self, comment_id):
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get("role")

        comment = Comment.query.get(comment_id)

        if not comment:
            return {"message": "Comment not found"}, 404

        if comment.user_id != int(current_user_id) and role != "admin":
            return {"message": "Not authorized to delete this comment"}, 403

        db.session.delete(comment)
        db.session.commit()

        return {"message": "Comment deleted successfully"}, 200
