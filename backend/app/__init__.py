from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    db.init_app(app)
    cors_origins = app.config.get('CORS_ORIGINS', '*').split(',')
    CORS(app, origins=[o.strip() for o in cors_origins])
    from app.routes.products  import products_bp
    from app.routes.customers import customers_bp
    from app.routes.orders    import orders_bp
    from app.routes.dashboard import dashboard_bp
    app.register_blueprint(products_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(dashboard_bp)
    try:
        with app.app_context():
            db.create_all()
    except Exception:
        pass
    @app.route('/')
    def index():
        return {'status': 'ok', 'message': 'Inventory & Order Management API is running'}, 200
    @app.route('/health')
    def health_check():
        return {'status': 'ok', 'message': 'API is running'}, 200
    return app
