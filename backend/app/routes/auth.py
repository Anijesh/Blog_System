from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token
from app import db, bcrypt
from app.models.user import User

class AuthRegister(Resource):
    def post(self):
        """
        Register a new user
        ---
        tags:
          - Authentication
        parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
                password:
                  type: string
        responses:
          201:
            description: User registered successfully
          400:
            description: No data provided
          409:
            description: Email already registered
        """
        data = request.get_json()

        if not data:
            return {"message": "No data provided"}, 400
        
        existing_user = User.query.filter_by(email=data["email"]).first()
        if existing_user:
            return {"message": "Email already registered"}, 409


        hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

        new_user = User(
            name=data["name"],
            email=data["email"],
            password=hashed_password,
            role=data.get("role", "user")  
        )

        db.session.add(new_user)
        db.session.commit()

        return {"message": "User registered successfully"}, 201


class AuthLogin(Resource):
    def post(self):
        """
        Login a user
        ---
        tags:
          - Authentication
        parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
        responses:
          200:
            description: Login successful
          400:
            description: No data provided
          401:
            description: Invalid email or password
        """
        data = request.get_json()

        if not data:
            return {"message": "No data provided"}, 400

        user = User.query.filter_by(email=data["email"]).first()

        if not user or not bcrypt.check_password_hash(user.password, data["password"]):
            return {"message": "Invalid email or password"}, 401

        token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )

        return {
            "message": "Login successful",
            "access_token": token,
            "user_id": user.id,
            "role": user.role
        }, 200