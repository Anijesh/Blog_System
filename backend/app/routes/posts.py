from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.post import Post
from app.models.user import User
from app.models.like import Like
from app import db

class PostList(Resource):
    def get(self):
        posts = Post.query.all()
        result = []
        for post in posts:
            like_count = Like.query.filter_by(post_id=post.id).count()

            result.append({
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "user_id": post.user_id,
                "user_name": post.author.name,
                "likes": like_count,   
                "created_at": str(post.created_at)
            })
        return result, 200
    
    @jwt_required()
    def post(self):
        data = request.get_json()
        current_user = get_jwt_identity()
        if not data:
            return {"message": "Data is missing"}, 400

        if 'title' not in data or 'content' not in data:
            return {"message": "title or content missing"}, 400

        post = Post(
            title=data['title'],
            content=data['content'],
            user_id=current_user,
        )

        db.session.add(post)
        db.session.commit()

        return {"message": "Post created successfully"}, 201


class PostDetail(Resource):
    def get(self, post_id):
        post = Post.query.get(post_id)

        if not post:
            return {"message": "Post not found"}, 404

        like_count = Like.query.filter_by(post_id=post.id).count()

        return {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "user_id": post.user_id,
            "user_name": post.author.name,
            "likes": like_count,  
            "created_at": str(post.created_at)
        }, 200
    

    @jwt_required()
    def put(self, post_id):
        current_user_id = get_jwt_identity()
        post = Post.query.get(post_id)

        if not post:
            return {"message": "Post not found"}, 404

        if post.user_id != int(current_user_id):
            return {"message": "You can only edit your own posts"}, 403

        data = request.get_json()

        if not data:
            return {"message": "No data provided"}, 400
        
        if "title" in data:
            post.title = data["title"]

        if "content" in data:
            post.content = data["content"]

        db.session.commit()

        return {"message": "Post updated successfully"}, 200
    

    @jwt_required()
    def delete(self, post_id):
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        post = Post.query.get(post_id)

        if not post:
            return {"message": "Post not found"}, 404

        if post.user_id != int(current_user_id) and claims.get("role") != "admin":
            return {"message": "Not authorized to delete this post"}, 403
        
        db.session.delete(post)
        db.session.commit()

        return {"message": "Post deleted successfully"}, 200