from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app import db


class PostLike(Resource):

    @jwt_required()
    def post(self, post_id):
        """
        Like a post
        ---
        tags:
          - Likes
        security:
          - BearerAuth: []
        parameters:
          - name: post_id
            in: path
            type: integer
            required: true
            description: ID of the post
        responses:
          201:
            description: Post liked
          400:
            description: Already liked
          404:
            description: Post not found
        """
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
    
    @jwt_required()
    def delete(self, post_id):
        """
        Unlike a post
        ---
        tags:
          - Likes
        security:
          - BearerAuth: []
        parameters:
          - name: post_id
            in: path
            type: integer
            required: true
            description: ID of the post
        responses:
          200:
            description: Post unliked
          404:
            description: Like not found
        """
        user_id = get_jwt_identity()

        like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()
        if not like:
            return {"message": "Like not found"}, 404
        db.session.delete(like)
        db.session.commit()
        return {"message": "Post unliked"}, 200
    


class PostLikeList(Resource):
    def get(self, post_id):
        """
        Get list of users who liked a post
        ---
        tags:
          - Likes
        parameters:
          - name: post_id
            in: path
            type: integer
            required: true
            description: ID of the post
        responses:
          200:
            description: A list of users and total likes
        """
        likes = Like.query.filter_by(post_id=post_id).all()
        result = []
        for like in likes:
            user = User.query.get(like.user_id)
            result.append({
                "user_id": user.id,
                "name": user.name
            })
        return {
            "total_likes": len(likes),
            "liked_by": result
        }, 200


   