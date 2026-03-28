from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token
from app import db, bcrypt
from app.models import User
from app.utils.response import error_response,success_response

class AuthRegister(Resource):
    def post(self):
        data = request.get_json()
        if not data or not all(k in data for k in('name','email','password')):
            return error_response("Name, email and password are required", 400)
        if User.query.filter_by(email = data['email']).first():
            return error_response("Email already registered",409)
        
        hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        user=User(
            name = data['name'],
            email = data['email'],
            password = hashed_pw,
            role = data.get('role','user')
        )
        db.session.add(user)
        db.session.commit()
        return success_response(user.to_dict(), "User registered successfully", 201)
