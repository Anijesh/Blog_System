from functools import wraps
from flask_jwt_extended import jwt_required,get_jwt_identity
from app.models import User
from app.utils.response import success_response,error_response

def role_required(role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or user.role != role:
                return error_response("Access forbidden: Admins only", 403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator