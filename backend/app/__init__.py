from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flasgger import Swagger
from app.config import Config
from flask_restful import Api

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    Swagger(app)

    api = Api(app)

    from app.routes.auth import AuthRegister
    from app.routes.auth import AuthLogin
    from app.routes.posts import PostList
    from app.routes.posts import PostDetail
    from app.routes.comments import CommentList
    from app.routes.comments import CommentDetail
    from app.routes.admin import AdminUserList
    from app.routes.admin import AdminUserDelete
    from app.routes.user import UserProfile
    from app.routes.likes import PostLike

    from app.models.user import User
    from app.models.post import Post
    from app.models.comment import Comment

    api.add_resource(AuthRegister, '/api/v1/auth/register')
    api.add_resource(AuthLogin, '/api/v1/auth/login')
    api.add_resource(PostList,'/api/v1/posts')
    api.add_resource(PostDetail,'/api/v1/posts/<post_id>')
    api.add_resource(CommentList,'/api/v1/comments/<post_id>')
    api.add_resource(CommentDetail,'/api/v1/comments/<comment_id>')
    api.add_resource(AdminUserList,'/api/v1/admin/users')
    api.add_resource(AdminUserDelete,'/api/v1/admin/users/<user_id>')
    api.add_resource(UserProfile,'/api/v1/user')
    api.add_resource(PostLike,'/api/v1/posts/<post_id>/like')

    return app