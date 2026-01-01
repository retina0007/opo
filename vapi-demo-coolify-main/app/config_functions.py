"""
Configuration functions that work with both .env files and Coolify environment variables.

This module provides backward-compatible functions that automatically detect
the environment and use the appropriate configuration method.
"""

from typing import Dict, Any
from .config_manager import config_manager


def get_vapi_credentials() -> Dict[str, str]:
    """
    Get VAPI credentials with intelligent fallback.
    
    Returns:
        Dict[str, str]: VAPI credentials
    """
    return {
        "assistant_id": config_manager.get_config_value("ASSISTANT_ID"),
        "public_key": config_manager.get_config_value("PUBLIC_KEY"),
        "private_key": config_manager.get_config_value("VAPI_PRIVATE_KEY")
    }


def get_company_config() -> Dict[str, str]:
    """
    Get company configuration with intelligent fallback.
    
    Returns:
        Dict[str, str]: Company configuration
    """
    return {
        "company_name": config_manager.get_config_value("COMPANY_NAME"),
        "website_url": config_manager.get_config_value("WEBSITE_URL"),
        "support_email": config_manager.get_config_value("SUPPORT_EMAIL"),
        "impressum_url": config_manager.get_config_value("IMPRESSUM_URL"),
        "privacy_policy_url": config_manager.get_config_value("PRIVACY_POLICY_URL"),
        "terms_url": config_manager.get_config_value("TERMS_URL"),
        "logo_url": config_manager.get_config_value("LOGO_URL")
    }


def get_brand_colors() -> Dict[str, str]:
    """
    Get brand colors with intelligent fallback.
    
    Returns:
        Dict[str, str]: Brand colors
    """
    return {
        "primary_color": config_manager.get_config_value("PRIMARY_COLOR", "#4361ee"),
        "secondary_color": config_manager.get_config_value("SECONDARY_COLOR", "#3a0ca3"),
        "accent_color": config_manager.get_config_value("ACCENT_COLOR", "#4cc9f0")
    }


def get_contact_config() -> Dict[str, str]:
    """
    Get contact configuration with intelligent fallback.
    
    Returns:
        Dict[str, str]: Contact configuration
    """
    return {
        "facebook_business_whatsapp": config_manager.get_config_value("FACEBOOK_BUSINESS_WHATSAPP"),
        "calendly_link": config_manager.get_config_value("CALENDLY_LINK")
    }


def get_redis_config() -> Dict[str, str]:
    """
    Get Redis configuration with intelligent fallback.
    
    Returns:
        Dict[str, str]: Redis configuration
    """
    return {
        "redis_url": config_manager.get_config_value("REDIS_URL"),
        "redis_password": config_manager.get_config_value("REDIS_PASSWORD"),
        "redis_username": config_manager.get_config_value("REDIS_USERNAME")
    }


def get_shlink_config() -> Dict[str, str]:
    """
    Get Shlink configuration with intelligent fallback.
    
    Returns:
        Dict[str, str]: Shlink configuration
    """
    return {
        "shlink_api_key": config_manager.get_config_value("SHLINK_API_KEY"),
        "shlink_base_url": config_manager.get_config_value("SHLINK_BASE_URL"),
        "shlink_domain": config_manager.get_config_value("SHLINK_DOMAIN"),
        "shlink_https": config_manager.get_config_value("SHLINK_HTTPS")
    }


def save_vapi_credentials(assistant_id: str, public_key: str, private_key: str = "") -> Dict[str, str]:
    """
    Save VAPI credentials with intelligent fallback.
    
    Args:
        assistant_id (str): VAPI Assistant ID
        public_key (str): VAPI Public Key
        private_key (str): VAPI Private Key (optional)
        
    Returns:
        Dict[str, str]: Result message
    """
    config_dict = {
        "ASSISTANT_ID": assistant_id,
        "PUBLIC_KEY": public_key
    }
    
    if private_key:
        config_dict["VAPI_PRIVATE_KEY"] = private_key
    
    success = config_manager.save_multiple_config(config_dict)
    
    if success:
        return {
            "status": "success",
            "message": "VAPI credentials saved successfully"
        }
    elif config_manager.is_coolify:
        return {
            "status": "info",
            "message": "In Coolify deployment, environment variables are managed by Coolify dashboard. Please update them there."
        }
    else:
        return {
            "status": "error",
            "message": "Failed to save VAPI credentials"
        }


def save_manual_inputs(facebook_business_whatsapp: str = "", calendly_link: str = "") -> Dict[str, str]:
    """
    Save manual inputs with intelligent fallback.
    
    Args:
        facebook_business_whatsapp (str): Facebook Business WhatsApp
        calendly_link (str): Calendly Link
        
    Returns:
        Dict[str, str]: Result message
    """
    config_dict = {}
    
    if facebook_business_whatsapp:
        config_dict["FACEBOOK_BUSINESS_WHATSAPP"] = facebook_business_whatsapp
    
    if calendly_link:
        config_dict["CALENDLY_LINK"] = calendly_link
    
    if not config_dict:
        return {
            "status": "error",
            "message": "No data to save"
        }
    
    success = config_manager.save_multiple_config(config_dict)
    
    if success:
        return {
            "status": "success",
            "message": "Manual inputs saved successfully"
        }
    elif config_manager.is_coolify:
        return {
            "status": "info",
            "message": "In Coolify deployment, environment variables are managed by Coolify dashboard. Please update them there."
        }
    else:
        return {
            "status": "error",
            "message": "Failed to save manual inputs"
        }


def save_domain_analysis(
    analyzed_domain: str = "",
    company_name: str = "",
    website_url: str = "",
    support_email: str = "",
    impressum_url: str = "",
    privacy_policy_url: str = "",
    terms_url: str = "",
    primary_color: str = "",
    secondary_color: str = "",
    accent_color: str = "",
    logo_url: str = ""
) -> Dict[str, str]:
    """
    Save domain analysis results with intelligent fallback.
    
    Args:
        analyzed_domain (str): Analyzed domain
        company_name (str): Company name
        website_url (str): Website URL
        support_email (str): Support email
        impressum_url (str): Impressum URL
        privacy_policy_url (str): Privacy policy URL
        terms_url (str): Terms URL
        primary_color (str): Primary color
        secondary_color (str): Secondary color
        accent_color (str): Accent color
        logo_url (str): Logo URL
        
    Returns:
        Dict[str, str]: Result message
    """
    config_dict = {}
    
    if analyzed_domain:
        config_dict["ANALYZED_DOMAIN"] = analyzed_domain
    if company_name:
        config_dict["COMPANY_NAME"] = company_name
    if website_url:
        config_dict["WEBSITE_URL"] = website_url
    if support_email:
        config_dict["SUPPORT_EMAIL"] = support_email
    if impressum_url:
        config_dict["IMPRESSUM_URL"] = impressum_url
    if privacy_policy_url:
        config_dict["PRIVACY_POLICY_URL"] = privacy_policy_url
    if terms_url:
        config_dict["TERMS_URL"] = terms_url
    if primary_color:
        config_dict["PRIMARY_COLOR"] = primary_color
    if secondary_color:
        config_dict["SECONDARY_COLOR"] = secondary_color
    if accent_color:
        config_dict["ACCENT_COLOR"] = accent_color
    if logo_url:
        config_dict["LOGO_URL"] = logo_url
    
    if not config_dict:
        return {
            "status": "error",
            "message": "No data to save"
        }
    
    success = config_manager.save_multiple_config(config_dict)
    
    if success:
        return {
            "status": "success",
            "message": "Domain analysis results saved successfully"
        }
    elif config_manager.is_coolify:
        return {
            "status": "info",
            "message": "In Coolify deployment, environment variables are managed by Coolify dashboard. Please update them there."
        }
    else:
        return {
            "status": "error",
            "message": "Failed to save domain analysis results"
        }
