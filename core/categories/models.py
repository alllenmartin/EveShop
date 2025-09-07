from core import db
from marshmallow import Schema, fields,ValidationError
import uuid
from sqlalchemy.dialects.postgresql import UUID


class Category(db.Model):
    __tablename__ = "categories"
    
    id = db.Column(UUID(as_uuid=True),nullable=False, primary_key=True,default=uuid.uuid4)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String,nullable=False)
    
    def __repr__(self):
        return f"<name {self.name}>"
    
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description            
        }
        
def must_be_str(value):
    if not isinstance(value, str):
        raise ValidationError("Must be a string.")
        
class CategorySchema(Schema):
    name = fields.String(required=True,validate=must_be_str)
    description = fields.String(required=True,validate=must_be_str)

    
