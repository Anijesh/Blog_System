from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.post import Post
from app.models.user import User
from app.models.like import Like
from app.models import Comment
from app import db

class PostList(Resource):
    def get(self):
        """
        Get all posts
        ---
        tags:
          - Posts
        responses:
          200:
            description: List of posts
        """
        posts = Post.query.all()
        result = []
        for post in posts:
            like_count = Like.query.filter_by(post_id=post.id).count()
            comment_count = Comment.query.filter_by(post_id=post.id).count()

            result.append({
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "user_id": post.user_id,
                "user_name": post.author.name,
                "likes": like_count,   
                "comments_count": comment_count,
                "created_at": str(post.created_at)
            })
        return result, 200
    
    @jwt_required()
    def post(self):
        """
        Create a new post
        ---
        tags:
          - Posts
        security:
          - BearerAuth: []
        parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              properties:
                title:
                  type: string
                content:
                  type: string
        responses:
          201:
            description: Post created successfully
          400:
            description: Data is missing or incomplete
        """
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
        """
        Get details of a specific post
        ---
        tags:
          - Posts
        parameters:
          - name: post_id
            in: path
            type: integer
            required: true
            description: ID of the post
        responses:
          200:
            description: Post details
          404:
            description: Post not found
        """
        post = Post.query.get(post_id)

        if not post:
            return {"message": "Post not found"}, 404

        like_count = Like.query.filter_by(post_id=post.id).count()
        comment_count = Comment.query.filter_by(post_id=post.id).count()

        return {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "user_id": post.user_id,
            "user_name": post.author.name,
            "likes": like_count,  
            "comments_count": comment_count,
            "created_at": str(post.created_at)
        }, 200
    

    @jwt_required()
    def put(self, post_id):
        """
        Update a post
        ---
        tags:
          - Posts
        security:
          - BearerAuth: []
        parameters:
          - name: post_id
            in: path
            type: integer
            required: true
            description: ID of the post
          - in: body
            name: body
            required: false
            schema:
              type: object
              properties:
                title:
                  type: string
                content:
                  type: string
        responses:
          200:
            description: Post updated successfully
          400:
            description: No data provided
          403:
            description: Only edit your own posts
          404:
            description: Post not found
        """
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
        """
        Delete a post
        ---
        tags:
          - Posts
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
            description: Post deleted successfully
          403:
            description: Not authorized to delete this post
          404:
            description: Post not found
        """
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