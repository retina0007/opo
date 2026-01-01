// Event Listeners - Centralized Event Management

// Register browser session with backend for webhook routing
function registerBrowserSession(browserSessionId) {
    console.log('🔧 Registering browser session:', browserSessionId);
    
    fetch('/api/register-browser-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            browser_session_id: browserSessionId,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Browser session registered:', data);
    })
    .catch(error => {
        console.error('❌ Failed to register browser session:', error);
    });
}
function initializeEventListeners() {
    console.log('🎯 Initializing event listeners...');
    
    // Dark Mode Toggle
    initializeDarkModeToggle();

    // Voice Button Event Listener
    setupVoiceButtonListener();

    // Chat Event Listeners
    setupChatListeners();

    // VAPI Widget Monitoring
    setupVapiWidgetMonitoring();

    console.log('✅ Event listeners initialized successfully!');
}

function setupVoiceButtonListener() {
    const voiceButton = document.getElementById('voiceButton');
    if (voiceButton) {
        voiceButton.addEventListener('click', () => {
            console.log('Voice button clicked, vapi:', !!window.vapi, 'isCallActive:', window.isCallActive);
            
            if (!window.vapi) {
                showToast('Voice Info', 'Sprachfunktion nicht verfügbar - bitte Chat verwenden', 'warning');
                return;
            }

            if (window.isCallActive) {
                // Stop the current voice call
                console.log('Stopping voice call...');
                endVoiceCall();
            } else {
                // Start a new voice call - voice-functions.js handles the context
                console.log('Starting voice call via voice button');
                startVoiceCall();
            }
        });
    } else {
        console.error('Voice button not found!');
    }
}

function setupChatListeners() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    console.log('Chat elements found:', { chatInput: !!chatInput, sendButton: !!sendButton });

    if (sendButton) {
        // Handle click events (desktop)
        sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Send button clicked!');
            handleSendMessage();
        });
        
        // Handle touch events (mobile)
        sendButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            console.log('Send button touched!');
            handleSendMessage();
        });
    }
    
    // Common send message handler
    function handleSendMessage() {
        const message = chatInput ? chatInput.value.trim() : '';
        if (message) {
            console.log('Sending message:', message);
            if (typeof sendChatMessage === 'function') {
                sendChatMessage(message);
            } else {
                console.error('sendChatMessage function not found!');
                // Fallback: direkt Chat-Message hinzufügen
                addChatMessage(message, 'user');
                setTimeout(() => {
                    addChatMessage(`Echo: ${message}`, 'assistant');
                }, 1000);
            }
            if (chatInput) chatInput.value = '';
        } else {
            console.log('No message to send');
        }
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter pressed!');
                const message = chatInput.value.trim();
                if (message) {
                    console.log('Sending message via Enter:', message);
                    sendChatMessage(message);
                    chatInput.value = '';
                }
            }
        });
    }
}

// Create VAPI Session with assistant overrides
async function createVapiSession() {
    console.log('📋 Creating VAPI session with assistant overrides...');
    
    if (!window.VAPI_CONFIG) {
        console.error('❌ VAPI_CONFIG not available for session creation');
        return;
    }
    
    try {
        const response = await fetch('/api/create-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Send all variable values from VAPI_CONFIG
                ...window.VAPI_CONFIG.assistantOverrides.variableValues,
                // Ensure conversation_context has a value (Vapi doesn't transmit empty strings)
                conversation_context: window.VAPI_CONFIG.assistantOverrides.variableValues.conversation_context || 'Keine vorherigen Nachrichten'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.sessionId) {
                window.vapiSessionId = data.sessionId;
                window.vapiSessionCreated = true;
                console.log('✅ VAPI session created:', data.sessionId);
                console.log('📋 Session created with variables:', window.VAPI_CONFIG.assistantOverrides.variableValues);
            }
        } else {
            console.error('❌ Failed to create VAPI session:', response.status);
        }
    } catch (error) {
        console.error('❌ Error creating VAPI session:', error);
    }
}

// App Initialization
function initializeApp() {
    console.log('🚀 Initializing VAPI Web App...');
    
    // Initialize chat history first
    if (window.initializeChatHistory) {
        window.initializeChatHistory();
    }
    
    // Load credentials and initialize when page loads
    if (typeof loadVapiCredentials === 'function') {
        loadVapiCredentials();
    }
    if (typeof checkConfigurationStatus === 'function') {
        checkConfigurationStatus();
    }
    if (typeof createVapiSession === 'function') {
        createVapiSession(); // Create session on page load
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    console.log('✅ VAPI Web App initialized successfully!');
}

// Make functions globally accessible
window.initializeEventListeners = initializeEventListeners;
window.setupVoiceButtonListener = setupVoiceButtonListener;
window.setupChatListeners = setupChatListeners;
window.createVapiSession = createVapiSession;
window.initializeApp = initializeApp;
