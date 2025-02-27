import json
import os
from typing import Dict, List, TypeVar, Type, Optional, Union, Any
from pydantic import BaseModel
import logging

# Define a generic type for our models
T = TypeVar('T', bound=BaseModel)

class StorageService:
    """Service to handle local storage for the application"""
    
    def __init__(self, storage_dir: str = "data"):
        """Initialize storage service with directory path"""
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
        logging.info(f"Storage initialized at {storage_dir}")
    
    def _get_file_path(self, collection: str) -> str:
        """Get the file path for a collection"""
        return os.path.join(self.storage_dir, f"{collection}.json")
    
    def _load_collection(self, collection: str) -> Dict:
        """Load a collection from file"""
        file_path = self._get_file_path(collection)
        if not os.path.exists(file_path):
            return {}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            logging.error(f"Error decoding {file_path}")
            return {}
    
    def _save_collection(self, collection: str, data: Dict) -> None:
        """Save a collection to file"""
        file_path = self._get_file_path(collection)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def get_item(self, collection: str, item_id: str, model_class: Type[T]) -> Optional[T]:
        """Get an item from a collection"""
        data = self._load_collection(collection)
        if item_id in data:
            return model_class(**data[item_id])
        return None
    
    def get_all_items(self, collection: str, model_class: Type[T]) -> List[T]:
        """Get all items from a collection"""
        data = self._load_collection(collection)
        return [model_class(**item) for item in data.values()]
    
    def save_item(self, collection: str, item: BaseModel) -> None:
        """Save an item to a collection"""
        data = self._load_collection(collection)
        item_dict = item.dict()
        item_id = item_dict.get('id', None) or item_dict.get('user_id', None)
        
        if not item_id:
            raise ValueError("Item must have 'id' or 'user_id' field")
            
        data[item_id] = item_dict
        self._save_collection(collection, data)
    
    def delete_item(self, collection: str, item_id: str) -> bool:
        """Delete an item from a collection"""
        data = self._load_collection(collection)
        if item_id in data:
            del data[item_id]
            self._save_collection(collection, data)
            return True
        return False
    
    def query_items(self, collection: str, model_class: Type[T], 
                   query_func=None) -> List[T]:
        """Query items from a collection using a filter function"""
        items = self.get_all_items(collection, model_class)
        if query_func:
            return [item for item in items if query_func(item)]
        return items 