from flask import Blueprint, jsonify
from app import db
from app.models import Product, Customer, Order

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/stats', methods=['GET'])
def get_stats():
    total_products  = Product.query.count()
    total_customers = Customer.query.count()
    total_orders    = Order.query.count()
    revenue_result  = db.session.query(db.func.sum(Order.total_amount)).scalar()
    total_revenue   = float(revenue_result) if revenue_result else 0.0
    low_stock_products = (
        Product.query
        .filter(Product.stock_quantity < 10)
        .order_by(Product.stock_quantity.asc())
        .all()
    )
    return jsonify({
        'total_products':     total_products,
        'total_customers':    total_customers,
        'total_orders':       total_orders,
        'total_revenue':      total_revenue,
        'low_stock_products': [p.to_dict() for p in low_stock_products],
    }), 200
