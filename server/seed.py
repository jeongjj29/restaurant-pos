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
                name="Garlic Butter Squid",
                secondary_name="오징어버터구이",
                price=21.0,
                category_id=1,
            ),
            MenuItem(
                name="Bulgogi Pancake",
                secondary_name="불고기파전",
                price=23.0,
                category_id=1,
            ),
            MenuItem(
                name="Seafood Pancake",
                secondary_name="해물파전",
                price=20.0,
                category_id=1,
            ),
            MenuItem(
                name="Kimchi Pancake",
                secondary_name="김치전",
                price=20.0,
                category_id=1,
            ),
            MenuItem(
                name="Japchae",
                secondary_name="잡채",
                price=18.0,
                category_id=1,
            ),
            MenuItem(
                name="Fried Dumpling",
                secondary_name="군만두",
                price=10.0,
                category_id=1,
            ),
            MenuItem(
                name="Takoyaki",
                secondary_name="타코야끼",
                price=10.0,
                category_id=1,
            ),
            MenuItem(
                name="Ddukbokki",
                secondary_name="떡볶이",
                price=14.0,
                category_id=1,
            ),
            MenuItem(
                name="Cheese Ddukbokki",
                secondary_name="치즈떡볶이",
                price=16.0,
                category_id=1,
            ),
            MenuItem(
                name="Rosé Ddukbokki",
                secondary_name="로제떡볶이",
                price=18.0,
                category_id=1,
            ),
            MenuItem(
                name="Corn Cheese",
                secondary_name="콘치즈",
                price=12.0,
                category_id=1,
            ),
            MenuItem(
                name="Outside Skirt Steak",
                secondary_name="안창살",
                price=45.0,
                category_id=2,
            ),
            MenuItem(
                name="Prime Ribeye Steak",
                secondary_name="꽃등심",
                price=45.0,
                category_id=2,
            ),
            MenuItem(
                name="Prime Short Rib",
                secondary_name="생갈비",
                price=45.0,
                category_id=2,
            ),
            MenuItem(
                name="Marinated Short Rib",
                secondary_name="양념갈비",
                price=45.0,
                category_id=2,
            ),
            MenuItem(
                name="Thinly Sliced Brisket",
                secondary_name="차돌바기",
                price=37.0,
                category_id=2,
            ),
            MenuItem(
                name="Bulgogi",
                secondary_name="불고기",
                price=30.0,
                category_id=2,
            ),
            MenuItem(
                name="Pork Belly",
                secondary_name="삼겹살",
                price=30.0,
                category_id=2,
            ),
            MenuItem(
                name="Boston Butt",
                secondary_name="돼지목살",
                price=25.0,
                category_id=2,
            ),
            MenuItem(
                name="Pork Jowl",
                secondary_name="항정살",
                price=30.0,
                category_id=2,
            ),
            MenuItem(
                name="Seafood Stir-Fry",
                secondary_name="해물찜",
                price=50.0,
                category_id=3,
            ),
            MenuItem(
                name="Monkfish Stir-Fry",
                secondary_name="아구찜",
                price=50.0,
                category_id=3,
            ),
            MenuItem(
                name="Squid & Pork Stir-Fry",
                secondary_name="오삼이볶음",
                price=35.0,
                category_id=3,
            ),
            MenuItem(
                name="Octopus & Pork Stir-Fry",
                secondary_name="쭈삼이볶음",
                price=35.0,
                category_id=3,
            ),
            MenuItem(
                name="Spicy Pork Stir-Fry",
                secondary_name="제육볶음",
                price=30.0,
                category_id=3,
            ),
            MenuItem(
                name="Spicy Chicken w. Cheese",
                secondary_name="치즈불닭",
                price=30.0,
                category_id=3,
            ),
            MenuItem(
                name="Kimchi & Pork Stir-Fry w. Tofu",
                secondary_name="돼지두부김치",
                price=35.0,
                category_id=3,
            ),
            MenuItem(
                name="Seafood Cream Udon",
                secondary_name="해물크림우동",
                price=25.0,
                category_id=3,
            ),
            MenuItem(
                name="Nengchae Jokbal",
                secondary_name="냉채족발",
                price=30.0,
                category_id=4,
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
                name="Steamed Shellfish",
                secondary_name="조개찜",
                price=60.0,
                category_id=5,
            ),
            MenuItem(
                name="Seafood Jjampong",
                secondary_name="해물짬뽕탕",
                price=35.0,
                category_id=6,
            ),
            MenuItem(
                name="Boodae Jeongol",
                secondary_name="부대전골",
                price=35.0,
                category_id=6,
            ),
            MenuItem(
                name="Gopchang Jeongol",
                secondary_name="곱창전골",
                price=35.0,
                category_id=6,
            ),
            MenuItem(
                name="Seafood Nurungji",
                secondary_name="해물누룽지탕",
                price=35.0,
                category_id=6,
            ),
            MenuItem(
                name="Clam Soup",
                secondary_name="조개탕",
                price=25.0,
                category_id=6,
            ),
            MenuItem(
                name="Odeng Tang",
                secondary_name="오뎅탕",
                price=25.0,
                category_id=6,
            ),
            MenuItem(
                name="Fried Rice",
                secondary_name="볶음밥",
                price=15.0,
                category_id=7,
            ),
            MenuItem(
                name="Kimchi Jjigae",
                secondary_name="김치찌개",
                price=15.0,
                category_id=7,
            ),
            MenuItem(
                name="Doenjang Jjigae",
                secondary_name="된장찌개",
                price=15.0,
                category_id=7,
            ),
            MenuItem(
                name="Soondubu Jjigae",
                secondary_name="순두부찌개",
                price=15.0,
                category_id=7,
            ),
            MenuItem(
                name="Sullungtang",
                secondary_name="설렁탕",
                price=16.0,
                category_id=7,
            ),
            MenuItem(
                name="Bulgogi Dupbab",
                secondary_name="불고기덮밥",
                price=15.0,
                category_id=7,
            ),
            MenuItem(
                name="Jeyook Dupbab",
                secondary_name="제육덮밥",
                price=15.0,
                category_id=7,
            ),
            MenuItem(
                name="Yukgaejang",
                secondary_name="육개장",
                price=16.0,
                category_id=7,
            ),
            MenuItem(
                name="Samgyetang",
                secondary_name="삼계탕",
                price=23.0,
                category_id=7,
            ),
            MenuItem(
                name="Naengmyun",
                secondary_name="물냉면",
                price=15.0,
                category_id=7,
            ),
            MenuItem(
                name="Bibim Naengmyun",
                secondary_name="비빔냉면",
                price=16.0,
                category_id=7,
            ),
            MenuItem(
                name="Coca Cola",
                price=3.0,
                category_id=8,
            ),
            MenuItem(
                name="Diet Coke",
                price=3.0,
                category_id=8,
            ),
            MenuItem(
                name="Sprite",
                price=3.0,
                category_id=8,
            ),
            MenuItem(
                name="Ginger Ale",
                price=3.0,
                category_id=8,
            ),
            MenuItem(
                name="Seltzer",
                price=3.0,
                category_id=8,
            ),
            MenuItem(
                name="Watermelon Juice",
                price=7.0,
                category_id=8,
            ),
            MenuItem(
                name="Chamisul Fresh",
                secondary_name="참이슬",
                price=14.0,
                category_id=9,
            ),
            MenuItem(
                name="Jinro",
                secondary_name="진로이즈벡",
                price=14.0,
                category_id=9,
            ),
            MenuItem(
                name="Grapefruit Soju",
                secondary_name="자몽에이슬",
                price=14.0,
                category_id=9,
            ),
            MenuItem(
                name="Green Grape Soju",
                secondary_name="청포도에이슬",
                price=14.0,
                category_id=9,
            ),
            MenuItem(
                name="Green Apple Soju",
                secondary_name="사과순하리",
                price=14.0,
                category_id=9,
            ),
            MenuItem(
                name="Peach Soju",
                secondary_name="복숭아순하리",
                price=14.0,
                category_id=9,
            ),
            MenuItem(
                name="Watermelon Soju",
                secondary_name="수박통소주",
                price=35.0,
                category_id=10,
            ),
            MenuItem(
                name="Lychee Soju",
                secondary_name="리치소주",
                price=30.0,
                category_id=10,
            ),
            MenuItem(
                name="Hongcho Soju",
                secondary_name="홍초소주",
                price=30.0,
                category_id=10,
            ),
            MenuItem(
                name="Makgeolli",
                secondary_name="막걸리",
                price=14.0,
                category_id=11,
            ),
            MenuItem(
                name="Bokbunja",
                secondary_name="복분자",
                price=17.0,
                category_id=11,
            ),
            MenuItem(
                name="Seoljoongmae",
                secondary_name="설중매",
                price=17.0,
                category_id=11,
            ),
            MenuItem(
                name="Coors Light",
                price=8.0,
                category_id=12,
            ),
            MenuItem(
                name="Sapporo",
                price=8.0,
                category_id=12,
            ),
            MenuItem(
                name="Corona",
                price=8.0,
                category_id=12,
            ),
            MenuItem(
                name="Terra",
                price=8.0,
                category_id=12,
            ),
            MenuItem(
                name="Kloud",
                price=12.0,
                category_id=12,
            ),
        ]

        db.session.add_all(menu_items)
        db.session.commit()

        print("Seeding complete!")
