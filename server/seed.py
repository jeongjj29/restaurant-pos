#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import (
    db,
    Role,
    User,
    MenuItem,
    Order,
    OrderItem,
    Table,
    MenuCategory,
    Payment,
    Discount,
)

if __name__ == "__main__":
    fake = Faker()
    with app.app_context():
        print("Starting seed...")

        db.drop_all()
        db.create_all()

        roles = [
            Role(name="owner", access_level=4),
            Role(name="general manager", access_level=3),
            Role(name="server", access_level=2),
            Role(name="cook", access_level=1),
        ]
        db.session.add_all(roles)
        db.session.commit()

        categories = [
            MenuCategory(name="Starters"),
            MenuCategory(name="Korean BBQ"),
            MenuCategory(name="Stir-Fry"),
            MenuCategory(name="Chef Special"),
            MenuCategory(name="Signature"),
            MenuCategory(name="Soup"),
            MenuCategory(name="Individual Meal"),
            MenuCategory(name="Beverage"),
            MenuCategory(name="Soju"),
            MenuCategory(name="Soju Cocktail"),
            MenuCategory(name="Korean Wine"),
            MenuCategory(name="Beer"),
        ]

        db.session.add_all(categories)
        db.session.commit()

        tables = [
            Table(number=1, capacity=6, location_x=1, location_y=1),
            Table(number=2, capacity=4),
            Table(number=3, capacity=4),
            Table(number=4, capacity=4),
            Table(number=5, capacity=4),
            Table(number=21, capacity=4),
            Table(number=22, capacity=4),
            Table(number=41, capacity=6),
            Table(number=42, capacity=4),
            Table(number=43, capacity=8),
            Table(number=44, capacity=8),
        ]

        db.session.add_all(tables)
        db.session.commit()

        users = [
            User(
                username="admin",
                first_name="Admin",
                last_name="Admin",
                email="admin@me.com",
                role_id=1,
                password_hash="password",
            ),
            User(
                username="manager",
                first_name="Manager",
                last_name="Manager",
                email="manager@me.com",
                role_id=2,
                password_hash="password",
            ),
            User(
                username="waiter",
                first_name="Waiter",
                last_name="Waiter",
                email="waiter@me.com",
                role_id=3,
                password_hash="password",
            ),
        ]

        db.session.add_all(users)
        db.session.commit()

        menu_items = [
            MenuItem(
                name="Seafood Pancake",
                secondary_name="해물파전",
                price=20.0,
                category_id=1,
            ),
            MenuItem(
                name="Prime Ribeye Steak",
                secondary_name="꽃등심",
                price=45.0,
                category_id=2,
            ),
            MenuItem(
                name="Seafood Stir-Fry",
                secondary_name="해물찜",
                price=50.0,
                category_id=3,
            ),
            MenuItem(
                name="Steamed Pork Belly",
                secondary_name="간장수육",
                price=30.0,
                category_id=4,
            ),
            MenuItem(
                name="Empire Seafood Hotpot",
                secondary_name="용궁전골",
                price=99.0,
                category_id=5,
            ),
            MenuItem(
                name="Seafood Jjampong",
                secondary_name="해물짬뽕탕",
                price=35.0,
                category_id=6,
            ),
            MenuItem(
                name="Kimchi Jjigae",
                secondary_name="김치찌개",
                price=15.0,
                category_id=7,
            ),
        ]

        print("Seeding complete!")
