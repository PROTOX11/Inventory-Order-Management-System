from flask import Blueprint, request, jsonify
from app import db
from app.models import Order, OrderItem, Product, Customer

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200

@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify(order.to_dict()), 200

@orders_bp.route('/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 422
    if not data.get('customer_id'):
        return jsonify({'error': 'customer_id is required'}), 422
    if not data.get('items') or len(data['items']) == 0:
        return jsonify({'error': 'Order must have at least one item'}), 422
    customer = db.session.get(Customer, data['customer_id'])
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    for i, item in enumerate(data['items']):
        if not item.get('product_id'):
            return jsonify({'error': f'Item {i + 1}: product_id is required'}), 422
        if not item.get('quantity'):
            return jsonify({'error': f'Item {i + 1}: quantity is required'}), 422
        try:
            qty = int(item['quantity'])
        except (ValueError, TypeError):
            return jsonify({'error': f'Item {i + 1}: quantity must be a number'}), 422
        if qty <= 0:
            return jsonify({'error': f'Item {i + 1}: quantity must be greater than 0'}), 422
        product = db.session.get(Product, item['product_id'])
        if not product:
            return jsonify({'error': f'Product with ID {item["product_id"]} not found'}), 404
        if product.stock_quantity < qty:
            return jsonify({
                'error': (
                    f"Not enough stock for '{product.name}' (SKU: {product.sku}). "
                    f"Available: {product.stock_quantity}, Requested: {qty}"
                )
            }), 400
    try:
        total = 0.0
        order = Order(
            customer_id=data['customer_id'],
            notes=data.get('notes', ''),
            status='pending',
            total_amount=0,
        )
        db.session.add(order)
        db.session.flush()
        for item in data['items']:
            product  = db.session.get(Product, item['product_id'])
            qty      = int(item['quantity'])
            subtotal = float(product.price) * qty
            total   += subtotal
            db.session.add(OrderItem(
                order_id=order.id,
                product_id=item['product_id'],
                quantity=qty,
                unit_price=product.price,
            ))
            product.stock_quantity -= qty
        order.total_amount = round(total, 2)
        db.session.commit()
        db.session.refresh(order)
        return jsonify(order.to_dict()), 201
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to create order. Please try again.'}), 500

@orders_bp.route('/orders/<int:order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    data = request.get_json()
    if not data or not data.get('status'):
        return jsonify({'error': 'status field is required'}), 422
    allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    new_status = data['status'].lower()
    if new_status not in allowed:
        return jsonify({'error': f"Invalid status. Must be one of: {', '.join(allowed)}"}), 422
    order.status = new_status
    db.session.commit()
    return jsonify(order.to_dict()), 200

@orders_bp.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    try:
        if order.status not in ('delivered', 'shipped'):
            for item in order.items:
                product = db.session.get(Product, item.product_id)
                if product:
                    product.stock_quantity += item.quantity
        db.session.delete(order)
        db.session.commit()
        if order.status == 'delivered':
            return jsonify({'message': 'Order history deleted successfully'}), 200
        return jsonify({'message': 'Order cancelled and stock has been restored'}), 200
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete order. Please try again.'}), 500
