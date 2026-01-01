"""
Shlink Service for URL Shortening

This service provides URL shortening functionality using the Shlink API.
Based on the ShlinkManager class from the shlink folder.
"""

import requests
import os
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from ..config import get_settings


class ShortUrlRequest(BaseModel):
    """Request model for creating short URLs."""
    longUrl: str = Field(..., description="The long URL to shorten")
    title: Optional[str] = Field(None, description="Optional title for the short URL")
    tags: Optional[List[str]] = Field(None, description="Optional tags for categorization")
    customSlug: Optional[str] = Field(None, description="Optional custom slug for the short URL")
    crawlable: Optional[bool] = Field(True, description="Whether the short URL should be crawlable")
    forwardQuery: Optional[bool] = Field(True, description="Whether to forward query parameters")


class ShortUrlResponse(BaseModel):
    """Response model for short URL creation."""
    shortUrl: str = Field(..., description="The generated short URL")
    shortCode: str = Field(..., description="The short code")
    longUrl: str = Field(..., description="The original long URL")
    dateCreated: str = Field(..., description="Creation timestamp")
    title: Optional[str] = Field(None, description="Title of the short URL")
    tags: Optional[List[str]] = Field(None, description="Tags associated with the short URL")
    visitsSummary: Optional[Dict[str, int]] = Field(None, description="Visit statistics")


class ShlinkService:
    """Service for managing short URLs with Shlink API."""
    
    def __init__(self):
        """Initialize the Shlink service with configuration."""
        self.settings = get_settings()
        self.api_key = self._get_api_key()
        self.base_url = self._get_base_url()
        self.short_urls_endpoint = f"{self.base_url}/short-urls"
        
        if not self.api_key:
            print("⚠️ Shlink API Key not configured - URL shortening will not work")
    
    def _get_api_key(self) -> Optional[str]:
        """Get Shlink API key from environment variables."""
        # Try to get from settings first
        try:
            if hasattr(self.settings, 'shlink_api_key') and self.settings.shlink_api_key:
                return self.settings.shlink_api_key
        except AttributeError:
            pass
        
        # Fallback to environment variable
        return os.getenv("SHLINK_API_KEY")
    
    def _get_base_url(self) -> str:
        """Get Shlink base URL from environment variables."""
        # Try to get from settings first
        try:
            if hasattr(self.settings, 'shlink_base_url') and self.settings.shlink_base_url:
                return self.settings.shlink_base_url
        except AttributeError:
            pass
        
        # Fallback to environment variable or default
        return os.getenv("SHLINK_BASE_URL", "https://demo.bifrotek.com/rest/v3")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests."""
        return {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def is_configured(self) -> bool:
        """Check if the service is properly configured."""
        return self.api_key is not None
    
    async def create_short_url(
        self,
        long_url: str,
        title: Optional[str] = None,
        tags: Optional[List[str]] = None,
        custom_slug: Optional[str] = None,
        crawlable: bool = True,
        forward_query: bool = True
    ) -> Optional[ShortUrlResponse]:
        """
        Create a short URL.
        
        Args:
            long_url: The long URL to shorten
            title: Optional title for the short URL
            tags: Optional tags for categorization
            custom_slug: Optional custom slug
            crawlable: Whether the short URL should be crawlable
            forward_query: Whether to forward query parameters
            
        Returns:
            ShortUrlResponse if successful, None otherwise
        """
        if not self.is_configured():
            print("❌ Shlink service not configured - cannot create short URL")
            return None
        
        payload = {
            "longUrl": long_url,
            "crawlable": crawlable,
            "forwardQuery": forward_query
        }
        
        if title:
            payload["title"] = title
        if tags:
            payload["tags"] = tags
        if custom_slug:
            payload["customSlug"] = custom_slug
        
        try:
            response = requests.post(
                self.short_urls_endpoint,
                headers=self._get_headers(),
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            return ShortUrlResponse(
                shortUrl=data.get("shortUrl"),
                shortCode=data.get("shortCode"),
                longUrl=data.get("longUrl"),
                dateCreated=data.get("dateCreated"),
                title=data.get("title"),
                tags=data.get("tags"),
                visitsSummary=data.get("visitsSummary")
            )
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to create short URL: {e}")
            return None
    
    async def get_short_url(self, short_code: str) -> Optional[Dict[str, Any]]:
        """
        Get details of a short URL.
        
        Args:
            short_code: The short code to look up
            
        Returns:
            Dict with short URL details if successful, None otherwise
        """
        if not self.is_configured():
            print("❌ Shlink service not configured - cannot get short URL")
            return None
        
        url = f"{self.short_urls_endpoint}/{short_code}"
        
        try:
            response = requests.get(url, headers=self._get_headers(), timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to get short URL {short_code}: {e}")
            return None
    
    async def list_short_urls(self, limit: int = 10) -> Optional[List[Dict[str, Any]]]:
        """
        List short URLs.
        
        Args:
            limit: Maximum number of URLs to return
            
        Returns:
            List of short URLs if successful, None otherwise
        """
        if not self.is_configured():
            print("❌ Shlink service not configured - cannot list short URLs")
            return None
        
        params = {"page": 1, "itemsPerPage": limit}
        
        try:
            response = requests.get(
                self.short_urls_endpoint,
                headers=self._get_headers(),
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            return data.get("shortUrls", {}).get("data", [])
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to list short URLs: {e}")
            return None
    
    async def get_short_url_stats(self, short_code: str) -> Optional[Dict[str, Any]]:
        """
        Get statistics for a short URL.
        
        Args:
            short_code: The short code to get stats for
            
        Returns:
            Dict with statistics if successful, None otherwise
        """
        if not self.is_configured():
            print("❌ Shlink service not configured - cannot get stats")
            return None
        
        url = f"{self.short_urls_endpoint}/{short_code}/visits"
        
        try:
            response = requests.get(url, headers=self._get_headers(), timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to get stats for {short_code}: {e}")
            return None
    
    async def delete_short_url(self, short_code: str) -> bool:
        """
        Delete a short URL.
        
        Args:
            short_code: The short code to delete
            
        Returns:
            True if successful, False otherwise
        """
        if not self.is_configured():
            print("❌ Shlink service not configured - cannot delete short URL")
            return False
        
        url = f"{self.short_urls_endpoint}/{short_code}"
        
        try:
            response = requests.delete(url, headers=self._get_headers(), timeout=30)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to delete short URL {short_code}: {e}")
            return False


# Global service instance
shlink_service = ShlinkService()
