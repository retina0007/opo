from pydantic import BaseModel, Field, ValidationError
from pydantic_settings import BaseSettings
from typing import Optional
import json
import os


class AppSettings(BaseSettings):
    """Application infrastructure settings loaded from environment variables.
    
    This class contains only technical/infrastructure configuration that should
    be set via environment variables and not changed by SaaS customers.
    """

    # VAPI Configuration
    assistant_id: str = Field(
        default="",
        description="VAPI Assistant ID - REQUIRED: Set via ASSISTANT_ID env var"
    )
    public_key: str = Field(
        default="",
        description="VAPI Public Key - REQUIRED: Set via PUBLIC_KEY env var"
    )
    vapi_private_key: str = Field(
        default="",
        description="VAPI Private Key - OPTIONAL: Set via VAPI_PRIVATE_KEY env var for chat functionality"
    )
    
    # External Service Configuration
    facebook_business_whatsapp: str = Field(
        default="",
        description="Facebook Business WhatsApp - OPTIONAL: Set via FACEBOOK_BUSINESS_WHATSAPP env var"
    )
    calendly_link: str = Field(
        default="",
        description="Calendly Link - OPTIONAL: Set via CALENDLY_LINK env var"
    )
    
    # Domain Analysis (technical)
    analyzed_domain: str = Field(
        default="",
        description="Analyzed Domain - OPTIONAL: Set via ANALYZED_DOMAIN env var"
    )
    
    # Admin Configuration
    config_password: str = Field(
        default="",
        description="Config Password - OPTIONAL: Set via CONFIG_PASSWORD env var for admin access"
    )
    
    # Redis Configuration
    redis_url: str = Field(
        default="",
        description="Redis URL - OPTIONAL: Set via REDIS_URL env var for Upstash Redis"
    )
    redis_username: str = Field(
        default="",
        description="Redis Username - OPTIONAL: Set via REDIS_USERNAME env var for Upstash Redis"
    )
    redis_password: str = Field(
        default="",
        description="Redis Password - OPTIONAL: Set via REDIS_PASSWORD env var for Upstash Redis"
    )
    
    # Shlink Configuration
    shlink_api_key: str = Field(
        default="",
        description="Shlink API Key - OPTIONAL: Set via SHLINK_API_KEY env var for URL shortening"
    )
    shlink_base_url: str = Field(
        default="https://demo.bifrotek.com/rest/v3",
        description="Shlink Base URL - OPTIONAL: Set via SHLINK_BASE_URL env var"
    )
    shlink_domain: str = Field(
        default="localhost:8080",
        description="Shlink Domain - OPTIONAL: Set via SHLINK_DOMAIN env var"
    )
    shlink_https: bool = Field(
        default=False,
        description="Shlink HTTPS - OPTIONAL: Set via SHLINK_HTTPS env var"
    )

    model_config = {
        "env_prefix": "",
        "env_file": ".env",
        "env_ignore_empty": True,
        "extra": "ignore",  # Ignore extra fields instead of raising error
    }


class SaaSConfig(BaseModel):
    """SaaS customer configuration for branding and customization.
    
    This class contains customer-specific configuration that can be changed
    via the /config page and is stored separately from environment variables.
    """
    
    # Company Information
    company_name: str = Field(
        default="",
        description="Company Name for branding"
    )
    logo_url: str = Field(
        default="",
        description="Logo URL for branding"
    )
    website_url: str = Field(
        default="",
        description="Company Website URL"
    )
    support_email: str = Field(
        default="",
        description="Support Email Address"
    )
    
    # Legal Links
    impressum_url: str = Field(
        default="",
        description="Impressum URL"
    )
    privacy_policy_url: str = Field(
        default="",
        description="Privacy Policy URL"
    )
    terms_url: str = Field(
        default="",
        description="Terms of Service URL"
    )
    
    # Brand Colors
    auto_color_extraction: bool = Field(
        default=True,
        description="Enable automatic color extraction from customer logo/domain"
    )
    primary_color: str = Field(
        default="#4361ee",
        description="Primary brand color (hex)"
    )
    secondary_color: str = Field(
        default="#3a0ca3",
        description="Secondary brand color (hex)"
    )
    accent_color: str = Field(
        default="#4cc9f0",
        description="Accent brand color (hex)"
    )
    
    # Hero Content
    hero_title: str = Field(
        default="",
        description="Hero section title"
    )
    hero_text: str = Field(
        default="",
        description="Hero section text"
    )
    
    # Additional Content
    welcome_message: str = Field(
        default="",
        description="Welcome message text"
    )
    cta_text: str = Field(
        default="",
        description="Call-to-Action button text"
    )
    first_message: str = Field(
        default="",
        description="First chat message from assistant"
    )
    
    # Additional Branding
    powered_by_text: str = Field(
        default="",
        description="Powered by text in footer"
    )
    powered_by_url: str = Field(
        default="",
        description="Powered by URL in footer"
    )
    powered_by_company: str = Field(
        default="",
        description="Powered by company name"
    )
    powered_by_logo: str = Field(
        default="",
        description="Powered by logo URL"
    )
    
    # Contact Information
    calendly_link: str = Field(
        default="",
        description="Calendly Link for appointments"
    )


_cached_settings: AppSettings | None = None
_cached_saas_config: SaaSConfig | None = None

# SaaS Config Storage
SAAS_CONFIG_FILE = "saas_config.json"


def get_settings() -> AppSettings:
    """Get cached infrastructure settings instance.

    Returns:
        AppSettings: The application infrastructure settings.
    """

    global _cached_settings
    if _cached_settings is None:
        _cached_settings = AppSettings()
    return _cached_settings


def get_saas_config() -> SaaSConfig:
    """Get SaaS configuration from file or return defaults.
    
    Returns:
        SaaSConfig: The SaaS customer configuration.
    """
    global _cached_saas_config
    
    if _cached_saas_config is None:
        try:
            if os.path.exists(SAAS_CONFIG_FILE):
                with open(SAAS_CONFIG_FILE, 'r', encoding='utf-8') as f:
                    config_data = json.load(f)
                _cached_saas_config = SaaSConfig(**config_data)
            else:
                # Return default configuration
                _cached_saas_config = SaaSConfig()
        except Exception as e:
            print(f"⚠️ Error loading SaaS config: {e}, using defaults")
            _cached_saas_config = SaaSConfig()
    
    return _cached_saas_config


def save_saas_config(config: SaaSConfig) -> bool:
    """Save SaaS configuration to file.
    
    Args:
        config (SaaSConfig): The SaaS configuration to save.
        
    Returns:
        bool: True if successful, False otherwise.
    """
    global _cached_saas_config
    
    try:
        with open(SAAS_CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config.model_dump(), f, indent=2, ensure_ascii=False)
        
        # Update cache
        _cached_saas_config = config
        print(f"✅ SaaS configuration saved to {SAAS_CONFIG_FILE}")
        return True
    except Exception as e:
        print(f"❌ Error saving SaaS config: {e}")
        return False


def reset_settings_cache() -> None:
    """Reset the cached settings instance (used in tests)."""

    global _cached_settings
    _cached_settings = None


def reset_saas_config_cache() -> None:
    """Reset the cached SaaS config instance (used in tests)."""
    
    global _cached_saas_config
    _cached_saas_config = None



