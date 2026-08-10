from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP

from app.extensions import db
from app.models import (
    Discount,
    MenuCategory,
    MenuItem,
    Order,
    OrderItem,
    Payment,
    Role,
    Table,
    TokenBlockList,
    User,
)


DEMO_USERNAME = "demo"
DEMO_PASSWORD = "restaurant-demo"


def reset_demo_data():
    """Delete application data and rebuild the intentionally public demo baseline."""
    for model in (
        Payment,
        OrderItem,
        Order,
        TokenBlockList,
        User,
        MenuItem,
        MenuCategory,
        Discount,
        Table,
        Role,
    ):
        db.session.query(model).delete(synchronize_session=False)

    seed_data()


def seed_data():
    print("Starting seed...")

    role_candidates = [
        Role(name="Admin", access_level=5),
        Role(name="Manager", access_level=4),
        Role(name="Chef", access_level=3),
        Role(name="Server", access_level=2),
        Role(name="Bartender", access_level=1),
    ]
    roles = []
    for candidate in role_candidates:
        role = Role.query.filter_by(name=candidate.name).first()
        if role is None:
            role = candidate
            db.session.add(role)
        else:
            role.access_level = candidate.access_level
        roles.append(role)
    db.session.flush()
    roles_by_name = {role.name: role for role in roles}

    category_candidates = [
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

    categories = []
    for candidate in category_candidates:
        category = MenuCategory.query.filter_by(name=candidate.name).first()
        if category is None:
            category = candidate
            db.session.add(category)
        categories.append(category)
    db.session.flush()
    categories_by_seed_id = {
        seed_id: category for seed_id, category in enumerate(categories, start=1)
    }

    table_candidates = [
        Table(number=1, capacity=6, location_x=1, location_y=1),
        Table(number=2, capacity=4, location_x=3, location_y=1),
        Table(number=3, capacity=4, location_x=5, location_y=1),
        Table(number=4, capacity=4, location_x=7, location_y=1),
        Table(number=5, capacity=4, location_x=1, location_y=3),
        Table(number=21, capacity=4, location_x=3, location_y=3),
        Table(number=22, capacity=4, location_x=5, location_y=3),
        Table(number=41, capacity=6, location_x=7, location_y=3),
        Table(number=42, capacity=4, location_x=2, location_y=4),
        Table(number=43, capacity=8, location_x=4, location_y=4),
        Table(number=44, capacity=8, location_x=6, location_y=4),
    ]

    occupied_locations = {
        (table.location_x, table.location_y)
        for table in Table.query.all()
        if table.location_x is not None and table.location_y is not None
    }
    tables = []
    for candidate in table_candidates:
        table = Table.query.filter_by(number=candidate.number).first()
        desired_location = (candidate.location_x, candidate.location_y)
        if table is None:
            table = candidate
            if desired_location in occupied_locations:
                table.location_x = None
                table.location_y = None
            else:
                occupied_locations.add(desired_location)
            db.session.add(table)
        elif (
            table.location_x is None or table.location_y is None
        ) and desired_location not in occupied_locations:
            table.location_x, table.location_y = desired_location
            occupied_locations.add(desired_location)
        tables.append(table)
    db.session.flush()
    tables_by_number = {table.number: table for table in tables}

    user_specs = [
        (DEMO_USERNAME, "Demo", "Server", "demo@example.invalid", "Server"),
    ]

    users_by_username = {}
    for username, first_name, last_name, email, role_name in user_specs:
        user = User.query.filter_by(username=username).first()
        if user is None:
            user = User(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                role=roles_by_name[role_name],
                password_hash=DEMO_PASSWORD,
            )
            db.session.add(user)
        else:
            user.role = roles_by_name[role_name]
        users_by_username[username] = user
    db.session.flush()

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

    menu_items_by_name = {
        item.name: item
        for item in MenuItem.query.filter(
            MenuItem.name.in_([candidate.name for candidate in menu_items])
        )
    }
    for item in menu_items:
        existing_item = menu_items_by_name.get(item.name)
        if existing_item is None:
            item.menu_category = categories_by_seed_id[item.category_id]
            db.session.add(item)
            menu_items_by_name[item.name] = item
    db.session.flush()

    if Order.query.first() is None:
        tax_rate = Decimal("0.08875")

        def order_total(lines):
            subtotal = sum(
                (
                    Decimal(str(menu_items_by_name[name].price)) * quantity
                    for name, quantity in lines
                ),
                Decimal("0.00"),
            )
            return (subtotal * (Decimal("1.00") + tax_rate)).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )

        now = datetime.now(timezone.utc)
        open_lines = [("Bulgogi Pancake", 1), ("Coca Cola", 2)]
        open_order = Order(
            status="open",
            type="dine_in",
            guests=3,
            total_price=order_total(open_lines),
            sales_tax=tax_rate,
            created_at=now - timedelta(minutes=35),
            user=users_by_username[DEMO_USERNAME],
            table=tables_by_number[2],
        )
        open_order.order_items = [
            OrderItem(
                quantity=quantity,
                price=menu_items_by_name[name].price,
                menu_item=menu_items_by_name[name],
            )
            for name, quantity in open_lines
        ]

        closed_lines = [("Fried Dumpling", 2), ("Sprite", 2)]
        closed_total = order_total(closed_lines)
        closed_order = Order(
            status="closed",
            type="take_out",
            guests=1,
            total_price=closed_total,
            sales_tax=tax_rate,
            created_at=now - timedelta(hours=2),
            closed_at=now - timedelta(hours=1, minutes=40),
            user=users_by_username[DEMO_USERNAME],
        )
        closed_order.order_items = [
            OrderItem(
                quantity=quantity,
                price=menu_items_by_name[name].price,
                menu_item=menu_items_by_name[name],
            )
            for name, quantity in closed_lines
        ]
        closed_order.payments = [Payment(amount=closed_total, type="visa")]

        db.session.add_all([open_order, closed_order])

    db.session.commit()

    print("Seeding complete!")
