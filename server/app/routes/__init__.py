from .auth_routes import auth_bp
from .discount_routes import discount_bp
from .menu_category_routes import menu_category_bp
from .menu_item_routes import menu_item_bp
from .order_item_routes import order_item_bp
from .order_routes import order_bp
from .payment_routes import payment_bp
from .role_routes import role_bp
from .table_routes import table_bp
from .user_routes import user_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(discount_bp)
    app.register_blueprint(menu_category_bp)
    app.register_blueprint(menu_item_bp)
    app.register_blueprint(order_item_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(role_bp)
    app.register_blueprint(table_bp)
    app.register_blueprint(user_bp)