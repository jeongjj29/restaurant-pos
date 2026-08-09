from flask import abort, request
from app.extensions import db


def get_or_404(model, id_):
    record = db.session.get(model, id_)
    if record is None:
        abort(404)
    return record


def get_json_object(allowed_fields=None):
    """Return an object-shaped JSON body after validating its field boundary."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValueError("Request body must be a JSON object")

    if allowed_fields is not None:
        unexpected_fields = sorted(set(data).difference(allowed_fields))
        if unexpected_fields:
            raise ValueError(f"Unexpected fields: {', '.join(unexpected_fields)}")

    return data
