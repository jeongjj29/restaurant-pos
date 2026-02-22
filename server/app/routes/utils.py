from flask import abort
from app.extensions import db


def get_or_404(model, id_):
    record = db.session.get(model, id_)
    if record is None:
        abort(404)
    return record
