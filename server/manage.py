from app import create_app
from app.extensions import db
from flask.cli import with_appcontext
import click

app = create_app()

@click.command("seed")
@with_appcontext
def seed():
    from seed import seed_data  
    seed_data()
    click.echo("🌱 Seeded the database.")

@click.command("dropdb")
@with_appcontext
def dropdb():
    confirm = input("⚠️  Are you sure you want to DROP ALL TABLES? (y/N): ")
    if confirm.lower() == "y":
        db.drop_all()
        click.echo("💣 Dropped all tables.")
    else:
        click.echo("Aborted.")

app.cli.add_command(seed)
app.cli.add_command(dropdb)

if __name__ == "__main__":
    app.run(port=5555, debug=True)