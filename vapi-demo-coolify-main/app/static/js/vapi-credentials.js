// VAPI Credentials Management
var vapiInstance = null;
var assistant = null;
var apiKey = null;

// Load VAPI credentials securely from backend
async function loadVapiCredentials() {
    try {
        const response = await fetch('/api/public-config');
        const config = await response.json();
        assistant = config.assistantId;
        apiKey = config.publicKey;
        console.log('✅ VAPI credentials loaded securely');
        initializeVapiWidget();
    } catch (error) {
        console.error('❌ Failed to load VAPI credentials:', error);
        // Fallback to placeholder values for development
        assistant = "your-assistant-id-here";
        apiKey = "your-public-key-here";
        initializeVapiWidget();
    }
}

function initializeVapiWidget() {
    if (!assistant || !apiKey) {
        console.error('❌ VAPI credentials not available');
        return;
    }
    
    const buttonConfig = {
    position: "bottom-right", // Keep it floating but hidden
    width: "1px", // Make it invisible
    height: "1px", // Make it invisible
    opacity: 0, // Hide it completely
    idle: {
        color: `linear-gradient(to top, #D988B9, #B9A9D9)`,
        type: "pill", // or "round"
        title: "Sprechen Sie mit uns!", // Title for the button
        subtitle: "Klicken Sie hier", // Subtitle for the button
        icon: `https://unpkg.com/lucide@latest/dist/esm/icons/phone.js`, // Icon for the button
    },
    loading: {
        color: `linear-gradient(to top, #D988B9, #B9A9D9)`,
        type: "pill", // or "round"
        title: "Verbinde...", // Title for the button
        subtitle: "Bitte warten", // Subtitle for the button
        icon: `https://unpkg.com/lucide@latest/dist/esm/icons/loader-2.js`, // Icon for the button
    },
    active: {
        color: `linear-gradient(to top, #D988B9, #B9A9D9)`,
        type: "pill", // or "round"
        title: "Sprechen...", // Title for the button
        subtitle: "Klicken zum Beenden", // Subtitle for the button
        icon: `https://unpkg.com/lucide@latest/dist/esm/icons/phone-off.js`, // Icon for the button
    },
};

(function (d, t) {
    var g = document.createElement(t),
        s = d.getElementsByTagName(t)[0];
    g.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g, s);

    g.onload = function () {
        console.log('VAPI Official SDK loaded successfully!');
        
        // Initialize VAPI instance with central configuration
        if (!window.VAPI_CONFIG) {
            console.error('❌ VAPI_CONFIG not found! Make sure scripts are loaded in correct order.');
            return;
        }
        
        console.log('📋 Using VAPI_CONFIG for initialization:', window.VAPI_CONFIG.assistantOverrides.variableValues);
        
        vapiInstance = window.vapiSDK.run({
            apiKey: apiKey, // mandatory
            assistant: assistant, // mandatory
            config: buttonConfig, // optional
            assistantOverrides: window.VAPI_CONFIG.assistantOverrides // USE CENTRAL CONFIG
        });
        console.log('VAPI Voice Widget initialized:', vapiInstance);
        
        // Store VAPI instance globally for event listeners
        window.vapi = vapiInstance;
        window.vapiInstance = vapiInstance;
        
        // Setup VAPI Voice Event Listeners for transcripts
        if (typeof setupVoiceEventListeners === 'function') {
            console.log('🎯 Setting up VAPI Event Listeners...');
            setupVoiceEventListeners();
        } else {
            console.warn('⚠️ setupVoiceEventListeners not available - voice-functions.js might not be loaded yet');
            // Multiple fallback attempts to ensure event listeners are setup
            const attempts = [200, 500, 1000, 2000];
            attempts.forEach((delay, index) => {
                setTimeout(() => {
                    if (typeof setupVoiceEventListeners === 'function') {
                        // console.log(`🎯 Setting up VAPI Event Listeners (attempt ${index + 1})...`);
                        setupVoiceEventListeners();
                    } else if (index === attempts.length - 1) {
                        console.error('❌ Failed to setup VAPI Event Listeners - setupVoiceEventListeners function not found');
                    }
                }, delay);
            });
        }
        
        // Setup VAPI Widget monitoring for our custom button
        if (typeof setupVapiWidgetMonitoring === 'function') {
            setupVapiWidgetMonitoring();
        } else {
            // Fallback: Setup monitoring after function is defined
            setTimeout(() => {
                if (typeof setupVapiWidgetMonitoring === 'function') {
                    setupVapiWidgetMonitoring();
                }
            }, 100);
        }
        
        // Hide the floating widget and activate our custom button
        setTimeout(() => {
            // Hide only the floating VAPI widget, not our containers
            const floatingWidgets = document.querySelectorAll('button[class*="vapi-btn"]');
            floatingWidgets.forEach(widget => {
                widget.style.display = 'none'; // Hide only the floating widget
            });
            
            // Ensure our containers stay visible
            const voiceContainer = document.querySelector('.glass-effect');
            if (voiceContainer) {
                voiceContainer.style.display = 'flex';
                voiceContainer.style.visibility = 'visible';
                voiceContainer.style.opacity = '1';
            }
            
            const buttonContainer = document.querySelector('.vapi-widget-container');
            if (buttonContainer) {
                buttonContainer.style.display = 'block';
                buttonContainer.style.visibility = 'visible';
                buttonContainer.style.opacity = '1';
            }
            
            // Show and activate our custom button
            const customButton = document.getElementById('vapiVoiceButton');
            if (customButton) {
                customButton.style.display = 'block';
                
                // Remove any wave animations that VAPI might create (one-time setup)
                if (typeof removeAllWaves === 'function') {
                    removeAllWaves();
                }
                customButton.style.opacity = '1';
                customButton.style.visibility = 'visible';
                document.body.classList.add('vapi-button-ready');
                customButton.disabled = false;
                
                // Fix voice icon positioning to ensure it stays centered
                const voiceIcon = document.getElementById('vapiVoiceIcon');
                if (voiceIcon) {
                    voiceIcon.style.position = 'relative';
                    voiceIcon.style.top = 'auto';
                    voiceIcon.style.left = 'auto';
                    voiceIcon.style.transform = 'none';
                    voiceIcon.style.display = 'flex';
                    voiceIcon.style.alignItems = 'center';
                    voiceIcon.style.justifyContent = 'center';
                    voiceIcon.style.width = '100%';
                    voiceIcon.style.height = '100%';
                }
                
                // Add click handler to trigger VAPI
                customButton.onclick = function() {
                    console.log('🔘 Custom button clicked - triggering VAPI widget');
                    if (vapiInstance) {
                        // Find and trigger the VAPI widget
                        const vapiWidget = document.querySelector('button[class*="vapi-btn"]');
                        if (vapiWidget) {
                            console.log('📞 Triggering VAPI widget click');
                            vapiWidget.click();
                        } else {
                            console.log('❌ VAPI widget not found');
                        }
                    } else {
                        console.log('❌ VAPI instance not available');
                    }
                };
            }
            
            console.log('Custom button activated with VAPI integration');
        }, 1000);
        
        // Show success message
        if (window.showToast) {
            window.showToast('Voice Ready', 'Voice Button ist bereit!', 'success');
        }
    };
    
    g.onerror = function() {
        console.error('Failed to load official VAPI SDK');
        // Keep our custom button visible as fallback
        const customButton = document.getElementById('vapiVoiceButton');
        if (customButton) {
            customButton.style.display = 'block';
            customButton.style.opacity = '1';
            customButton.style.visibility = 'visible';
            document.body.classList.add('vapi-button-ready');
        }
    };
})(document, "script");
}

// Make functions globally accessible
window.loadVapiCredentials = loadVapiCredentials;
window.initializeVapiWidget = initializeVapiWidget;
