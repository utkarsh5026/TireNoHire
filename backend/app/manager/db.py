"""
Database manager that provides a centralized interface for all database operations.
Handles common concerns like caching, connection management, and error handling.
"""

from typing import Type, TypeVar, List, Dict, Any, Optional, Union
from beanie import Document
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from loguru import logger
import hashlib
import json


T = TypeVar('T', bound=Document)
M = TypeVar('M', bound=BaseModel)

class DBManager:
    """
    Centralized manager for database operations.
    Provides a clean interface for CRUD operations with caching and error handling.
    """
    
    def __init__(self):
        """Initialize DB Manager"""
        self._cache = {}  # Simple in-memory cache
        logger.info("Initialized DB Manager")
    
    async def save_document(self, document: Document) -> Document:
        """
        Save a document to the database.
        
        Args:
            document: Beanie document to save
            
        Returns:
            Saved document
        """
        try:
            # Update timestamp if available
            if hasattr(document, 'updated_at'):
                document.updated_at = datetime.now()
                
            # Save the document
            result = await document.save()
            
            # Invalidate cache for this document type/id
            self._invalidate_cache(document)
            
            return result
        
        except Exception as e:
            logger.error(f"Error saving document: {str(e)}")
            raise
    
    async def find_by_id(self, model_class: Type[T], id_value: Union[str, UUID]) -> Optional[T]:
        """
        Find a document by its ID.
        
        Args:
            model_class: Document class to query
            id_value: ID value to search for
            
        Returns:
            Document if found, None otherwise
        """
        try:
            # Check cache first
            cache_key = f"{model_class.__name__}:{id_value}"
            if cache_key in self._cache:
                logger.info(f"Cache hit for {cache_key}")
                return self._cache[cache_key]
            
            # Query the database
            document = await model_class.get(id_value)
            
            # Cache the result
            if document:
                self._cache[cache_key] = document
            
            return document
        
        except Exception as e:
            logger.error(f"Error finding document by ID: {str(e)}")
            raise
    
    async def find_by_field(self, model_class: Type[T], field_name: str, field_value: Any) -> List[T]:
        """
        Find documents by a field value.
        
        Args:
            model_class: Document class to query
            field_name: Field to search on
            field_value: Value to search for
            
        Returns:
            List of matching documents
        """
        try:
            query = {field_name: field_value}
            documents = await model_class.find(query).to_list()
            return documents
        
        except Exception as e:
            logger.error(f"Error finding documents by field: {str(e)}")
            raise
    
    async def find_one_by_field(self, model_class: Type[T], field_name: str, field_value: Any) -> Optional[T]:
        """
        Find a single document by a field value.
        
        Args:
            model_class: Document class to query
            field_name: Field to search on
            field_value: Value to search for
            
        Returns:
            Matching document if found, None otherwise
        """
        try:
            query = {field_name: field_value}
            document = await model_class.find_one(query)
            return document
        
        except Exception as e:
            logger.error(f"Error finding one document by field: {str(e)}")
            raise
    
    async def find_by_content_hash(self, model_class: Type[T], content: str) -> Optional[T]:
        """
        Find a document by content hash.
        Useful for finding duplicate content without storing the full content.
        
        Args:
            model_class: Document class to query
            content: Content to hash and search for
            
        Returns:
            Matching document if found, None otherwise
        """
        try:
            content_hash = self._compute_hash(content)
            return await self.find_one_by_field(model_class, "content_hash", content_hash)
        
        except Exception as e:
            logger.error(f"Error finding document by content hash: {str(e)}")
            raise
    
    async def list_all(self, model_class: Type[T]) -> List[T]:
        """
        List all documents of a given type.
        
        Args:
            model_class: Document class to query
            
        Returns:
            List of all documents
        """
        try:
            documents = await model_class.find_all().to_list()
            return documents
        
        except Exception as e:
            logger.error(f"Error listing all documents: {str(e)}")
            raise
    
    async def delete_document(self, document: Document) -> bool:
        """
        Delete a document from the database.
        
        Args:
            document: Document to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Delete from DB
            await document.delete()
            
            # Invalidate cache
            self._invalidate_cache(document)
            
            return True
        
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            raise
    
    def _invalidate_cache(self, document: Document) -> None:
        """
        Invalidate cache entries related to the given document.
        
        Args:
            document: Document whose cache entries should be invalidated
        """
        # Remove specific document cache
        doc_id = str(document.id)
        doc_type = document.__class__.__name__
        cache_key = f"{doc_type}:{doc_id}"
        
        if cache_key in self._cache:
            del self._cache[cache_key]
    
    @staticmethod
    def _compute_hash(content: Union[str, Dict, List, bytes]) -> str:
        """
        Compute a hash for the given content.
        
        Args:
            content: Content to hash
            
        Returns:
            SHA-256 hash as a hexadecimal string
        """
        if isinstance(content, (dict, list)):
            content = json.dumps(content, sort_keys=True).encode('utf-8')
        elif isinstance(content, str):
            content = content.encode('utf-8')
        
        return hashlib.sha256(content).hexdigest()
    
    async def find_or_create(self, 
                           model_class: Type[T], 
                           search_fields: Dict[str, Any],
                           create_data: Dict[str, Any]) -> Tuple[T, bool]:
        """
        Find a document by search fields or create it if not found.
        
        Args:
            model_class: Document class to query/create
            search_fields: Fields to search on
            create_data: Data to use when creating a new document
            
        Returns:
            Tuple of (document, created) where created is True if a new document was created
        """
        # Look for existing document
        query = search_fields.copy()
        existing = await model_class.find_one(query)
        
        if existing:
            return existing, False
        
        # Create new document
        new_doc = model_class(**create_data)
        await self.save_document(new_doc)
        return new_doc, True

# Create a singleton instance for global use
db_manager = DBManager()