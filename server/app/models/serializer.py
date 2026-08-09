from decimal import Decimal

from sqlalchemy_serializer import SerializerMixin


class JsonSerializerMixin(SerializerMixin):
    """Serialize database values using the JSON types consumed by the client."""

    serialize_types = ((Decimal, float),)
