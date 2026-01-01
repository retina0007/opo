"""
Brand color extraction service.

Simple, fast, and robust brand color extraction without machine learning.
Uses pixel frequency analysis and intelligent filtering for reliable results.
"""

import requests
from PIL import Image
from collections import Counter
import io
import re
from typing import Tuple, Optional, List
import colorsys


def extract_brand_colors(domain: str) -> Tuple[str, str, str]:
    """
    Extract three main brand colors from any domain - SIMPLE & FAST approach.
    
    No machine learning, no complex algorithms. Just works!
    
    Strategies (in order):
    1. Known brand database (instant for major brands)
    2. Google Favicon API + simple pixel counting (works for 99% of domains)
    3. Website CSS color extraction (backup)
    4. Professional color palette (always works)
    
    Args:
        domain: Clean domain name (e.g., 'example.com')
        
    Returns:
        Tuple of (primary_color, secondary_color, accent_color) as hex strings
    """
    print(f"🎨 Extracting colors for: {domain}")
    
    # Strategy 1: Known brands (instant lookup)
    colors = get_known_brand_colors(domain)
    if colors:
        print(f"✅ Found in brand database: {colors}")
        return colors
    
    # Strategy 2: Simple favicon colors (works for most domains)
    colors = get_simple_favicon_colors(domain)
    if colors:
        print(f"✅ Extracted from favicon: {colors}")
        return colors
    
    # Strategy 3: Website color search (for signal colors)
    colors = get_website_signal_colors(domain)
    if colors:
        print(f"✅ Found signal colors on website: {colors}")
        return colors
    
    # Strategy 4: Professional fallback (always works)
    colors = get_professional_colors_three(domain)
    print(f"✅ Using professional palette: {colors}")
    return colors


def get_known_brand_colors(domain: str) -> Optional[Tuple[str, str, str]]:
    """
    Get colors from known brand database for major companies.
    
    Args:
        domain: Domain name to lookup
        
    Returns:
        Tuple of (primary, secondary, accent) colors or None if not found
    """
    # Remove common prefixes and get base domain
    clean_domain = domain.lower().replace('www.', '').split('.')[0]
    
    # Known brand colors database - improved with readable colors only
    brand_colors = {
        'google': ('#4285f4', '#ea4335', '#fbbc05'),
        'facebook': ('#1877f2', '#42a5f5', '#1565c0'),
        'meta': ('#1877f2', '#42a5f5', '#1565c0'),
        'twitter': ('#1da1f2', '#1976d2', '#0d47a1'),
        'x': ('#1da1f2', '#424242', '#0d47a1'),
        'linkedin': ('#0077b5', '#00a0dc', '#004d7a'),
        'microsoft': ('#0078d4', '#106ebe', '#005a9e'),
        'apple': ('#007aff', '#5856d6', '#ff3b30'),
        'amazon': ('#ff9900', '#232f3e', '#146eb4'),
        'netflix': ('#e50914', '#b71c1c', '#c62828'),
        'spotify': ('#1db954', '#388e3c', '#1ed760'),
        'youtube': ('#ff0000', '#d32f2f', '#c62828'),
        'instagram': ('#e4405f', '#833ab4', '#fd5949'),
        'tiktok': ('#ff0050', '#25f4ee', '#e91e63'),
        'snapchat': ('#fffc00', '#fdd835', '#f57f17'),
        'discord': ('#5865f2', '#57f287', '#fee75c'),
        'slack': ('#4a154b', '#36c5f0', '#2eb67d'),
        'zoom': ('#2d8cff', '#1976d2', '#0d47a1'),
        'airbnb': ('#ff5a5f', '#00a699', '#fc642d'),
        'uber': ('#424242', '#1976d2', '#1fbad6'),
        'lyft': ('#ff00bf', '#352384', '#7b1fa2'),
        'tesla': ('#cc0000', '#d32f2f', '#b71c1c'),
        'paypal': ('#0070ba', '#003087', '#009cde'),
        'stripe': ('#635bff', '#512da8', '#00d924'),
        'shopify': ('#95bf47', '#5e8e3e', '#689f38'),
        'salesforce': ('#00a1e0', '#0277bd', '#54698d'),
        'adobe': ('#ff0000', '#d32f2f', '#b71c1c'),
        'nvidia': ('#76b900', '#689f38', '#558b2f'),
        'intel': ('#0071c5', '#1976d2', '#0d47a1'),
        'amd': ('#ed1c24', '#d32f2f', '#b71c1c'),
        'ibm': ('#1261fe', '#1976d2', '#0d47a1'),
        'oracle': ('#f80000', '#d32f2f', '#b71c1c'),
        'sap': ('#0faaff', '#1976d2', '#0d47a1'),
        'cisco': ('#1ba0d7', '#0288d1', '#0277bd'),
        'vmware': ('#0091da', '#0288d1', '#0277bd'),
        'dropbox': ('#0061ff', '#1976d2', '#0d47a1'),
        'github': ('#424242', '#0366d6', '#28a745'),
        'gitlab': ('#fc6d26', '#6b4fbb', '#e24329'),
        'bitbucket': ('#0052cc', '#2684ff', '#36b37e'),
        'stackoverflow': ('#f48024', '#0077cc', '#5eba7d'),
        'reddit': ('#ff4500', '#0079d3', '#d84315'),
        'pinterest': ('#e60023', '#bd081c', '#ad1457'),
        'tumblr': ('#00cf35', '#388e3c', '#2e7d32'),
        'medium': ('#424242', '#03a87c', '#00695c'),
        'wordpress': ('#21759b', '#464646', '#d54e21'),
        'wix': ('#0c6ebd', '#1976d2', '#0d47a1'),
        'squarespace': ('#424242', '#616161', '#757575'),
        'mailchimp': ('#ffe01b', '#fdd835', '#007c89'),
        'hubspot': ('#ff7a59', '#33475b', '#00bda5'),
        'zendesk': ('#78a300', '#689f38', '#558b2f'),
        'intercom': ('#1f8ded', '#1976d2', '#0d47a1'),
        'twilio': ('#f22f46', '#d32f2f', '#b71c1c'),
        'sendgrid': ('#1a82e2', '#1976d2', '#0d47a1'),
        'mongodb': ('#47a248', '#13aa52', '#2e7d32'),
        'postgresql': ('#336791', '#1976d2', '#0d47a1'),
        'mysql': ('#4479a1', '#e48e00', '#ff8f00'),
        'redis': ('#dc382d', '#d32f2f', '#b71c1c'),
        'docker': ('#2496ed', '#1976d2', '#0d47a1'),
        'kubernetes': ('#326ce5', '#1976d2', '#0d47a1'),
        'aws': ('#ff9900', '#232f3e', '#ff8f00'),
        'azure': ('#0078d4', '#1976d2', '#0d47a1'),
        'gcp': ('#4285f4', '#ea4335', '#fbbc05'),
        'heroku': ('#430098', '#6a1b9a', '#4a148c'),
        'vercel': ('#424242', '#616161', '#0070f3'),
        'netlify': ('#00c7b7', '#00acc1', '#0097a7'),
        'cloudflare': ('#f38020', '#ff8f00', '#ff6f00'),
        'digitalocean': ('#0080ff', '#1976d2', '#0d47a1'),
        'linode': ('#00a95c', '#00acc1', '#0097a7'),
        'vultr': ('#007bfc', '#1976d2', '#0d47a1'),
        # Planity-spezifische Farben hinzugefügt
        'planity': ('#3b82f6', '#1d4ed8', '#60a5fa'),
        'bauhaus': ('#ef4444', '#dc2626', '#f87171'),
    }
    
    return brand_colors.get(clean_domain)


def get_website_signal_colors(domain: str) -> Optional[Tuple[str, str, str]]:
    """
    Search the entire website for signal colors when favicon extraction fails.
    Looks for the most frequent non-gray colors across the entire page.
    
    Args:
        domain: Domain to analyze
        
    Returns:
        Tuple of (primary, secondary, accent) colors or None if not found
    """
    try:
        print(f"🔍 Searching website for signal colors: {domain}")
        
        # Get website HTML
        url = f"https://{domain}"
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        if response.status_code != 200:
            return None
            
        html_content = response.text.lower()
        found_colors = []
        
        # Enhanced patterns for finding colors
        color_patterns = [
            # CSS variables (highest priority)
            r'--primary[^:]*:\s*#([0-9a-f]{6})',
            r'--secondary[^:]*:\s*#([0-9a-f]{6})',
            r'--accent[^:]*:\s*#([0-9a-f]{6})',
            r'--brand[^:]*:\s*#([0-9a-f]{6})',
            r'--main[^:]*:\s*#([0-9a-f]{6})',
            r'--theme[^:]*:\s*#([0-9a-f]{6})',
            
            # High-priority CSS classes
            r'\.primary[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            r'\.secondary[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            r'\.brand[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            r'\.header[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            r'\.navbar[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            r'\.button[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            r'\.btn[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            
            # General CSS properties
            r'background-color:\s*#([0-9a-f]{6})',
            r'color:\s*#([0-9a-f]{6})',
            r'border-color:\s*#([0-9a-f]{6})',
            
            # Any hex color (lower priority)
            r'#([0-9a-f]{6})',
        ]
        
        # Count colors by frequency
        color_frequency = {}
        
        for pattern in color_patterns:
            matches = re.findall(pattern, html_content)
            for match in matches:
                hex_color = f"#{match}"
                if is_signal_color(hex_color):  # New stricter filter
                    if hex_color in color_frequency:
                        color_frequency[hex_color] += 1
                    else:
                        color_frequency[hex_color] = 1
        
        # Sort by frequency and get most common signal colors
        if color_frequency:
            sorted_colors = sorted(color_frequency.items(), key=lambda x: x[1], reverse=True)
            print(f"🎨 Found {len(sorted_colors)} signal colors: {sorted_colors[:5]}")
            
            # Extract distinct colors
            distinct_colors = []
            for color, frequency in sorted_colors:
                # Check if different enough from existing colors
                is_distinct = True
                for existing in distinct_colors:
                    if color_distance_improved(color, existing) < 50:
                        is_distinct = False
                        break
                
                if is_distinct:
                    distinct_colors.append(color)
                    
                if len(distinct_colors) >= 3:
                    break
            
            # Return colors if we have enough
            if len(distinct_colors) >= 3:
                return tuple(distinct_colors[:3])
            elif len(distinct_colors) == 2:
                # Generate third color
                third_color = generate_complementary_color(distinct_colors[0])
                return (distinct_colors[0], distinct_colors[1], third_color)
            elif len(distinct_colors) == 1:
                # Generate second and third colors
                second_color = generate_complementary_color(distinct_colors[0])
                third_color = generate_analogous_color(distinct_colors[0])
                return (distinct_colors[0], second_color, third_color)
        
        return None
        
    except Exception as e:
        print(f"⚠️ Website signal color search failed: {e}")
        return None


def is_signal_color(hex_color: str) -> bool:
    """
    Check if a color is a signal color (not gray/black/white).
    More permissive than is_good_brand_color for finding ANY colorful colors.
    
    Args:
        hex_color: Hex color string
        
    Returns:
        True if color has enough saturation to be considered a signal color
    """
    try:
        r, g, b = hex_to_rgb(hex_color)
        
        # Calculate saturation
        max_val = max(r, g, b)
        min_val = min(r, g, b)
        
        # Skip pure black/white
        if max_val < 20 or min_val > 235:
            return False
            
        # Check for color saturation (difference between max and min RGB values)
        color_range = max_val - min_val
        
        # Must have some color variation (not pure gray)
        if color_range < 25:  # More permissive than brand color filter
            return False
        
        # Calculate brightness
        brightness = (r + g + b) / 3
        
        # Allow wider brightness range than brand colors
        if brightness < 30 or brightness > 225:
            return False
            
        return True
        
    except:
        return False


def generate_analogous_color(hex_color: str) -> str:
    """
    Generate an analogous color (similar hue) for the given color.
    
    Args:
        hex_color: Base hex color string
        
    Returns:
        Analogous hex color string
    """
    try:
        r, g, b = hex_to_rgb(hex_color)
        
        # Convert to HSV
        r_norm, g_norm, b_norm = r/255.0, g/255.0, b/255.0
        max_val = max(r_norm, g_norm, b_norm)
        min_val = min(r_norm, g_norm, b_norm)
        diff = max_val - min_val
        
        # Calculate hue
        if diff == 0:
            hue = 0
        elif max_val == r_norm:
            hue = (60 * ((g_norm - b_norm) / diff) + 360) % 360
        elif max_val == g_norm:
            hue = (60 * ((b_norm - r_norm) / diff) + 120) % 360
        else:
            hue = (60 * ((r_norm - g_norm) / diff) + 240) % 360
        
        # Shift hue by 30 degrees for analogous color
        analogous_hue = (hue + 30) % 360
        
        # Keep same saturation and value
        saturation = 0 if max_val == 0 else diff / max_val
        value = max_val
        
        # Convert back to RGB
        c = value * saturation
        x = c * (1 - abs((analogous_hue / 60) % 2 - 1))
        m = value - c
        
        if 0 <= analogous_hue < 60:
            r_analog, g_analog, b_analog = c, x, 0
        elif 60 <= analogous_hue < 120:
            r_analog, g_analog, b_analog = x, c, 0
        elif 120 <= analogous_hue < 180:
            r_analog, g_analog, b_analog = 0, c, x
        elif 180 <= analogous_hue < 240:
            r_analog, g_analog, b_analog = 0, x, c
        elif 240 <= analogous_hue < 300:
            r_analog, g_analog, b_analog = x, 0, c
        else:
            r_analog, g_analog, b_analog = c, 0, x
        
        # Convert to 0-255 range
        r_final = int((r_analog + m) * 255)
        g_final = int((g_analog + m) * 255)
        b_final = int((b_analog + m) * 255)
        
        return f"#{r_final:02x}{g_final:02x}{b_final:02x}"
        
    except:
        # Fallback: just lighten the original color
        r, g, b = hex_to_rgb(hex_color)
        r_final = min(255, int(r * 1.2))
        g_final = min(255, int(g * 1.2))
        b_final = min(255, int(b * 1.2))
        return f"#{r_final:02x}{g_final:02x}{b_final:02x}"


def get_simple_favicon_colors(domain: str) -> Optional[Tuple[str, str, str]]:
    """
    Extract REAL brand colors from favicon - the source of truth!
    Finds all accent colors except black/white, adds grays if needed.
    
    Args:
        domain: Domain to get colors for
        
    Returns:
        Tuple of (primary, secondary, accent) colors or None if not found
    """
    try:
        # Try multiple favicon sources
        favicon_urls = [
            f"https://icons.duckduckgo.com/ip3/{domain}.ico",
            f"https://www.google.com/s2/favicons?domain={domain}&sz=128",
            f"https://www.google.com/s2/favicons?domain={domain}&sz=64",
            f"https://{domain}/favicon.ico",
        ]
        
        for favicon_url in favicon_urls:
            try:
                response = requests.get(favicon_url, timeout=5, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; ColorExtractor/1.0)'
                })
                
                if response.status_code == 200 and len(response.content) > 100:
                    colors = extract_real_favicon_colors(response.content)
                    if colors:
                        return colors
                    # If colors were found but rejected (all gray), stop trying favicons
                    elif colors is False:
                        print("🚫 Favicon is gray, skipping other favicon sources")
                        return None
                        
            except Exception:
                continue
        
        return None
        
    except Exception:
        return None


def extract_real_favicon_colors(image_content: bytes) -> Optional[Tuple[str, str, str]]:
    """
    Extract REAL brand colors from favicon - the source of truth!
    Finds all accent colors except black/white, optimizes for both Light and Dark Mode.
    
    Args:
        image_content: Raw favicon bytes
        
    Returns:
        Tuple of (primary, secondary, accent) colors or None if failed
    """
    try:
        # Load image
        image = Image.open(io.BytesIO(image_content))
        
        # Convert to RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Resize for better processing
        image = image.resize((64, 64))
        
        # Get all pixels
        pixels = list(image.getdata())
        
        # Count color frequency
        pixel_counts = Counter(pixels)
        most_common = pixel_counts.most_common(20)  # Top 20 colors
        
        # Extract and optimize accent colors for both Light and Dark Mode
        accent_colors = []
        for (r, g, b), count in most_common:
            # Skip pure grayscale
            if r == g == b:
                continue
                
            # Skip near black/white
            if r < 15 and g < 15 and b < 15:  # Near black
                continue
            if r > 240 and g > 240 and b > 240:  # Near white
                continue
            
            # Calculate brightness and saturation
            brightness = (r + g + b) / 3
            max_val = max(r, g, b)
            min_val = min(r, g, b)
            saturation = (max_val - min_val) / 255 if max_val > 0 else 0
            
            # Optimize colors for better contrast in both modes
            optimized_r, optimized_g, optimized_b = r, g, b
            
            # For very dark colors: lighten for Dark Mode visibility
            if brightness < 60:
                # Lighten by 70% for better Dark Mode contrast
                optimized_r = min(255, int(r + (255 - r) * 0.7))
                optimized_g = min(255, int(g + (255 - g) * 0.7))
                optimized_b = min(255, int(b + (255 - b) * 0.7))
                print(f"🔧 Darkened color: {r},{g},{b} → {optimized_r},{optimized_g},{optimized_b}")
            
            # For very light colors: darken for Light Mode visibility
            elif brightness > 200:
                # Darken by 40% for better Light Mode contrast
                optimized_r = max(0, int(r * 0.6))
                optimized_g = max(0, int(g * 0.6))
                optimized_b = max(0, int(b * 0.6))
                print(f"🔧 Lightened color: {r},{g},{b} → {optimized_r},{optimized_g},{optimized_b}")
            
            # For low saturation colors: increase saturation
            elif saturation < 0.3:
                # Increase saturation by 50%
                max_val = max(optimized_r, optimized_g, optimized_b)
                min_val = min(optimized_r, optimized_g, optimized_b)
                if max_val > min_val:
                    factor = 1.5
                    optimized_r = min(255, int(min_val + (optimized_r - min_val) * factor))
                    optimized_g = min(255, int(min_val + (optimized_g - min_val) * factor))
                    optimized_b = min(255, int(min_val + (optimized_b - min_val) * factor))
                    print(f"🔧 Increased saturation: {r},{g},{b} → {optimized_r},{optimized_g},{optimized_b}")
                
            hex_color = f"#{optimized_r:02x}{optimized_g:02x}{optimized_b:02x}"
            accent_colors.append(hex_color)
        
        # If we have accent colors, use them
        if accent_colors:
            # Take up to 3 distinct accent colors with improved distance calculation
            distinct_colors = []
            for color in accent_colors:
                if len(distinct_colors) >= 3:
                    break
                    
                # Check if different enough from existing (improved distance)
                is_distinct = True
                for existing in distinct_colors:
                    if color_distance_improved(color, existing) < 40:  # Increased threshold
                        is_distinct = False
                        break
                
                if is_distinct:
                    distinct_colors.append(color)
            
            # Check if any of the colors are actually colorful (not gray)
            colorful_colors = []
            for color in distinct_colors:
                if is_signal_color(color):  # Check if it's actually colorful
                    colorful_colors.append(color)
            
            # If we found actual signal colors, use them
            if colorful_colors:
                # Fill with complementary colors if needed
                while len(colorful_colors) < 3:
                    if len(colorful_colors) == 1:
                        colorful_colors.append(generate_complementary_color(colorful_colors[0]))
                    else:
                        colorful_colors.append(generate_analogous_color(colorful_colors[0]))
                
                print(f"🎨 Found colorful favicon colors: {colorful_colors}")
                return tuple(colorful_colors[:3])
            else:
                # All favicon colors are gray - return False to signal "gray found, skip other favicons"
                print(f"⚠️ Favicon colors are all gray: {distinct_colors}")
                return False
        
        # Fallback: use optimized grays
        return ('#6b7280', '#9ca3af', '#d1d5db')
        
    except Exception as e:
        print(f"⚠️  Real favicon extraction failed: {e}")
        return None


def extract_favicon_colors_simple(domain: str) -> Optional[List[str]]:
    """
    Extract colors from favicon using simple pixel frequency analysis.
    Fast, reliable, no machine learning needed.
    
    Args:
        domain: Domain to analyze
        
    Returns:
        List of hex color strings or None if failed
    """
    # Try multiple favicon sources (works for 99% of domains)
    favicon_urls = [
        f"https://icons.duckduckgo.com/ip3/{domain}.ico",  # DuckDuckGo (often better)
        f"https://www.google.com/s2/favicons?domain={domain}&sz=128",
        f"https://www.google.com/s2/favicons?domain={domain}&sz=64",
        f"https://{domain}/favicon.ico",
    ]
    
    for favicon_url in favicon_urls:
        try:
            response = requests.get(favicon_url, timeout=3, headers={
                'User-Agent': 'Mozilla/5.0 (compatible; ColorExtractor/1.0)'
            })
            
            if response.status_code == 200 and len(response.content) > 100:
                colors = extract_colors_from_image_simple(response.content)
                if colors and len(colors) >= 3:
                    return colors
                    
        except Exception as e:
            print(f"⚠️  Failed favicon from {favicon_url}: {e}")
            continue
    
    return None


def extract_website_colors_simple(domain: str) -> Optional[List[str]]:
    """
    Extract colors from website HTML/CSS - simple regex approach.
    
    Args:
        domain: Domain to analyze
        
    Returns:
        List of hex color strings or None if failed
    """
    try:
        url = f"https://{domain}"
        response = requests.get(url, timeout=5, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; ColorExtractor/1.0)'
        })
        
        if response.status_code != 200:
            return None
            
        html_content = response.text.lower()
        found_colors = set()
        
        # Simple patterns for hex colors in CSS/HTML
        patterns = [
            r'--primary[^:]*:\s*#([0-9a-f]{6})',      # CSS variables
            r'--brand[^:]*:\s*#([0-9a-f]{6})',
            r'background-color:\s*#([0-9a-f]{6})',     # CSS properties
            r'color:\s*#([0-9a-f]{6})',
            r'#([0-9a-f]{6})',                         # Any hex color
        ]
        
        # Look for CSS files and inline styles
        css_patterns = [
            r'<style[^>]*>(.*?)</style>',              # Inline CSS
            r'<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>',  # External CSS files
        ]
        
        # Try to download and analyze CSS files
        css_files = re.findall(r'<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>', html_content)
        for css_file in css_files[:3]:  # Limit to first 3 CSS files
            try:
                if css_file.startswith('//'):
                    css_file = 'https:' + css_file
                elif css_file.startswith('/'):
                    css_file = f'https://{domain}' + css_file
                elif not css_file.startswith('http'):
                    css_file = f'https://{domain}/{css_file}'
                
                css_response = requests.get(css_file, timeout=5, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                
                if css_response.status_code == 200:
                    css_hex_matches = re.findall(r'#([0-9a-f]{6})', css_response.text.lower())
                    for hex_match in css_hex_matches:
                        color = f"#{hex_match}"
                        if is_good_brand_color(color):
                            found_colors.add(color)
            except:
                continue  # Skip failed CSS downloads
        
        for pattern in patterns:
            matches = re.findall(pattern, html_content)
            for match in matches:
                color = f"#{match}"
                if is_good_brand_color(color):
                    found_colors.add(color)
        
        # Extract colors from inline CSS
        for pattern in css_patterns:
            matches = re.findall(pattern, html_content, re.DOTALL)
            for match in matches:
                # Look for hex colors in CSS
                css_hex_matches = re.findall(r'#([0-9a-f]{6})', match.lower())
                for hex_match in css_hex_matches:
                    color = f"#{hex_match}"
                    if is_good_brand_color(color):
                        found_colors.add(color)
        
        if len(found_colors) >= 3:
            return list(found_colors)[:3]
        elif len(found_colors) > 0:
            return list(found_colors)
            
    except Exception as e:
        print(f"⚠️  Website extraction failed for {domain}: {e}")
    
    return None


def extract_colors_from_image_simple(image_content: bytes) -> Optional[List[str]]:
    """
    Extract dominant colors from image using simple pixel frequency counting.
    No machine learning - just count pixels and pick the most common good colors.
    
    Args:
        image_content: Raw image bytes
        
    Returns:
        List of hex color strings or None if failed
    """
    try:
        # Load image
        image = Image.open(io.BytesIO(image_content))
        
        # Convert to RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Resize to speed up processing
        image = image.resize((64, 64))  # Small size = fast processing
        
        # Get all pixels
        pixels = list(image.getdata())
        
        # Filter out bad colors and count frequency
        good_pixels = []
        for r, g, b in pixels:
            color = f"#{r:02x}{g:02x}{b:02x}"
            if is_good_brand_color(color):
                good_pixels.append((r, g, b))
        
        if len(good_pixels) < 5:  # Not enough good pixels
            return None
        
        # Count pixel frequency
        pixel_counts = Counter(good_pixels)
        most_common = pixel_counts.most_common(10)  # Top 10 colors
        
        # Convert to hex and ensure they're different enough
        distinct_colors = []
        for (r, g, b), count in most_common:
            hex_color = f"#{r:02x}{g:02x}{b:02x}"
            
            # Check if this color is different enough from existing ones
            is_distinct = True
            for existing in distinct_colors:
                if color_distance_simple(hex_color, existing) < 50:  # Too similar (lowered threshold)
                    is_distinct = False
                    break
            
            if is_distinct:
                distinct_colors.append(hex_color)
                
            if len(distinct_colors) >= 3:  # We have enough colors
                break
        
        return distinct_colors if len(distinct_colors) >= 2 else None
        
    except Exception as e:
        print(f"⚠️  Image color extraction failed: {e}")
        return None


def is_good_brand_color(hex_color: str) -> bool:
    """
    Improved check if a color is good for branding with better readability filtering.
    Prevents pure white, pure black, and very light/dark colors that make text unreadable.
    
    Args:
        hex_color: Hex color string
        
    Returns:
        True if color is good for branding and readable
    """
    try:
        r, g, b = hex_to_rgb(hex_color)
        
        # Calculate brightness (0-255 scale)
        brightness = (r + g + b) / 3
        
        # Strict filtering for readability
        # Reject pure white/black and very light/dark colors
        if brightness < 50 or brightness > 200:  # Much stricter range for readability
            return False
        
        # Reject colors that are too close to pure white
        if r > 240 and g > 240 and b > 240:  # Near white
            return False
            
        # Reject colors that are too close to pure black  
        if r < 40 and g < 40 and b < 40:  # Near black
            return False
            
        # Filter out grays (colors where R, G, B are too similar)
        max_val = max(r, g, b)
        min_val = min(r, g, b)
        if max_val - min_val < 40:  # Increased threshold for better color distinction
            return False
        
        # Calculate saturation to avoid washed-out colors
        saturation = 0 if max_val == 0 else (max_val - min_val) / max_val
        if saturation < 0.2:  # Reject very unsaturated colors
            return False
            
        return True
        
    except:
        return False


def color_distance_simple(color1: str, color2: str) -> float:
    """
    Simple color distance calculation.
    
    Args:
        color1, color2: Hex color strings
        
    Returns:
        Distance between colors (higher = more different)
    """
    try:
        r1, g1, b1 = hex_to_rgb(color1)
        r2, g2, b2 = hex_to_rgb(color2)
        
        # Simple Euclidean distance
        return ((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2)**0.5
        
    except:
        return 0


def color_distance_improved(color1: str, color2: str) -> float:
    """
    Calculate improved color distance considering brightness and saturation.
    
    Args:
        color1: First color as hex string (e.g., "#ff0000")
        color2: Second color as hex string (e.g., "#00ff00")
        
    Returns:
        Distance value (lower = more similar)
    """
    try:
        # Convert hex to RGB
        r1, g1, b1 = hex_to_rgb(color1)
        r2, g2, b2 = hex_to_rgb(color2)
        
        # Calculate brightness for both colors
        brightness1 = (r1 + g1 + b1) / 3
        brightness2 = (r2 + g2 + b2) / 3
        
        # Calculate saturation for both colors
        max1, min1 = max(r1, g1, b1), min(r1, g1, b1)
        max2, min2 = max(r2, g2, b2), min(r2, g2, b2)
        saturation1 = (max1 - min1) / 255 if max1 > 0 else 0
        saturation2 = (max2 - min2) / 255 if max2 > 0 else 0
        
        # Calculate Euclidean distance
        rgb_distance = ((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) ** 0.5
        
        # Calculate brightness difference (weighted)
        brightness_diff = abs(brightness1 - brightness2) * 0.3
        
        # Calculate saturation difference (weighted)
        saturation_diff = abs(saturation1 - saturation2) * 100 * 0.2
        
        # Combined distance
        total_distance = rgb_distance + brightness_diff + saturation_diff
        
        return total_distance
        
    except:
        return 999.0  # Return high distance for invalid colors


def extract_website_brand_colors(domain: str) -> Optional[List[str]]:
    """
    Extract brand colors from website by analyzing CSS variables, styles, and common brand elements.
    This is the most reliable method for getting actual brand colors.
    
    Args:
        domain: Domain to analyze
        
    Returns:
        List of hex color strings or None if failed
    """
    try:
        url = f"https://{domain}"
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        if response.status_code != 200:
            return None
            
        html_content = response.text.lower()  # Convert to lowercase for easier matching
        found_colors = set()
        
        # Priority 1: CSS Custom Properties (CSS Variables) - most reliable
        css_var_patterns = [
            r'--primary[^:]*:\s*#([0-9a-f]{6})',
            r'--secondary[^:]*:\s*#([0-9a-f]{6})',
            r'--accent[^:]*:\s*#([0-9a-f]{6})',
            r'--brand[^:]*:\s*#([0-9a-f]{6})',
            r'--main[^:]*:\s*#([0-9a-f]{6})',
            r'--theme[^:]*:\s*#([0-9a-f]{6})',
        ]
        
        for pattern in css_var_patterns:
            matches = re.findall(pattern, html_content)
            for match in matches:
                color = f"#{match}"
                if is_valid_brand_color(color):
                    found_colors.add(color)
        
        # Priority 2: Common brand color patterns in CSS
        brand_patterns = [
            r'\.primary[^}]*color:\s*#([0-9a-f]{6})',
            r'\.secondary[^}]*color:\s*#([0-9a-f]{6})',
            r'\.brand[^}]*color:\s*#([0-9a-f]{6})',
            r'\.header[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            r'\.navbar[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            r'\.button[^}]*background[^:]*:\s*#([0-9a-f]{6})',
            r'\.btn-primary[^}]*background[^:]*:\s*#([0-9a-f]{6})',
        ]
        
        for pattern in brand_patterns:
            matches = re.findall(pattern, html_content, re.DOTALL)
            for match in matches:
                color = f"#{match}"
                if is_valid_brand_color(color):
                    found_colors.add(color)
        
        # Priority 3: Any hex colors in style attributes and CSS
        general_patterns = [
            r'style="[^"]*color:\s*#([0-9a-f]{6})',
            r'style="[^"]*background-color:\s*#([0-9a-f]{6})',
            r'background-color:\s*#([0-9a-f]{6})',
            r'color:\s*#([0-9a-f]{6})',
        ]
        
        for pattern in general_patterns:
            matches = re.findall(pattern, html_content)
            for match in matches:
                color = f"#{match}"
                if is_valid_brand_color(color):
                    found_colors.add(color)
        
        # Convert to list and sort by brand relevance
        if len(found_colors) >= 3:
            colors_list = list(found_colors)
            return sort_colors_by_brand_relevance(colors_list)
        elif len(found_colors) > 0:
            return list(found_colors)
            
    except Exception as e:
        print(f"Error extracting website brand colors from {domain}: {e}")
    
    return None


def extract_favicon_colors_advanced(domain: str) -> Optional[List[str]]:
    """
    Extract colors from favicon using Google's Favicon API + K-means clustering.
    This works for 99% of all domains and is completely free.
    
    Args:
        domain: Domain to analyze
        
    Returns:
        List of hex color strings or None if failed
    """
    # Try multiple favicon sources
    favicon_sources = [
        f"https://www.google.com/s2/favicons?domain={domain}&sz=256",  # High res
        f"https://www.google.com/s2/favicons?domain={domain}&sz=128",  # Medium res
        f"https://www.google.com/s2/favicons?domain={domain}&sz=64",   # Standard res
        f"https://{domain}/favicon.ico",  # Direct favicon
        f"https://{domain}/apple-touch-icon.png",  # Apple touch icon
    ]
    
    for favicon_url in favicon_sources:
        try:
            response = requests.get(favicon_url, timeout=5, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code == 200 and len(response.content) > 100:
                colors = extract_colors_with_kmeans(response.content, n_colors=5)
                if colors and len(colors) >= 3:
                    print(f"Found favicon colors from {favicon_url}: {colors}")
                    return colors
                    
        except Exception as e:
            print(f"Failed to get favicon from {favicon_url}: {e}")
            continue
    
    return None


def sort_colors_by_brand_relevance(colors: List[str]) -> List[str]:
    """
    Sort colors by their relevance for branding (better than generic prominence).
    
    Args:
        colors: List of hex color strings
        
    Returns:
        Sorted list with most brand-relevant colors first
    """
    def brand_relevance_score(hex_color: str) -> float:
        """Calculate brand relevance score for a color."""
        r, g, b = hex_to_rgb(hex_color)
        
        # Convert to HSV for better analysis
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        
        # Base score from saturation and brightness
        saturation_score = s * 100  # Higher saturation is better for brands
        brightness_score = 100 - abs(v * 100 - 55)  # Prefer moderate brightness (55% ideal)
        
        # Brand color hue preferences (based on real brand analysis)
        hue_bonus = 0
        hue_degrees = h * 360
        
        if 200 <= hue_degrees <= 250:  # Blues (most popular brand color)
            hue_bonus = 25
        elif 120 <= hue_degrees <= 160:  # Greens (second most popular)
            hue_bonus = 20
        elif 0 <= hue_degrees <= 20 or 340 <= hue_degrees <= 360:  # Reds
            hue_bonus = 18
        elif 280 <= hue_degrees <= 320:  # Purples/Magentas
            hue_bonus = 15
        elif 30 <= hue_degrees <= 60:  # Oranges/Yellows
            hue_bonus = 12
        elif 160 <= hue_degrees <= 200:  # Cyans/Teals
            hue_bonus = 10
        
        # Penalty for colors that are too similar to common web colors
        common_web_colors = ['#ffffff', '#000000', '#f8f9fa', '#e9ecef', '#dee2e6', '#6c757d']
        similarity_penalty = 0
        for web_color in common_web_colors:
            if calculate_color_difference(hex_color, web_color) < 50:
                similarity_penalty = 30
                break
        
        return saturation_score + brightness_score + hue_bonus - similarity_penalty
    
    return sorted(colors, key=brand_relevance_score, reverse=True)


def extract_colors_from_website(domain: str) -> Optional[List[str]]:
    """
    Extract colors from website screenshot using K-means clustering.
    
    Args:
        domain: Domain to analyze
        
    Returns:
        List of hex color strings or None if failed
    """
    try:
        # Use a screenshot service (you might want to implement your own or use a service)
        # For now, we'll use a simple approach by fetching the homepage HTML and extracting inline styles
        url = f"https://{domain}"
        
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        if response.status_code != 200:
            return None
            
        html_content = response.text
        
        # Extract colors from inline styles and style attributes
        color_patterns = [
            r'color:\s*#([0-9a-fA-F]{6})',
            r'background-color:\s*#([0-9a-fA-F]{6})',
            r'border-color:\s*#([0-9a-fA-F]{6})',
            r'#([0-9a-fA-F]{6})',  # Any hex color
        ]
        
        found_colors = set()
        for pattern in color_patterns:
            matches = re.findall(pattern, html_content)
            for match in matches:
                color = f"#{match.lower()}"
                if is_valid_brand_color(color):
                    found_colors.add(color)
        
        if len(found_colors) >= 3:
            # Convert to list and sort by color properties for consistency
            colors_list = list(found_colors)
            return sort_colors_by_prominence(colors_list)[:3]
            
    except Exception as e:
        print(f"Error extracting colors from website {domain}: {e}")
    
    return None


def extract_css_colors(domain: str) -> Optional[List[str]]:
    """
    Extract colors from CSS stylesheets and CSS variables.
    
    Args:
        domain: Domain to analyze
        
    Returns:
        List of hex color strings or None if failed
    """
    try:
        url = f"https://{domain}"
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        if response.status_code != 200:
            return None
            
        html_content = response.text
        
        # Find CSS links
        css_links = re.findall(r'<link[^>]*href=["\']([^"\']*\.css[^"\']*)["\'][^>]*>', html_content)
        
        found_colors = set()
        
        # Extract from inline CSS
        inline_css = re.findall(r'<style[^>]*>(.*?)</style>', html_content, re.DOTALL)
        for css in inline_css:
            colors = extract_colors_from_css_content(css)
            found_colors.update(colors)
        
        # Extract from external CSS files (limit to first 3 to avoid too many requests)
        for css_link in css_links[:3]:
            try:
                if css_link.startswith('//'):
                    css_url = f"https:{css_link}"
                elif css_link.startswith('/'):
                    css_url = f"https://{domain}{css_link}"
                elif css_link.startswith('http'):
                    css_url = css_link
                else:
                    css_url = f"https://{domain}/{css_link}"
                
                css_response = requests.get(css_url, timeout=5, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                
                if css_response.status_code == 200:
                    colors = extract_colors_from_css_content(css_response.text)
                    found_colors.update(colors)
                    
            except Exception as e:
                print(f"Error fetching CSS from {css_link}: {e}")
                continue
        
        if len(found_colors) >= 3:
            colors_list = list(found_colors)
            return sort_colors_by_prominence(colors_list)[:3]
            
    except Exception as e:
        print(f"Error extracting CSS colors from {domain}: {e}")
    
    return None


def extract_colors_from_css_content(css_content: str) -> set:
    """
    Extract hex colors from CSS content.
    
    Args:
        css_content: CSS text content
        
    Returns:
        Set of hex color strings
    """
    colors = set()
    
    # CSS color patterns
    patterns = [
        r'--[^:]*:\s*#([0-9a-fA-F]{6})',  # CSS variables
        r'color:\s*#([0-9a-fA-F]{6})',
        r'background-color:\s*#([0-9a-fA-F]{6})',
        r'background:\s*#([0-9a-fA-F]{6})',
        r'border-color:\s*#([0-9a-fA-F]{6})',
        r'border:\s*[^#]*#([0-9a-fA-F]{6})',
        r'box-shadow:\s*[^#]*#([0-9a-fA-F]{6})',
        r'#([0-9a-fA-F]{6})',  # Any hex color
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, css_content, re.IGNORECASE)
        for match in matches:
            color = f"#{match.lower()}"
            if is_valid_brand_color(color):
                colors.add(color)
    
    return colors


def extract_logo_colors_advanced(domain: str) -> Optional[List[str]]:
    """
    Advanced logo color extraction using K-means clustering.
    
    Args:
        domain: Domain to analyze
        
    Returns:
        List of hex color strings or None if failed
    """
    # Try multiple logo sources
    logo_sources = [
        f"https://logo.clearbit.com/{domain}",
        f"https://www.google.com/s2/favicons?domain={domain}&sz=256",
        f"https://{domain}/favicon.ico",
        f"https://{domain}/apple-touch-icon.png",
        f"https://{domain}/logo.png",
        f"https://{domain}/assets/logo.png",
        f"https://{domain}/images/logo.png",
    ]
    
    for logo_url in logo_sources:
        try:
            response = requests.get(logo_url, timeout=5, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code == 200 and len(response.content) > 100:
                colors = extract_colors_with_kmeans(response.content)
                if colors and len(colors) >= 3:
                    print(f"Found logo colors from {logo_url}: {colors}")
                    return colors
                    
        except Exception as e:
            print(f"Failed to get logo from {logo_url}: {e}")
            continue
    
    return None


def extract_colors_with_kmeans(image_content: bytes, n_colors: int = 5) -> Optional[List[str]]:
    """
    Extract dominant colors using K-means clustering.
    
    Args:
        image_content: Raw image bytes
        n_colors: Number of colors to extract
        
    Returns:
        List of hex color strings or None if failed
    """
    try:
        # Load and process image
        image = Image.open(io.BytesIO(image_content))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Resize for faster processing
        image = image.resize((150, 150))
        
        # Convert to numpy array
        pixels = np.array(image).reshape(-1, 3)
        
        # Filter out near-white and near-black pixels
        filtered_pixels = []
        for r, g, b in pixels:
            brightness = (r + g + b) / 3
            # More refined filtering
            if not ((r > 240 and g > 240 and b > 240) or  # Near white
                   (r < 20 and g < 20 and b < 20) or      # Near black
                   brightness > 230 or brightness < 30):   # Very bright or dark
                filtered_pixels.append([r, g, b])
        
        if len(filtered_pixels) < 10:  # Not enough valid pixels
            return None
            
        filtered_pixels = np.array(filtered_pixels)
        
        # Apply K-means clustering
        kmeans = KMeans(n_clusters=min(n_colors, len(filtered_pixels)), random_state=42, n_init=10)
        kmeans.fit(filtered_pixels)
        
        # Get cluster centers (dominant colors)
        colors = kmeans.cluster_centers_.astype(int)
        
        # Convert to hex and filter valid brand colors
        hex_colors = []
        for color in colors:
            r, g, b = color
            hex_color = f"#{r:02x}{g:02x}{b:02x}"
            if is_valid_brand_color(hex_color):
                hex_colors.append(hex_color)
        
        # Sort by color properties for consistency
        if len(hex_colors) >= 3:
            return sort_colors_by_prominence(hex_colors)[:3]
        elif len(hex_colors) > 0:
            return hex_colors
            
    except Exception as e:
        print(f"Error in K-means color extraction: {e}")
    
    return None


def is_valid_brand_color(hex_color: str) -> bool:
    """
    Check if a color is suitable as a brand color with improved readability filtering.
    
    Args:
        hex_color: Hex color string
        
    Returns:
        True if color is suitable for branding and readable
    """
    r, g, b = hex_to_rgb(hex_color)
    
    # Calculate brightness and saturation
    brightness = (r + g + b) / 3
    max_val = max(r, g, b)
    min_val = min(r, g, b)
    saturation = 0 if max_val == 0 else (max_val - min_val) / max_val
    
    # Stricter filter criteria for readable brand colors
    if brightness < 50 or brightness > 200:  # Stricter range for readability
        return False
        
    # Reject colors too close to pure white
    if r > 240 and g > 240 and b > 240:
        return False
        
    # Reject colors too close to pure black
    if r < 40 and g < 40 and b < 40:
        return False
        
    if saturation < 0.2:  # Increased saturation threshold
        return False
        
    if max_val - min_val < 40:  # Increased threshold for color distinction
        return False
        
    return True


def sort_colors_by_prominence(colors: List[str]) -> List[str]:
    """
    Sort colors by prominence for brand usage.
    
    Args:
        colors: List of hex color strings
        
    Returns:
        Sorted list with most prominent colors first
    """
    def color_score(hex_color: str) -> float:
        """Calculate prominence score for a color."""
        r, g, b = hex_to_rgb(hex_color)
        
        # Convert to HSV for better analysis
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        
        # Prefer colors with good saturation and moderate brightness
        saturation_score = s * 100  # Higher saturation is better
        brightness_score = 100 - abs(v * 100 - 60)  # Prefer moderate brightness
        
        # Bonus for common brand color hues
        hue_bonus = 0
        hue_degrees = h * 360
        if 200 <= hue_degrees <= 260:  # Blues
            hue_bonus = 20
        elif 120 <= hue_degrees <= 180:  # Greens
            hue_bonus = 15
        elif 0 <= hue_degrees <= 30 or 330 <= hue_degrees <= 360:  # Reds
            hue_bonus = 15
        elif 270 <= hue_degrees <= 320:  # Purples
            hue_bonus = 10
        
        return saturation_score + brightness_score + hue_bonus
    
    return sorted(colors, key=color_score, reverse=True)


def get_professional_colors_three(domain: str) -> Tuple[str, str, str]:
    """
    Get professional three-color palette based on domain hash.
    
    Args:
        domain: Domain name for consistent color selection
        
    Returns:
        Tuple of (primary_color, secondary_color, accent_color) as hex strings
    """
    # Professional three-color palettes - more vibrant colors
    professional_palettes = [
        ('#3b82f6', '#1d4ed8', '#60a5fa'),  # Blue variants (Planity-style)
        ('#10b981', '#059669', '#34d399'),  # Green variants
        ('#ef4444', '#dc2626', '#f87171'),  # Red variants (Bauhaus-style)
        ('#8b5cf6', '#7c3aed', '#a78bfa'),  # Purple variants
        ('#f97316', '#ea580c', '#fb923c'),  # Orange variants
        ('#06b6d4', '#0891b2', '#22d3ee'),  # Cyan variants
        ('#ec4899', '#be185d', '#f472b6'),  # Pink variants
        ('#6366f1', '#4f46e5', '#818cf8'),  # Indigo variants
        ('#14b8a6', '#0f766e', '#5eead4'),  # Teal variants
        ('#f59e0b', '#d97706', '#fbbf24'),  # Amber variants
    ]
    
    # Select based on domain hash for consistency
    palette_index = hash(domain) % len(professional_palettes)
    return professional_palettes[palette_index]


def extract_logo_colors(domain: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Extract dominant colors from company logo using 5-tier robust strategy.
    
    Tries multiple logo sources in order of reliability:
    1. Official favicon.ico (most reliable)
    2. Official logo API (Clearbit, etc.)
    3. Official brand API (Google, etc.)
    4. Website search (meta tags, etc.)
    5. Professional fallback (always works)
    
    Args:
        domain: Clean domain name
        
    Returns:
        Tuple of (primary_color, secondary_color) as hex strings, or (None, None) if failed
    """
    print(f"🔍 Extracting logo colors for: {domain}")
    
    # Strategy 1: Official favicon.ico (most reliable)
    try:
        favicon_url = f"https://{domain}/favicon.ico"
        response = requests.get(favicon_url, timeout=5, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        if response.status_code == 200 and len(response.content) > 100:  # Valid favicon
            print(f"✅ Official favicon found: {favicon_url}")
            return _process_logo_image(response.content)
    except Exception as e:
        print(f"❌ Official favicon failed: {e}")
    
    # Strategy 2: Official logo API (Clearbit)
    try:
        clearbit_url = f"https://logo.clearbit.com/{domain}"
        response = requests.get(clearbit_url, timeout=5, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        if response.status_code == 200 and len(response.content) > 100:
            print(f"✅ Official logo API found: {clearbit_url}")
            return _process_logo_image(response.content)
    except Exception as e:
        print(f"❌ Official logo API failed: {e}")
    
    # Strategy 3: Official brand API (Google, etc.)
    try:
        google_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
        response = requests.get(google_url, timeout=5, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        if response.status_code == 200 and len(response.content) > 100:
            print(f"✅ Official brand API found: {google_url}")
            return _process_logo_image(response.content)
    except Exception as e:
        print(f"❌ Official brand API failed: {e}")
    
    # Strategy 3.5: Try Clearbit with different sizes
    try:
        clearbit_large_url = f"https://logo.clearbit.com/{domain}?size=200"
        response = requests.get(clearbit_large_url, timeout=5, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        if response.status_code == 200 and len(response.content) > 100:
            print(f"✅ Clearbit large logo found: {clearbit_large_url}")
            return _process_logo_image(response.content)
    except Exception as e:
        print(f"❌ Clearbit large logo failed: {e}")
    
    # Strategy 4: Website search (meta tags, etc.)
    try:
        website_url = f"https://{domain}"
        response = requests.get(website_url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        if response.status_code == 200:
            # Look for favicon in HTML
            favicon_patterns = [
                r'<link[^>]*rel=["\']icon["\'][^>]*href=["\']([^"\']+)["\']',
                r'<link[^>]*href=["\']([^"\']*favicon[^"\']*)["\'][^>]*rel=["\']icon["\']',
                r'<link[^>]*rel=["\']shortcut icon["\'][^>]*href=["\']([^"\']+)["\']'
            ]
            
            for pattern in favicon_patterns:
                matches = re.findall(pattern, response.text, re.IGNORECASE)
                for match in matches:
                    # Convert relative URLs to absolute
                    if match.startswith('//'):
                        favicon_url = f"https:{match}"
                    elif match.startswith('/'):
                        favicon_url = f"https://{domain}{match}"
                    elif match.startswith('http'):
                        favicon_url = match
                    else:
                        favicon_url = f"https://{domain}/{match}"
                    
                    try:
                        favicon_response = requests.get(favicon_url, timeout=5, headers={
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        })
                        if favicon_response.status_code == 200 and len(favicon_response.content) > 100:
                            print(f"✅ Website favicon found: {favicon_url}")
                            return _process_logo_image(favicon_response.content)
                    except:
                        continue
    except Exception as e:
        print(f"❌ Website search failed: {e}")
    
    # Strategy 5: Professional fallback (always works)
    print(f"⚠️  All logo sources failed for {domain}, using professional fallback")
    return None, None


def _process_logo_image(image_content: bytes) -> Tuple[Optional[str], Optional[str]]:
    """
    Process logo image and extract colors with robust error handling.
    
    Args:
        image_content: Raw image bytes
        
    Returns:
        Tuple of (primary_color, secondary_color) as hex strings, or (None, None) if failed
    """
    try:
        # Load and process image with robust error handling
        image = Image.open(io.BytesIO(image_content))
        
        # Handle different image modes robustly
        if image.mode in ('RGBA', 'LA'):
            # Create white background for transparent images
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'RGBA':
                background.paste(image, mask=image.split()[-1])  # Use alpha channel as mask
            else:
                background.paste(image, mask=image.split()[-1])
            image = background
        elif image.mode == 'P':
            # Convert palette mode to RGB
            image = image.convert('RGB')
        elif image.mode != 'RGB':
            # Convert any other mode to RGB
            image = image.convert('RGB')
            
        # Resize for faster processing
        image = image.resize((150, 150))
        
        # Get all pixels and filter out white/black/light colors
        pixels = list(image.getdata())
        filtered_pixels = []
        
        for r, g, b in pixels:
            # Skip near-white, near-black, very light, and very dark colors
            brightness = (r + g + b) / 3
            if not ((r > 240 and g > 240 and b > 240) or  # Near white
                   (r < 30 and g < 30 and b < 30) or      # Near black
                   (r > 230 and g > 230 and b > 230) or   # Very light
                   brightness < 40 or                      # Very dark colors
                   brightness > 220):                      # Very bright colors
                
                # Optimize color for better contrast
                optimized_r, optimized_g, optimized_b = r, g, b
                
                # For very dark colors: lighten for better visibility
                if brightness < 80:
                    optimized_r = min(255, int(r + (255 - r) * 0.6))
                    optimized_g = min(255, int(g + (255 - g) * 0.6))
                    optimized_b = min(255, int(b + (255 - b) * 0.6))
                
                # For very light colors: darken for better visibility
                elif brightness > 180:
                    optimized_r = max(0, int(r * 0.7))
                    optimized_g = max(0, int(g * 0.7))
                    optimized_b = max(0, int(b * 0.7))
                
                filtered_pixels.append((optimized_r, optimized_g, optimized_b))
        
        if filtered_pixels:
            # Count color frequency
            color_counts = Counter(filtered_pixels)
            most_common = color_counts.most_common(10)
            
            # Convert to hex and find distinct colors
            hex_colors = []
            for (r, g, b), count in most_common:
                hex_color = f"#{r:02x}{g:02x}{b:02x}"
                
                # Check if this color is distinct enough from existing ones
                is_distinct = True
                for existing_color in hex_colors:
                    # Use improved color distance calculation
                    color_distance = color_distance_improved(hex_color, existing_color)
                    
                    # Colors must be sufficiently different
                    if color_distance < 60:  # Optimized threshold
                        is_distinct = False
                        break
                
                if is_distinct:
                    hex_colors.append(hex_color)
                    
                if len(hex_colors) >= 2:
                    break
            
            # Return colors based on what we found
            if len(hex_colors) >= 2:
                print(f"Found {len(hex_colors)} distinct colors: {hex_colors}")
                return hex_colors[0], hex_colors[1]
            elif len(hex_colors) == 1:
                # Generate complementary color
                primary = hex_colors[0]
                secondary = generate_complementary_color(primary)
                print(f"Generated complementary color for {primary}: {secondary}")
                return primary, secondary
            else:
                # If no distinct colors found, try with lower thresholds
                print("No distinct colors found with strict criteria, trying with relaxed criteria...")
                for (r, g, b), count in most_common[:5]:  # Try top 5 colors
                    hex_color = f"#{r:02x}{g:02x}{b:02x}"
                    
                    # Check if this color is different enough (relaxed criteria)
                    is_different = True
                    for existing_color in hex_colors:
                        existing_rgb = tuple(int(existing_color[i:i+2], 16) for i in (1, 3, 5))
                        color_distance = ((r - existing_rgb[0])**2 + 
                                        (g - existing_rgb[1])**2 + 
                                        (b - existing_rgb[2])**2)**0.5
                        
                        if color_distance < 60:  # Much more relaxed threshold
                            is_different = False
                            break
                    
                    if is_different:
                        hex_colors.append(hex_color)
                        
                    if len(hex_colors) >= 2:
                        print(f"Found colors with relaxed criteria: {hex_colors}")
                        return hex_colors[0], hex_colors[1]
                
                # Last resort: use first color and generate complementary
                if most_common:
                    r, g, b = most_common[0][0]
                    primary = f"#{r:02x}{g:02x}{b:02x}"
                    secondary = generate_complementary_color(primary)
                    print(f"Last resort: using {primary} and generated {secondary}")
                    return primary, secondary
                    
    except Exception as e:
        print(f"Error extracting colors from logo: {e}")
        # Try alternative approach for problematic images
        try:
            # Try with different image loading approach
            from PIL import ImageFile
            ImageFile.LOAD_TRUNCATED_IMAGES = True
            
            image = Image.open(io.BytesIO(image_content))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Simple color extraction as fallback
            image = image.resize((64, 64))
            pixels = list(image.getdata())
            
            # Get most common colors
            color_counts = Counter(pixels)
            most_common = color_counts.most_common(5)
            
            # Filter out white/black/very light colors
            filtered_colors = []
            for (r, g, b), count in most_common:
                brightness = (r + g + b) / 3
                if 50 < brightness < 200:  # Not too dark, not too light
                    hex_color = f"#{r:02x}{g:02x}{b:02x}"
                    filtered_colors.append(hex_color)
            
            if len(filtered_colors) >= 2:
                print(f"Fallback extraction successful: {filtered_colors[:2]}")
                return filtered_colors[0], filtered_colors[1]
            elif len(filtered_colors) == 1:
                secondary = generate_complementary_color(filtered_colors[0])
                return filtered_colors[0], secondary
                
        except Exception as e2:
            print(f"Fallback extraction also failed: {e2}")
    
    return None, None


def generate_complementary_color(hex_color: str) -> str:
    """
    Generate a complementary color using color theory principles.
    
    Args:
        hex_color: Hex color string (e.g., '#ff0000')
        
    Returns:
        Complementary hex color string
    """
    r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (1, 3, 5))
    
    # Convert to HSV for better color manipulation
    r_norm, g_norm, b_norm = r/255.0, g/255.0, b/255.0
    
    # Find max and min values
    max_val = max(r_norm, g_norm, b_norm)
    min_val = min(r_norm, g_norm, b_norm)
    diff = max_val - min_val
    
    # Calculate hue
    if diff == 0:
        hue = 0
    elif max_val == r_norm:
        hue = (60 * ((g_norm - b_norm) / diff) + 360) % 360
    elif max_val == g_norm:
        hue = (60 * ((b_norm - r_norm) / diff) + 120) % 360
    else:
        hue = (60 * ((r_norm - g_norm) / diff) + 240) % 360
    
    # Calculate saturation and value
    saturation = 0 if max_val == 0 else diff / max_val
    value = max_val
    
    # Generate complementary color by shifting hue by 180 degrees
    # and adjusting saturation/value for better contrast
    comp_hue = (hue + 180) % 360
    comp_saturation = min(1.0, saturation + 0.2)  # Increase saturation slightly
    comp_value = 0.8 if value > 0.5 else min(1.0, value + 0.3)  # Adjust brightness for contrast
    
    # Convert back to RGB
    c = comp_value * comp_saturation
    x = c * (1 - abs((comp_hue / 60) % 2 - 1))
    m = comp_value - c
    
    if 0 <= comp_hue < 60:
        r_comp, g_comp, b_comp = c, x, 0
    elif 60 <= comp_hue < 120:
        r_comp, g_comp, b_comp = x, c, 0
    elif 120 <= comp_hue < 180:
        r_comp, g_comp, b_comp = 0, c, x
    elif 180 <= comp_hue < 240:
        r_comp, g_comp, b_comp = 0, x, c
    elif 240 <= comp_hue < 300:
        r_comp, g_comp, b_comp = x, 0, c
    else:
        r_comp, g_comp, b_comp = c, 0, x
    
    # Convert to 0-255 range
    r_final = int((r_comp + m) * 255)
    g_final = int((g_comp + m) * 255)
    b_final = int((b_comp + m) * 255)
    
    return f"#{r_final:02x}{g_final:02x}{b_final:02x}"


def get_professional_colors(domain: str) -> Tuple[str, str]:
    """
    Get professional color palette based on domain hash (legacy 2-color version).
    
    Args:
        domain: Domain name for consistent color selection
        
    Returns:
        Tuple of (primary_color, secondary_color) as hex strings
    """
    # Get three colors and return first two for backward compatibility
    three_colors = get_professional_colors_three(domain)
    return three_colors[0], three_colors[1]


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """
    Convert RGB values to hex color string.
    
    Args:
        r, g, b: RGB color values (0-255)
        
    Returns:
        Hex color string (e.g., '#ff0000')
    """
    return f"#{r:02x}{g:02x}{b:02x}"


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """
    Convert hex color string to RGB values.
    
    Args:
        hex_color: Hex color string (e.g., '#ff0000')
        
    Returns:
        Tuple of (r, g, b) values (0-255)
    """
    return tuple(int(hex_color[i:i+2], 16) for i in (1, 3, 5))


def calculate_color_difference(color1: str, color2: str) -> int:
    """
    Calculate the difference between two hex colors.
    
    Args:
        color1, color2: Hex color strings
        
    Returns:
        Color difference as integer (higher = more different)
    """
    rgb1 = hex_to_rgb(color1)
    rgb2 = hex_to_rgb(color2)
    return sum(abs(a - b) for a, b in zip(rgb1, rgb2))
