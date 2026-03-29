from flask_restful import Resource
from app.models import User,Post
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

class UserProfile(Resource):
    @jwt_required()
    def get(self):
        """
        Get current user profile
        ---
        tags:
          - User Profile
        security:
          - BearerAuth: []
        responses:
          200:
            description: User profile and posts
          401:
            description: Unauthorized
        """
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        posts = Post.query.filter_by(user_id = current_user_id)
        result = []
        postlist=[]
        for post in posts:
            comments_list = []
            for comment in post.comments:
                comments_list.append({
                    "id": comment.id,
                    "content": comment.content,
                    "user_id": comment.user_id,
                    "created_at": comment.created_at.isoformat()
                })
            postlist.append({
                'title': post.title,
                'content': post.content,
                'comments': comments_list,
                'created_at': post.created_at.isoformat()
            })
        result.append({
            'name':user.name,
            'email':user.email,
            'role':user.role,
            'posts':postlist
        })
        return result,200   


