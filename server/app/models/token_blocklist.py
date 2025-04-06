from sqlalchemy.orm import validates
from app.extensions import db
from datetime import datetime, timezone

class TokenBlockList(db.Model):
    __tablename__ = "token_blocklist"

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<TokenBlockList {self.id} | {self.jti}>"