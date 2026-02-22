import os

import click
from flask import current_app
from flask.cli import with_appcontext

from app import create_app
from app.extensions import db


def _is_safe_drop_environment() -> bool:
    env = os.getenv("FLASK_ENV", "").lower()
    return bool(
        current_app.config.get("TESTING")
        or current_app.debug
        or env in {"development", "testing"}
    )


@click.command("seed", help="Seed the database with sample data.")
@with_appcontext
def seed():
    from seed import seed_data

    seed_data()
    click.echo("Seeded the database.")


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
    flask_app.cli.add_command(dropdb)


app = create_app()
register_cli_commands(app)


if __name__ == "__main__":
    app.run()
