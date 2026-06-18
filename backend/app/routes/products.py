from flask import Blueprint, request, jsonify
from app import db
from app.models import Product
from sqlalchemy.exc import IntegrityError

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return jsonify([p.to_dict() for p in products]), 200

@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product.to_dict()), 200

@products_bp.route('/products', methods=['POST'])
def create_product():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 422
    if not data.get('name'):
        return jsonify({'error': 'Product name is required'}), 422
    if not data.get('sku'):
        return jsonify({'error': 'SKU is required'}), 422
    if data.get('price') is None:
        return jsonify({'error': 'Price is required'}), 422
    try:
        price = float(data['price'])
        stock = int(data.get('stock_quantity', 0))
    except (ValueError, TypeError):
        return jsonify({'error': 'Price and stock_quantity must be valid numbers'}), 422
    if price < 0:
        return jsonify({'error': 'Price cannot be negative'}), 422
    if stock < 0:
        return jsonify({'error': 'Stock quantity cannot be negative'}), 422
    existing = Product.query.filter_by(sku=data['sku'].strip().upper()).first()
    if existing:
        return jsonify({'error': f"A product with SKU '{data['sku']}' already exists"}), 409
    product = Product(
        name=data['name'].strip(),
        sku=data['sku'].strip().upper(),
        description=data.get('description', ''),
        price=price,
        stock_quantity=stock,
    )
    try:
        db.session.add(product)
        db.session.commit()
        return jsonify(product.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': f"A product with SKU '{data['sku']}' already exists"}), 409
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500

@products_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 422
    if 'sku' in data and data['sku'].strip().upper() != product.sku:
        existing = Product.query.filter_by(sku=data['sku'].strip().upper()).first()
        if existing:
            return jsonify({'error': f"A product with SKU '{data['sku']}' already exists"}), 409
    if 'price' in data:
        try:
            price = float(data['price'])
            if price < 0:
                return jsonify({'error': 'Price cannot be negative'}), 422
            product.price = price
        except (ValueError, TypeError):
            return jsonify({'error': 'Price must be a valid number'}), 422
    if 'stock_quantity' in data:
        try:
            stock = int(data['stock_quantity'])
            if stock < 0:
                return jsonify({'error': 'Stock quantity cannot be negative'}), 422
            product.stock_quantity = stock
        except (ValueError, TypeError):
            return jsonify({'error': 'stock_quantity must be a valid number'}), 422
    if 'name' in data and data['name'].strip():
        product.name = data['name'].strip()
    if 'sku' in data:
        product.sku = data['sku'].strip().upper()
    if 'description' in data:
        product.description = data['description']
    try:
        db.session.commit()
        return jsonify(product.to_dict()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'SKU already exists'}), 409
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500

@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Could not delete product. It may be referenced in existing orders.'}), 500
