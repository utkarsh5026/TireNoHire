import hashlib
import json
import time
from typing import Any, Optional, Dict, Union, TypeVar, Generic
from loguru import logger
import redis
from core.config import settings

T = TypeVar('T')


class CacheManager:
    """
    Manages caching with both in-memory and Redis options.
    Optimized for storing document content from URLs.
    """

    def __init__(self, ttl: int = 3600):
        """
        Initialize the cache manager with Redis connection.

        Args:
            ttl: Default time-to-live for cache entries in seconds
        """
        self._memory_cache: Dict[str, Dict[str, Any]] = {}
        self._default_ttl = ttl

        # Initialize Redis connection if configured
        self._redis = None
        if settings.REDIS_URL:
            try:
                self._redis = redis.from_url(settings.REDIS_URL)
                logger.info(f"Connected to Redis at {settings.REDIS_URL}")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {str(e)}")

        logger.info(
            f"Initialized Cache Manager with default TTL of {ttl} seconds")

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set a value in the cache (memory and Redis if available).

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds
        """
        # Set in memory cache
        expiry = time.time() + (ttl or self._default_ttl)
        self._memory_cache[key] = {
            "value": value,
            "expiry": expiry
        }

        # Set in Redis if available
        if self._redis:
            try:
                # Serialize value based on type
                if isinstance(value, bytes):
                    # Store binary data directly
                    self._redis.set(f"bin:{key}", value,
                                    ex=(ttl or self._default_ttl))
                else:
                    # Serialize other types to JSON
                    serialized = json.dumps(value)
                    self._redis.set(f"json:{key}", serialized, ex=(
                        ttl or self._default_ttl))
            except Exception as e:
                logger.error(f"Error setting value in Redis: {str(e)}")

    def get(self, key: str, use_redis: bool = True) -> Optional[Any]:
        """
        Get a value from the cache, trying Redis first if enabled.

        Args:
            key: Cache key
            use_redis: Whether to try Redis before memory cache

        Returns:
            Cached value or None if not found or expired
        """
        # Try Redis first if enabled
        if use_redis and self._redis:
            try:
                # Try to get as binary data first
                binary_data = self._redis.get(f"bin:{key}")
                if binary_data:
                    return binary_data

                # Try to get as JSON data
                json_data = self._redis.get(f"json:{key}")
                if json_data:
                    return json.loads(json_data)
            except Exception as e:
                logger.error(f"Error getting value from Redis: {str(e)}")

        # Fall back to memory cache
        entry = self._memory_cache.get(key)

        if not entry:
            return None

        # Check if entry has expired
        if entry["expiry"] < time.time():
            del self._memory_cache[key]
            return None

        return entry["value"]

    def delete(self, key: str) -> None:
        """
        Delete a value from the cache (memory and Redis).

        Args:
            key: Cache key
        """
        # Delete from memory cache
        if key in self._memory_cache:
            del self._memory_cache[key]

        # Delete from Redis if available
        if self._redis:
            try:
                self._redis.delete(f"bin:{key}")
                self._redis.delete(f"json:{key}")
            except Exception as e:
                logger.error(f"Error deleting value from Redis: {str(e)}")

    def clear(self) -> None:
        """Clear all cache entries from memory cache and Redis."""
        # Clear memory cache
        self._memory_cache.clear()

        # Clear Redis cache if available (only our keys)
        if self._redis:
            try:
                # Delete keys that match our patterns
                for pattern in ["bin:*", "json:*"]:
                    keys = self._redis.keys(pattern)
                    if keys:
                        self._redis.delete(*keys)
            except Exception as e:
                logger.error(f"Error clearing Redis cache: {str(e)}")

    def hash_content(self, content: Union[str, bytes, dict, list]) -> str:
        """
        Generate a hash for the given content.

        Args:
            content: Content to hash

        Returns:
            SHA-256 hash as hexadecimal string
        """
        if isinstance(content, (dict, list)):
            content = json.dumps(content, sort_keys=True).encode('utf-8')
        elif isinstance(content, str):
            content = content.encode('utf-8')

        return hashlib.sha256(content).hexdigest()

    def cache_url_content(self, url: str, content: bytes, content_type: str, ttl: Optional[int] = None) -> str:
        """
        Cache content from a URL with metadata.

        Args:
            url: The URL the content was downloaded from
            content: Binary content data
            content_type: MIME type of the content
            ttl: Optional custom TTL

        Returns:
            Cache key that can be used to retrieve the content
        """
        # Generate a hash of the content for the key
        content_hash = self.hash_content(content)

        # Store URL to content hash mapping
        url_key = f"url:{self.hash_content(url)}"
        self.set(url_key, content_hash, ttl)

        # Store content with metadata
        metadata = {
            "url": url,
            "content_type": content_type,
            "size": len(content),
            "cached_at": time.time(),
            "hash": content_hash
        }

        # Store metadata separately
        meta_key = f"meta:{content_hash}"
        self.set(meta_key, metadata, ttl)

        # Store actual binary content
        content_key = f"content:{content_hash}"
        self.set(content_key, content, ttl)

        logger.info(
            f"Cached {len(content)} bytes from {url} with hash {content_hash}")
        return content_hash

    def get_url_content(self, url: str) -> Optional[dict[str, Any]]:
        """
        Retrieve cached content for a URL.

        Args:
            url: URL to retrieve content for

        Returns:
            Dict with content and metadata, or None if not cached
        """
        # Get content hash from URL
        url_key = f"url:{self.hash_content(url)}"
        content_hash = self.get(url_key)

        if not content_hash:
            return None

        # Get metadata
        meta_key = f"meta:{content_hash}"
        metadata = self.get(meta_key)

        if not metadata:
            return None

        # Get content
        content_key = f"content:{content_hash}"
        content = self.get(content_key)

        if not content:
            return None

        # Return combined result
        return {
            "content": content,
            "metadata": metadata
        }

    def get_url_content_hash(self, url: str) -> Optional[str]:
        """
        Get the content hash for a URL without retrieving the content.

        Args:
            url: URL to check

        Returns:
            Content hash if URL is cached, None otherwise
        """
        url_key = f"url:{self.hash_content(url)}"
        return self.get(url_key)


# Create a singleton instance for global use
cache_manager = CacheManager()
