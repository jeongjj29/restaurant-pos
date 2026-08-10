import os

import click
from flask import current_app
from flask.cli import with_appcontext

from app import create_app
from app.extensions import db

CANONICAL_ROLES = (
    ("Admin", 5),
    ("Manager", 4),
    ("Chef", 3),
    ("Server", 2),
    ("Bartender", 1),
)
DEMO_RESET_CONFIRMATION = "reset-restaurant-pos-demo"


def _ensure_canonical_roles(role_model):
    canonical_names = [name for name, _ in CANONICAL_ROLES]
    roles_by_name = {
        role.name: role
        for role in role_model.query.filter(role_model.name.in_(canonical_names)).all()
    }

    for name, access_level in CANONICAL_ROLES:
        role = roles_by_name.get(name)
        if role is None:
            role = role_model(name=name, access_level=access_level)
            db.session.add(role)
            roles_by_name[name] = role
        elif name == "Admin" and role.access_level != access_level:
            role.access_level = access_level

    db.session.flush()
    return roles_by_name


def _is_safe_drop_environment() -> bool:
    return bool(
        current_app.config.get("TESTING")
        or current_app.debug
        or current_app.config.get("ENVIRONMENT") in {"development", "testing"}
    )


@click.command("seed", help="Seed the database with sample data.")
@with_appcontext
def seed():
    if current_app.config.get("ENVIRONMENT") == "production" and not (
        current_app.config.get("ALLOW_DEMO_SEED")
    ):
        raise click.ClickException(
            "Demo seeding is disabled in production. "
            "Set ALLOW_DEMO_SEED=true only for an intentional demo environment."
        )

    from seed import seed_data

    seed_data()
    click.echo("Seeded the database.")


@click.command("reset-demo", help="Destructively restore the public demo baseline.")
@click.option(
    "--confirm",
    required=True,
    help=f"Required safety phrase: {DEMO_RESET_CONFIRMATION}",
)
@with_appcontext
def reset_demo(confirm):
    if confirm != DEMO_RESET_CONFIRMATION:
        raise click.ClickException("Demo reset confirmation did not match.")

    if current_app.config.get("ENVIRONMENT") == "production" and not (
        current_app.config.get("ALLOW_DEMO_RESET")
    ):
        raise click.ClickException(
            "Demo reset is disabled in production. Temporarily set "
            "ALLOW_DEMO_RESET=true only while performing an intentional reset."
        )

    from seed import reset_demo_data

    reset_demo_data()
    click.echo("Reset the demo database to its seeded baseline.")


@click.command("create-admin", help="Create the initial production administrator.")
@click.option("--username", envvar="ADMIN_USERNAME", prompt=True)
@click.option("--email", envvar="ADMIN_EMAIL", prompt=True)
@click.option("--first-name", envvar="ADMIN_FIRST_NAME", default="System")
@click.option("--last-name", envvar="ADMIN_LAST_NAME", default="Administrator")
@click.option(
    "--password",
    envvar="ADMIN_PASSWORD",
    prompt=True,
    hide_input=True,
    confirmation_prompt=True,
)
@with_appcontext
def create_admin(username, email, first_name, last_name, password):
    from app.models import Role, User

    username = username.strip()
    email = email.strip().lower()
    minimum_length = current_app.config["MIN_PASSWORD_LENGTH"]

    if len(password) < minimum_length:
        raise click.ClickException(
            f"Password must be at least {minimum_length} characters long."
        )

    username_owner = User.query.filter_by(username=username).first()
    email_owner = User.query.filter(db.func.lower(User.email) == email).first()
    existing_user = username_owner or email_owner
    existing_user_has_admin_role = bool(
        existing_user and existing_user.role and existing_user.role.name == "Admin"
    )
    exact_existing_admin = bool(
        username_owner is not None
        and username_owner is email_owner
        and existing_user_has_admin_role
    )

    if (username_owner is not None or email_owner is not None) and not (
        exact_existing_admin
    ):
        raise click.ClickException(
            "Cannot create administrator: the requested username or email is "
            "already assigned to a non-administrator or a different account."
        )

    roles_by_name = _ensure_canonical_roles(Role)
    role = roles_by_name["Admin"]

    if exact_existing_admin:
        db.session.commit()
        click.echo(f"Administrator '{existing_user.username}' already exists.")
        return

    user = User(
        username=username,
        first_name=first_name.strip(),
        last_name=last_name.strip(),
        email=email,
        role=role,
        password_hash=password,
    )
    db.session.add(user)
    db.session.commit()
    click.echo(f"Created administrator '{username}'.")


@click.command("dropdb", help="Drop all tables (allowed only in development/testing).")
@click.option("--yes", is_flag=True, help="Skip interactive confirmation prompt.")
@with_appcontext
def dropdb(yes):
    if not _is_safe_drop_environment():
        raise click.ClickException(
            "Unsafe environment. dropdb is only allowed in development/testing."
        )

    db_uri = current_app.config.get("SQLALCHEMY_DATABASE_URI", "unknown")
    if not yes and not click.confirm(
        f"Drop all tables for database '{db_uri}'?", default=False
    ):
        click.echo("Aborted.")
        return

    db.drop_all()
    click.echo("Dropped all tables.")


def register_cli_commands(flask_app):
    flask_app.cli.add_command(seed)
    flask_app.cli.add_command(reset_demo)
    flask_app.cli.add_command(create_admin)
    flask_app.cli.add_command(dropdb)


app = create_app()
register_cli_commands(app)


if __name__ == "__main__":
    app.run(port=int(os.getenv("PORT", "5555")))
