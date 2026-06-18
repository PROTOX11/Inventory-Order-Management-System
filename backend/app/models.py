from datetime import datetime
from app import db

class Product(db.Model):
    __tablename__ = 'products'
    id             = db.Column(db.Integer, primary_key=True)
    name           = db.Column(db.String(255), nullable=False)
    sku            = db.Column(db.String(100), unique=True, nullable=False)
    description    = db.Column(db.Text, nullable=True)
    price          = db.Column(db.Numeric(10, 2), nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    order_items    = db.relationship('OrderItem', backref='product', lazy=True)
    __table_args__ = (
        db.CheckConstraint('stock_quantity >= 0', name='check_stock_non_negative'),
        db.CheckConstraint('price >= 0',          name='check_price_non_negative'),
    )
    def to_dict(self):
        return {
            'id':             self.id,
            'name':           self.name,
            'sku':            self.sku,
            'description':    self.description,
            'price':          float(self.price),
            'stock_quantity': self.stock_quantity,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
            'updated_at':     self.updated_at.isoformat() if self.updated_at else None,
        }

class Customer(db.Model):
    __tablename__ = 'customers'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(255), nullable=False)
    email      = db.Column(db.String(255), unique=True, nullable=False)
    phone      = db.Column(db.String(50), nullable=False)
    address    = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    orders     = db.relationship('Order', backref='customer', lazy=True)
    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'email':      self.email,
            'phone':      self.phone,
            'address':    self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Order(db.Model):
    __tablename__ = 'orders'
    id           = db.Column(db.Integer, primary_key=True)
    customer_id  = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    status       = db.Column(db.String(20), default='pending')
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    notes        = db.Column(db.Text, nullable=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    items        = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan', lazy=True)
    def to_dict(self):
        return {
            'id':            self.id,
            'customer_id':   self.customer_id,
            'customer_name': self.customer.name if self.customer else None,
            'status':        self.status,
            'total_amount':  float(self.total_amount),
            'notes':         self.notes,
            'created_at':    self.created_at.isoformat() if self.created_at else None,
            'updated_at':    self.updated_at.isoformat() if self.updated_at else None,
            'items':         [item.to_dict() for item in self.items],
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id         = db.Column(db.Integer, primary_key=True)
    order_id   = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity   = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    __table_args__ = (
        db.CheckConstraint('quantity > 0', name='check_quantity_positive'),
    )
    def to_dict(self):
        return {
            'id':           self.id,
            'order_id':     self.order_id,
            'product_id':   self.product_id,
            'product_name': self.product.name if self.product else None,
            'product_sku':  self.product.sku  if self.product else None,
            'quantity':     self.quantity,
            'unit_price':   float(self.unit_price),
            'subtotal':     float(self.unit_price) * self.quantity,
        }
