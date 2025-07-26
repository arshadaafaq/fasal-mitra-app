import os
from firebase_config import get_firestore_client
from models import FarmerResponse


COLLECTION_NAME = os.getenv('FIRESTORE_COLLECTION_NAME', 'farmers')


def register_farmer_in_db(farmer: FarmerResponse) -> FarmerResponse:
    """Register a farmer in Firestore database"""
    db = get_firestore_client()
    if not db:
        raise Exception('Database connection failed')
    
    doc_ref = db.collection(COLLECTION_NAME).document(farmer.farmer_id)
    doc_ref.set(farmer.dict())
    return farmer 