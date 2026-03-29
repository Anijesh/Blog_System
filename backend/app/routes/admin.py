from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt
from app.models.user import User
from app import db


class AdminUserList(Resource):
    @jwt_required()
    def get(self):
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

