from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt
from app.models.user import User
from app import db


class AdminUserList(Resource):
    @jwt_required()
    def get(self):
        """
        Get all users
        ---
        tags:
          - Admin
        security:
          - BearerAuth: []
        responses:
          200:
            description: List of all users
          403:
            description: Admin access required
        """
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Admin access required"}, 403
        users = User.query.all()
        result = []
        for user in users:
            result.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "created_at": str(user.created_at)
            })
        return result, 200

class AdminUserDelete(Resource):
    @jwt_required()
    def delete(self, user_id):
        """
        Delete a user
        ---
        tags:
          - Admin
        security:
          - BearerAuth: []
        parameters:
          - name: user_id
            in: path
            type: integer
            required: true
            description: ID of the user to delete
        responses:
          200:
            description: User deleted successfully
          403:
            description: Admin access required or Cannot delete admin
          404:
            description: User not found
        """
        claims = get_jwt()
        if claims.get("role") != "admin":
            return {"message": "Admin access required"}, 403
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404
        if user.role == 'admin':
            return {"message":"Admin can't be deleted"}, 403
        db.session.delete(user)
        db.session.commit()
        return {"message": "User deleted successfully"}, 200

