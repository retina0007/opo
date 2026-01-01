// Chat Functions - Ursprüngliches Design mit Voice-Integration
function addChatMessage(message, sender) {
    addChatMessageWithSource(message, sender, 'chat');
}

// Format message content to make links clickable and improve readability
function formatMessageContent(message) {
    if (!message) return '';
    
    // First, handle markdown-style links [text](url) - these should not be double-processed
    let formatted = message.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 hover:underline font-medium">$1</a>');
    
    // Then, handle standalone URLs that are not already inside <a> tags
    // Split the text by existing <a> tags to avoid double-processing
    const parts = formatted.split(/(<a[^>]*>.*?<\/a>)/g);
    
    for (let i = 0; i < parts.length; i += 2) { // Only process non-link parts
        if (parts[i]) {
            // Process URLs in this part
            const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+)(?=[\s.,;:!?)\]}]|$)/g;
            
            parts[i] = parts[i].replace(urlRegex, (url) => {
                // Clean up the URL and add protocol if missing
                let cleanUrl = url.trim();
                let href = cleanUrl;
                
                // Add protocol for www. URLs
                if (cleanUrl.startsWith('www.')) {
                    href = 'https://' + cleanUrl;
                }
                
                // Ensure URL is valid
                try {
                    new URL(href);
                    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 hover:underline font-medium">${cleanUrl}</a>`;
                } catch (e) {
                    // If URL is invalid, return as plain text
                    return cleanUrl;
                }
            });
            
            // Process email addresses in this part
            const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
            parts[i] = parts[i].replace(emailRegex, '<a href="mailto:$1" class="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 hover:underline font-medium">$1</a>');
            
            // Process phone numbers in this part
            const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/g;
            parts[i] = parts[i].replace(phoneRegex, '<a href="tel:$1" class="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 hover:underline font-medium">$1</a>');
        }
    }
    
    // Rejoin all parts
    formatted = parts.join('');
    
    // Convert line breaks to HTML
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

function addChatMessageWithSource(message, sender, source = 'chat') {
    const chatMessages = document.getElementById('chatMessages');
    console.log('🔍 Chat messages element:', chatMessages);
    
    if (!chatMessages) {
        console.error('❌ chatMessages element not found!');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message flex items-start space-x-3';
    
    // Initialize chat history if not exists
    if (!window.chatHistory) {
        window.chatHistory = loadChatHistoryFromStorage();
    }
    
    // Add to chat history for context sync
    const newMessage = {
        role: sender === 'user' ? 'user' : 'assistant',
        content: message,
        timestamp: new Date().toISOString(),
        source: source
    };
    
    window.chatHistory.push(newMessage);
    
    // Keep only last 30 messages to avoid token limits
    if (window.chatHistory.length > 30) {
        window.chatHistory = window.chatHistory.slice(-30);
    }
    
    // Save to localStorage for persistence
    saveChatHistoryToStorage(window.chatHistory);
    
    // Update conversation_context in VAPI_CONFIG for next voice call
    updateConversationContext();
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="flex-1"></div>
            <div class="bg-gradient-to-r from-primary-500 to-accent text-white rounded-lg px-4 py-2 shadow-sm max-w-md">
                ${source === 'voice' ? '<div class="flex items-center justify-between mb-2"><span class="text-xs px-2 py-1 rounded-full bg-white/20 text-white font-medium">🎤 Voice</span></div>' : ''}
                <div class="break-words">${formatMessageContent(message)}</div>
            </div>
            <div class="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            </div>
            <div class="bg-white dark:bg-gray-700 rounded-lg px-4 py-2 shadow-sm max-w-md">
                ${source === 'voice' ? '<div class="flex items-center justify-between mb-2"><span class="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium">🎤 Voice</span></div>' : ''}
                ${source === 'voice-function' ? '<div class="flex items-center justify-between mb-2"><span class="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-medium">📧 Nachricht</span></div>' : ''}
                <div class="text-gray-800 dark:text-gray-200 break-words">${formatMessageContent(message)}</div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    console.log('✅ Message added to chat:', message);
    
    // Intelligentes Scrollen - nur wenn User bereits unten ist
    // Verzögere Scrolling für alle Nachrichten, damit DOM vollständig aktualisiert ist
    // Bei Voice-Nachrichten etwas mehr Zeit geben
    const delay = source === 'voice' ? 100 : 50;
    setTimeout(() => scrollToBottomIfNeeded(false), delay);
}

// Intelligentes Scrollen - nur wenn User bereits unten ist
function scrollToBottomIfNeeded(forceScroll = false) {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) {
        console.warn('⚠️ chatContainer not found for scrolling');
        return;
    }
    
    // Bei Voice-Nachrichten oder wenn explizit gefordert, immer scrollen
    if (forceScroll) {
        // Smooth scroll für bessere UX
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
        console.log('📜 Forced scroll to bottom');
        return;
    }
    
    // Prüfe ob User bereits nahe am Ende ist 
    // Ultra-großzügige Toleranz: 4x Container-Höhe, mindestens 500px, maximal 1200px
    // Das sorgt dafür, dass Auto-Scrolling auch bei viel Content und kleinen Mobile-Screens zuverlässig funktioniert
    const containerHeight = chatContainer.clientHeight;
    const scrollTolerance = Math.min(Math.max(containerHeight * 4, 500), 1200);
    const isNearBottom = chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight - scrollTolerance;
    
    console.log(`📊 Scroll-Analyse: scrollTop=${chatContainer.scrollTop}, clientHeight=${chatContainer.clientHeight}, scrollHeight=${chatContainer.scrollHeight}, tolerance=${scrollTolerance}, isNearBottom=${isNearBottom}`);
    
    if (isNearBottom) {
        // Smooth scroll für neue Nachrichten
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
        console.log(`📜 Scrolled to bottom (user was within ${scrollTolerance}px tolerance)`);
    } else {
        console.log('📜 User scrolled up - not auto-scrolling to preserve reading position');
    }
}

function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.classList.remove('hidden');
    // Intelligentes Scrollen auch beim Typing Indicator
    scrollToBottomIfNeeded();
    
    // Zeige erweiterte Nachricht für längere Wartezeiten
    setTimeout(() => {
        if (!indicator.classList.contains('hidden')) {
            const text = indicator.querySelector('p');
            if (text) {
                text.textContent = 'Der Assistent recherchiert... Das kann bei Web-Suchen etwas dauern.';
            }
        }
    }, 10000); // Nach 10 Sekunden erweiterte Nachricht
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator').classList.add('hidden');
}

// Unified VAPI Integration - Voice und Chat mit gemeinsamen Kontext
async function sendChatMessage(message) {
    console.log('sendChatMessage called with:', message);
    
    if (!message.trim()) return;
    
    // Mark user activity for adaptive polling
    if (typeof markUserActivity === 'function') {
        markUserActivity();
    }
    
    // Füge Benutzer-Nachricht zum Chat hinzu
    addChatMessage(message, 'user');
    
    // NEUE FUNKTIONALITÄT: Sende Chat-Nachricht an laufenden Voice-Call
    // Prüfe Voice-Call Status über VAPI Widget Klassen
    const vapiWidget = document.querySelector('.vapi-widget');
    const isVoiceActive = vapiWidget && (
        vapiWidget.classList.contains('vapi-call-active') || 
        vapiWidget.classList.contains('vapi-speaking') ||
        vapiWidget.classList.contains('vapi-listening')
    );
    
    if (window.vapi && (window.isCallActive || isVoiceActive)) {
        console.log('🎤 Voice-Call aktiv - sende Chat-Nachricht an Voice-Assistant');
        console.log('Voice Status:', {
            isCallActive: window.isCallActive,
            isVoiceActive: isVoiceActive,
            widgetClasses: vapiWidget ? vapiWidget.className : 'not found'
        });
        
        try {
            // Sende Chat-Nachricht an VAPI Voice-Call
            window.vapi.send({
                type: 'add-message',
                message: {
                    role: 'user',
                    content: message,
                },
            });
            console.log('✅ Chat-Nachricht erfolgreich an Voice-Call gesendet - KEINE Backend API!');
            // WICHTIG: Keine Backend API wenn Voice-Call aktiv ist
            // Die Antwort kommt per Voice und wird über handleVoiceTranscript() im Chat angezeigt
            hideTypingIndicator();
            return; // Beende hier - keine Backend API
        } catch (error) {
            console.error('❌ Fehler beim Senden der Chat-Nachricht an Voice-Call:', error);
            hideTypingIndicator();
            return; // Auch bei Fehler keine Backend API
        }
    }
    
    // Entfernt: updateVoiceTranscriptVariable - verwende jetzt nur noch window.chatHistory
    
    showTypingIndicator();
    
    try {
        // Verwende Backend API nur wenn KEIN Voice-Call aktiv ist
        console.log('Using backend API for real chat responses...');
        
        // Erstelle AbortController für Timeout-Management
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 Minuten Timeout für Tool-Calls
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            signal: controller.signal,
                    body: JSON.stringify({
            message: message,
            assistant_id: window.VAPI_CONFIG?.assistantId || 'default-assistant',
            browser_session_id: window.VAPI_CONFIG?.assistantOverrides?.variableValues?.current_browser_session || 'unknown-browser-session',
            session_id: window.getCurrentSessionId ? window.getCurrentSessionId() : (window.vapiSessionId || null),
                // Assistant Override Variablen für gemeinsamen Kontext - nur echte Werte, keine Platzhalter
                ...(window.VAPI_CONFIG?.assistantOverrides?.variableValues?.customer_domain && { customer_domain: window.VAPI_CONFIG.assistantOverrides.variableValues.customer_domain }),
                ...(window.VAPI_CONFIG?.assistantOverrides?.variableValues?.customer_name && { customer_name: window.VAPI_CONFIG.assistantOverrides.variableValues.customer_name }),
                ...(window.VAPI_CONFIG?.assistantOverrides?.variableValues?.customer_email && { customer_email: window.VAPI_CONFIG.assistantOverrides.variableValues.customer_email }),
                ...(window.VAPI_CONFIG?.assistantOverrides?.variableValues?.company_name && { company_name: window.VAPI_CONFIG.assistantOverrides.variableValues.company_name }),
                ...(window.VAPI_CONFIG?.assistantOverrides?.variableValues?.calendly_link && { calendly_link: window.VAPI_CONFIG.assistantOverrides.variableValues.calendly_link }),
                // Einheitliche Message History für Voice und Chat (letzte 30 Messages)
                chat_history: JSON.stringify((window.chatHistory || []).slice(-30)),
                // Conversation context für Backend API
                conversation_context: window.VAPI_CONFIG?.assistantOverrides?.variableValues?.conversation_context || 'Keine vorherigen Nachrichten'
            })
        });
        
        // Clear timeout da Request erfolgreich war
        clearTimeout(timeoutId);
        hideTypingIndicator();
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend response received:', data);
            
            if (data.message) {
                console.log('📝 Displaying assistant message:', data.message);
                addChatMessage(data.message, 'assistant');
            } else {
                console.warn('⚠️ No message in response:', data);
                addChatMessage('Entschuldigung, ich konnte keine Antwort generieren. Bitte versuchen Sie es erneut.', 'assistant');
            }
            
            if (data.session_id) {
                window.vapiSessionId = data.session_id;
                console.log('🆔 Updated session ID:', data.session_id);
            }
        } else {
            console.error('❌ Backend error:', response.status, response.statusText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('Error sending chat message:', error);
        clearTimeout(timeoutId);
        hideTypingIndicator();
        
        // Spezifische Fehlerbehandlung für Timeouts
        if (error.name === 'AbortError') {
            console.log('⏱️ Request timed out after 5 minutes - this is normal for complex tool calls');
            addChatMessage('⏱️ Die Anfrage dauert länger als erwartet. Der Assistent recherchiert möglicherweise noch... Bitte warten Sie einen Moment und versuchen Sie es erneut.', 'assistant');
            showToast('Timeout', 'Anfrage dauert länger - bitte warten', 'warning');
        } else {
            addChatMessage('Entschuldigung, es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut.', 'assistant');
            showToast('Fehler', 'Nachricht konnte nicht gesendet werden', 'error');
        }
    }
}

// Function to update conversation_context in VAPI_CONFIG
function updateConversationContext() {
    if (!window.VAPI_CONFIG || !window.VAPI_CONFIG.assistantOverrides || !window.VAPI_CONFIG.assistantOverrides.variableValues) {
        return;
    }
    
    const chatHistory = (window.chatHistory || []).slice(-30);
    const conversationContext = chatHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
    
    // Update VAPI_CONFIG with current conversation context
    window.VAPI_CONFIG.assistantOverrides.variableValues.conversation_context = conversationContext || 'Keine vorherigen Nachrichten';
    
    console.log('📝 Updated conversation_context:', conversationContext ? conversationContext.substring(0, 100) + '...' : 'No context');
}


// Chat History Storage Functions
function saveChatHistoryToStorage(chatHistory) {
    try {
        const storageKey = `chatHistory_${window.BROWSER_SESSION_ID || 'default'}`;
        localStorage.setItem(storageKey, JSON.stringify(chatHistory));
        console.log('💾 Chat history saved to localStorage:', chatHistory.length, 'messages');
    } catch (error) {
        console.warn('⚠️ Failed to save chat history to localStorage:', error);
    }
}

function loadChatHistoryFromStorage() {
    try {
        // First try with current browser session ID
        let storageKey = `chatHistory_${window.BROWSER_SESSION_ID || 'default'}`;
        let stored = localStorage.getItem(storageKey);
        
        // If not found, try to find the most recent chat history from any session
        if (!stored) {
            console.log('🔍 No chat history found for current session, searching for latest...');
            const allKeys = Object.keys(localStorage);
            const chatHistoryKeys = allKeys.filter(key => key.startsWith('chatHistory_'));
            
            if (chatHistoryKeys.length > 0) {
                // Sort by timestamp (embedded in session ID) to get the most recent
                const sortedKeys = chatHistoryKeys.sort((a, b) => {
                    const timestampA = a.split('_')[1] || '0';
                    const timestampB = b.split('_')[1] || '0';
                    return parseInt(timestampB) - parseInt(timestampA);
                });
                
                const latestKey = sortedKeys[0];
                stored = localStorage.getItem(latestKey);
                console.log(`🔄 Found latest chat history from session: ${latestKey}`);
                
                // Copy the latest chat history to current session for future use
                if (stored && window.BROWSER_SESSION_ID) {
                    localStorage.setItem(`chatHistory_${window.BROWSER_SESSION_ID}`, stored);
                    console.log(`📋 Copied chat history to current session: chatHistory_${window.BROWSER_SESSION_ID}`);
                }
            }
        }
        
        if (stored) {
            const chatHistory = JSON.parse(stored);
            console.log('📚 Chat history loaded from localStorage:', chatHistory.length, 'messages');
            
            // Restore messages to UI (only if not already displayed)
            if (chatHistory.length > 0) {
                restoreChatMessagesToUI(chatHistory);
            }
            
            return chatHistory;
        }
    } catch (error) {
        console.warn('⚠️ Failed to load chat history from localStorage:', error);
    }
    return [];
}

function restoreChatMessagesToUI(chatHistory) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Clear existing messages except welcome message
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    chatMessages.innerHTML = '';
    if (welcomeMessage) {
        chatMessages.appendChild(welcomeMessage);
    }
    
    // Restore each message to UI
    chatHistory.forEach(msg => {
        addChatMessageToUI(msg.content, msg.role, msg.source);
    });
    
    // Scroll to bottom using correct container
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'auto'
        });
    }
    console.log('🔄 Restored', chatHistory.length, 'messages to chat UI');
}

function addChatMessageToUI(message, sender, source = 'chat') {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message flex items-start space-x-3';
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            </div>
            <div class="flex-1">
                <div class="bg-gradient-to-r from-primary-500 to-accent text-white rounded-2xl px-4 py-3 max-w-xs lg:max-w-md">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-medium opacity-90">Sie</span>
                        ${source === 'voice' ? '<span class="text-xs bg-white/20 px-2 py-0.5 rounded-full">🎤 Voice</span>' : ''}
                    </div>
                    <p class="text-sm leading-relaxed">${formatMessageContent(message)}</p>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            </div>
            <div class="flex-1">
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 max-w-xs lg:max-w-md shadow-sm">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">KI-Assistent</span>
                        ${source === 'voice' ? '<span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">🎤 Voice</span>' : ''}
                    </div>
                    <div class="text-sm text-gray-900 dark:text-white leading-relaxed">${formatMessageContent(message)}</div>
                </div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function clearChatHistory() {
    try {
        const storageKey = `chatHistory_${window.BROWSER_SESSION_ID || 'default'}`;
        localStorage.removeItem(storageKey);
        window.chatHistory = [];
        
        // Clear UI
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const welcomeMessage = chatMessages.querySelector('.welcome-message');
            chatMessages.innerHTML = '';
            if (welcomeMessage) {
                chatMessages.appendChild(welcomeMessage);
            }
        }
        
        console.log('🗑️ Chat history cleared');
    } catch (error) {
        console.warn('⚠️ Failed to clear chat history:', error);
    }
}

// Initialize chat history on page load
function initializeChatHistory() {
    if (!window.chatHistory) {
        window.chatHistory = loadChatHistoryFromStorage();
    }
    updateConversationContext();
}

// Make functions globally accessible
window.addChatMessage = addChatMessage;
window.addChatMessageWithSource = addChatMessageWithSource;
window.showTypingIndicator = showTypingIndicator;
window.hideTypingIndicator = hideTypingIndicator;
window.sendChatMessage = sendChatMessage;
window.updateConversationContext = updateConversationContext;
window.saveChatHistoryToStorage = saveChatHistoryToStorage;
window.loadChatHistoryFromStorage = loadChatHistoryFromStorage;
window.clearChatHistory = clearChatHistory;
window.initializeChatHistory = initializeChatHistory;
