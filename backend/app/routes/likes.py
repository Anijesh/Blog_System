from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app import db


class PostLike(Resource):

    @jwt_required()
    def post(self, post_id):
        user_id = int(get_jwt_identity())

        post = Post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404

        existing_like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()
        if existing_like:
            return {"message": "You already liked this post"}, 400

        like = Like(user_id=user_id, post_id=post_id)
        db.session.add(like)
        db.session.commit()

        return {"message": "Post liked"}, 201
    
    


   