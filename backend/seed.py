import os
import sys
from decimal import Decimal

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app import create_app, db
from app.models import Product, Customer, Order, OrderItem

def seed_database():
    app = create_app()
    with app.app_context():
        print("Cleaning up existing data...")
        db.session.query(OrderItem).delete()
        db.session.query(Order).delete()
        db.session.query(Customer).delete()
        db.session.query(Product).delete()
        db.session.commit()

        print("Adding sample products...")
        products = [
            Product(
                name="iPhone 15 Pro",
                sku="IPHONE15PRO-256",
                description="Apple iPhone 15 Pro with 256GB storage, Titanium design.",
                price=Decimal("129900.00"),
                stock_quantity=45
            ),
            Product(
                name="MacBook Air M3",
                sku="MBAIR-M3-16GB",
                description="Apple MacBook Air 13-inch with M3 chip, 16GB Unified Memory, 512GB SSD.",
                price=Decimal("114900.00"),
                stock_quantity=20
            ),
            Product(
                name="Sony WH-1000XM5",
                sku="SONY-WH1000XM5-B",
                description="Sony wireless noise-cancelling over-ear headphones, black.",
                price=Decimal("29990.00"),
                stock_quantity=75
            ),
            Product(
                name="iPad Pro 11-inch",
                sku="IPADPRO11-M4",
                description="Apple iPad Pro 11-inch with M4 chip, OLED display, 256GB Wi-Fi.",
                price=Decimal("99900.00"),
                stock_quantity=15
            ),
            Product(
                name="Keychron K2 Keyboard",
                sku="KEYCHRON-K2-V2",
                description="Keychron K2 wireless mechanical keyboard with Gateron brown switches.",
                price=Decimal("7499.00"),
                stock_quantity=120
            )
        ]
        db.session.add_all(products)
        db.session.commit()

        print("Adding sample customers...")
        customers = [
            Customer(
                name="Aarav Sharma",
                email="aarav.sharma@example.com",
                phone="9876543210",
                address="12, MG Road, Bengaluru, Karnataka - 560001"
            ),
            Customer(
                name="Diya Patel",
                email="diya.patel@example.com",
                phone="9123456789",
                address="B-402, Shanti Heights, Vastrapur, Ahmedabad, Gujarat - 380015"
            ),
            Customer(
                name="Rohan Verma",
                email="rohan.verma@example.com",
                phone="8888877777",
                address="Flat 201, Green Meadows, Sector 45, Gurgaon, Haryana - 122003"
            )
        ]
        db.session.add_all(customers)
        db.session.commit()

        print("Adding sample orders...")
        order1 = Order(
            customer_id=customers[0].id,
            status="delivered",
            total_amount=Decimal("137399.00"),
            notes="Please pack carefully. Leave at the front desk if not available."
        )
        db.session.add(order1)
        db.session.commit()

        item1 = OrderItem(
            order_id=order1.id,
            product_id=products[0].id,
            quantity=1,
            unit_price=products[0].price
        )
        item2 = OrderItem(
            order_id=order1.id,
            product_id=products[4].id,
            quantity=1,
            unit_price=products[4].price
        )
        db.session.add_all([item1, item2])

        order2 = Order(
            customer_id=customers[1].id,
            status="pending",
            total_amount=Decimal("59980.00"),
            notes="Gift wrap if possible."
        )
        db.session.add(order2)
        db.session.commit()

        item3 = OrderItem(
            order_id=order2.id,
            product_id=products[2].id,
            quantity=2,
            unit_price=products[2].price
        )
        db.session.add(item3)

        db.session.commit()
        print("Database successfully seeded with demo data!")

if __name__ == "__main__":
    seed_database()
