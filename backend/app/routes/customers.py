from flask import Blueprint, request, jsonify
from app import db
from app.models import Customer
from sqlalchemy.exc import IntegrityError

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/customers', methods=['GET'])
def get_customers():
    customers = Customer.query.order_by(Customer.created_at.desc()).all()
    return jsonify([c.to_dict() for c in customers]), 200

@customers_bp.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    customer = db.session.get(Customer, customer_id)
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    return jsonify(customer.to_dict()), 200

@customers_bp.route('/customers', methods=['POST'])
def create_customer():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 422
    if not data.get('name'):
        return jsonify({'error': 'Name is required'}), 422
    if not data.get('email'):
        return jsonify({'error': 'Email is required'}), 422
    if not data.get('phone'):
        return jsonify({'error': 'Phone number is required'}), 422
    if '@' not in data['email'] or '.' not in data['email']:
        return jsonify({'error': 'Please provide a valid email address'}), 422
    email = data['email'].strip().lower()
    existing = Customer.query.filter_by(email=email).first()
    if existing:
        return jsonify({'error': f"A customer with email '{data['email']}' already exists"}), 409
    customer = Customer(
        name=data['name'].strip(),
        email=email,
        phone=data['phone'].strip(),
        address=data.get('address', ''),
    )
    try:
        db.session.add(customer)
        db.session.commit()
        return jsonify(customer.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': f"A customer with email '{data['email']}' already exists"}), 409
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500

@customers_bp.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    customer = db.session.get(Customer, customer_id)
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    try:
        db.session.delete(customer)
        db.session.commit()
        return jsonify({'message': 'Customer deleted successfully'}), 200
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Could not delete customer. They may have existing orders.'}), 500
