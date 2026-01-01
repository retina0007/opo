"""
Redis Service for Session Management and Cross-Worker Communication.

This service provides Redis-based session management and message broadcasting
for the VAPI demo application, supporting both local and Upstash Redis.
"""

import json
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import redis.asyncio as redis
from ..config import get_settings


class RedisService:
    """Redis service for session management and message broadcasting."""
    
    def __init__(self):
        """Initialize Redis service with configuration."""
        self.settings = get_settings()
        self.redis_client: Optional[redis.Redis] = None
        self._connection_attempted = False
        
    async def connect(self) -> bool:
        """
        Establish Redis connection.
        
        Returns:
            bool: True if connection successful, False otherwise.
        """
        # If already connected, return True
        if self.redis_client is not None:
            try:
                await self.redis_client.ping()
                return True
            except Exception:
                # Connection is stale, reset it
                self.redis_client = None
                self._connection_attempted = False
        
        # If connection was attempted but failed, don't retry immediately
        if self._connection_attempted:
            return False
            
        self._connection_attempted = True
        
        try:
            # Try Redis URL first (works for both local and Upstash)
            if self.settings.redis_url:
                self.redis_client = redis.from_url(
                    self.settings.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                # Test connection
                await self.redis_client.ping()
                print(f"✅ Connected to Redis at {self.settings.redis_url}")
                return True
                
            # Fallback to local Docker Redis if URL not provided
            elif self.settings.redis_password:
                self.redis_client = redis.Redis(
                    host='redis',  # Docker service name
                    port=6379,
                    password=self.settings.redis_password,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                await self.redis_client.ping()
                print(f"✅ Connected to local Docker Redis")
                return True
                
            # Fallback to username/password for Upstash
            elif self.settings.redis_username and self.settings.redis_password:
                self.redis_client = redis.Redis(
                    host='redis-12345.upstash.io',  # Default Upstash host
                    port=6379,
                    username=self.settings.redis_username,
                    password=self.settings.redis_password,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                await self.redis_client.ping()
                print(f"✅ Connected to Upstash Redis with username/password")
                return True
                
        except Exception as e:
            print(f"❌ Redis connection failed: {e}")
            self.redis_client = None
            return False
            
        return False
    
    async def disconnect(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()
            self.redis_client = None
        self._connection_attempted = False
    
    def reset_connection(self):
        """Reset connection state to allow reconnection."""
        self._connection_attempted = False
        self.redis_client = None
    
    def is_connected(self) -> bool:
        """
        Check if Redis is connected.
        
        Returns:
            bool: True if connected, False otherwise.
        """
        return self.redis_client is not None
    
    async def store_session(self, session_id: str, session_data: Dict[str, Any], ttl: int = 3600) -> bool:
        """
        Store session data in Redis.
        
        Args:
            session_id (str): Unique session identifier.
            session_data (Dict[str, Any]): Session data to store.
            ttl (int): Time to live in seconds (default: 1 hour).
            
        Returns:
            bool: True if successful, False otherwise.
        """
        if not self.is_connected():
            return False
            
        try:
            key = f"session:{session_id}"
            session_data['updated_at'] = datetime.utcnow().isoformat()
            await self.redis_client.setex(key, ttl, json.dumps(session_data))
            return True
        except Exception as e:
            print(f"❌ Failed to store session {session_id}: {e}")
            return False
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve session data from Redis.
        
        Args:
            session_id (str): Session identifier.
            
        Returns:
            Optional[Dict[str, Any]]: Session data or None if not found.
        """
        if not self.is_connected():
            return None
            
        try:
            key = f"session:{session_id}"
            data = await self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"❌ Failed to get session {session_id}: {e}")
            return None
    
    async def delete_session(self, session_id: str) -> bool:
        """
        Delete session from Redis.
        
        Args:
            session_id (str): Session identifier.
            
        Returns:
            bool: True if successful, False otherwise.
        """
        if not self.is_connected():
            return False
            
        try:
            key = f"session:{session_id}"
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"❌ Failed to delete session {session_id}: {e}")
            return False
    
    async def store_webhook_message(self, session_id: str, message: Dict[str, Any], ttl: int = 3600) -> bool:
        """
        Store webhook message for a session.
        
        Args:
            session_id (str): Session identifier.
            message (Dict[str, Any]): Webhook message data.
            ttl (int): Time to live in seconds (default: 1 hour).
            
        Returns:
            bool: True if successful, False otherwise.
        """
        if not self.is_connected():
            return False
            
        try:
            key = f"webhook_messages:{session_id}"
            message['timestamp'] = datetime.utcnow().isoformat()
            await self.redis_client.lpush(key, json.dumps(message))
            await self.redis_client.expire(key, ttl)
            return True
        except Exception as e:
            print(f"❌ Failed to store webhook message for session {session_id}: {e}")
            return False
    
    async def get_webhook_messages(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve webhook messages for a session.
        
        Args:
            session_id (str): Session identifier.
            
        Returns:
            List[Dict[str, Any]]: List of webhook messages.
        """
        if not self.is_connected():
            return []
            
        try:
            key = f"webhook_messages:{session_id}"
            messages = await self.redis_client.lrange(key, 0, -1)
            return [json.loads(msg) for msg in messages]
        except Exception as e:
            print(f"❌ Failed to get webhook messages for session {session_id}: {e}")
            return []
    
    async def publish_message(self, channel: str, message: Dict[str, Any]) -> bool:
        """
        Publish message to Redis channel for cross-worker communication.
        
        Args:
            channel (str): Redis channel name.
            message (Dict[str, Any]): Message data.
            
        Returns:
            bool: True if successful, False otherwise.
        """
        if not self.is_connected():
            return False
            
        try:
            message['timestamp'] = datetime.utcnow().isoformat()
            await self.redis_client.publish(channel, json.dumps(message))
            return True
        except Exception as e:
            print(f"❌ Failed to publish message to channel {channel}: {e}")
            return False
    
    async def subscribe_to_channel(self, channel: str, callback):
        """
        Subscribe to Redis channel for real-time updates.
        
        Args:
            channel (str): Redis channel name.
            callback: Function to call when message received.
        """
        if not self.is_connected():
            return
            
        try:
            pubsub = self.redis_client.pubsub()
            await pubsub.subscribe(channel)
            
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        await callback(data)
                    except json.JSONDecodeError as e:
                        print(f"❌ Failed to decode message: {e}")
                        
        except Exception as e:
            print(f"❌ Failed to subscribe to channel {channel}: {e}")
    
    async def add_message_to_session(self, session_id: str, message: Dict[str, Any], ttl: int = 3600) -> bool:
        """
        Add message to session's message array in Redis.
        
        Args:
            session_id (str): Session identifier.
            message (Dict[str, Any]): Message data to add.
            ttl (int): Time to live in seconds (default: 1 hour).
            
        Returns:
            bool: True if successful, False otherwise.
        """
        if not self.is_connected():
            return False
            
        try:
            key = f"session_messages:{session_id}"
            message['timestamp'] = datetime.utcnow().isoformat()
            await self.redis_client.lpush(key, json.dumps(message))
            await self.redis_client.expire(key, ttl)
            return True
        except Exception as e:
            print(f"❌ Failed to add message to session {session_id}: {e}")
            return False
    
    async def get_session_messages(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Get all messages for a session from Redis.
        
        Args:
            session_id (str): Session identifier.
            
        Returns:
            List[Dict[str, Any]]: List of messages for the session.
        """
        if not self.is_connected():
            return []
            
        try:
            key = f"session_messages:{session_id}"
            messages = await self.redis_client.lrange(key, 0, -1)
            return [json.loads(msg) for msg in messages]
        except Exception as e:
            print(f"❌ Failed to get messages for session {session_id}: {e}")
            return []
    
    async def clear_session_messages(self, session_id: str) -> bool:
        """
        Clear all messages for a session.
        
        Args:
            session_id (str): Session identifier.
            
        Returns:
            bool: True if successful, False otherwise.
        """
        if not self.is_connected():
            return False
            
        try:
            key = f"session_messages:{session_id}"
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"❌ Failed to clear messages for session {session_id}: {e}")
            return False

    async def get_redis_info(self) -> Dict[str, Any]:
        """
        Get Redis server information.
        
        Returns:
            Dict[str, Any]: Redis server info or empty dict if not connected.
        """
        if not self.is_connected():
            return {}
            
        try:
            info = await self.redis_client.info()
            return {
                'connected': True,
                'redis_version': info.get('redis_version'),
                'used_memory_human': info.get('used_memory_human'),
                'connected_clients': info.get('connected_clients'),
                'total_commands_processed': info.get('total_commands_processed'),
            }
        except Exception as e:
            print(f"❌ Failed to get Redis info: {e}")
            return {'connected': False, 'error': str(e)}


# Global Redis service instance
redis_service = RedisService()
