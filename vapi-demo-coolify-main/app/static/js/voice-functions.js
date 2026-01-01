// Voice Functions
// Entfernt: voiceTranscript - verwende jetzt nur noch window.chatHistory für alle Messages

// Verwende NUR die ursprüngliche addChatMessage aus chat-functions.js

// Entfernt - verwende nur die ursprüngliche addChatMessage aus chat-functions.js

// VAPI Widget Monitoring - ENTFERNT wegen Performance-Problemen
// Das ständige Monitoring verursacht Endlosschleifen

// updateCustomButtonFromVapi - ENTFERNT wegen Performance-Problemen

// setCustomButtonStyle - VEREINFACHT: Nur einmalige Icon-Positionierung ohne State-Monitoring
function initializeVoiceButtonStyle() {
    const customButton = document.getElementById('vapiVoiceButton');
    const voiceIcon = document.getElementById('vapiVoiceIcon');
    
    if (!customButton) return;
    
    // Fix voice icon positioning - nur einmal
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
    
    // Set initial status
    setCustomButtonStyle('disconnected');
    
    console.log('✅ Voice button initialized');
    
    // Force consistent size for ALL states - override all other systems with !important
    customButton.style.setProperty('width', '56px', 'important');
    customButton.style.setProperty('height', '56px', 'important');
    customButton.style.setProperty('min-width', '56px', 'important');
    customButton.style.setProperty('min-height', '56px', 'important');
    customButton.style.setProperty('max-width', '56px', 'important');
    customButton.style.setProperty('max-height', '56px', 'important');
    
    // Use default brand colors
    const primaryColor = '#4361ee';
    const secondaryColor = '#3a0ca3';
    const accentColor = '#4cc9f0';
    
    switch (state) {
        case 'idle':
            // Neutral gray for idle state
            customButton.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
            customButton.style.setProperty('transform', 'scale(1)', 'important');
            customButton.style.boxShadow = '0 20px 25px -5px rgba(107, 114, 128, 0.3), 0 10px 10px -5px rgba(107, 114, 128, 0.1)';
            // Set matching border color for idle state
            customButton.style.setProperty('border', '1px solid rgba(107, 114, 128, 0.6)', 'important');
            voiceIcon?.classList.remove('hidden');
            if (voiceStatus) voiceStatus.textContent = 'Klicken Sie, um zu sprechen';
            break;
            
        case 'loading':
            // Neutral amber for loading
            customButton.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            customButton.style.setProperty('transform', 'scale(1)', 'important'); // SAME SIZE
            customButton.style.boxShadow = '0 20px 25px -5px rgba(245, 158, 11, 0.3), 0 10px 10px -5px rgba(245, 158, 11, 0.1)';
            // Set matching border color for loading state (amber)
            customButton.style.setProperty('border', '1px solid rgba(245, 158, 11, 0.8)', 'important');
            voiceIcon?.classList.remove('hidden');
            if (voiceStatus) voiceStatus.textContent = 'Verbinde...';
            break;
            
        case 'active':
            // Use brand colors for active state - SAME SIZE
            customButton.style.background = `linear-gradient(135deg, ${primaryColor}, ${accentColor})`;
            customButton.style.setProperty('transform', 'scale(1)', 'important'); // SAME SIZE
            customButton.style.boxShadow = `0 8px 15px -3px ${primaryColor}40, 0 4px 6px -2px ${primaryColor}20`;
            // Set matching border color for active state (primary blue)
            customButton.style.setProperty('border', `1px solid ${primaryColor}`, 'important');
            // Always show the microphone icon (no waves anymore)
            if (voiceStatus) voiceStatus.textContent = 'Verbunden - Sprechen Sie jetzt';
            break;
            
        case 'listening':
            // Use brand secondary color for listening - SAME SIZE
            customButton.style.background = `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`;
            customButton.style.setProperty('transform', 'scale(1)', 'important'); // SAME SIZE
            customButton.style.boxShadow = `0 8px 15px -3px ${secondaryColor}40, 0 4px 6px -2px ${secondaryColor}20`;
            // Set matching border color for listening state (secondary purple)
            customButton.style.setProperty('border', `1px solid ${secondaryColor}`, 'important');
            // Always show the microphone icon (no waves anymore)
            if (voiceStatus) voiceStatus.textContent = 'Hört zu...';
            break;
            
        case 'speaking':
            // Use brand accent color for speaking - SAME SIZE
            customButton.style.background = `linear-gradient(135deg, ${accentColor}, ${primaryColor})`;
            customButton.style.setProperty('transform', 'scale(1)', 'important'); // SAME SIZE
            customButton.style.boxShadow = `0 8px 15px -3px ${accentColor}40, 0 4px 6px -2px ${accentColor}20`;
            // Set matching border color for speaking state (accent cyan)
            customButton.style.setProperty('border', `1px solid ${accentColor}`, 'important');
            // Always show the microphone icon (no waves anymore)
            if (voiceStatus) voiceStatus.textContent = 'Assistent spricht...';
            break;
    }
}

// Dynamic Voice Button Size Functions - DISABLED: Keep button size constant at 56px
function updateVoiceButtonSize(volumeLevel) {
    const customButton = document.getElementById('vapiVoiceButton');
    if (!customButton || !window.isCallActive) return;
    
    // DISABLED: No more size changes! Keep button at fixed 56px
    // Base size: 56px, scale range: 0.8 to 1.3 (45px to 73px)
    // const baseSize = 56;
    // const minScale = 0.8;   // 45px bei leise (volume ~0)
    // const maxScale = 1.3;   // 73px bei laut (volume ~1)
    
    // DISABLED: No more scaling
    // const scale = minScale + (volumeLevel * (maxScale - minScale));
    // const newSize = Math.round(baseSize * scale);
    
    // FORCE FIXED SIZE: Always 56px regardless of volume
    const fixedSize = 56;
    
    // Apply FIXED size with !important to override other systems
    customButton.style.setProperty('width', `${fixedSize}px`, 'important');
    customButton.style.setProperty('height', `${fixedSize}px`, 'important');
    customButton.style.setProperty('min-width', `${fixedSize}px`, 'important');
    customButton.style.setProperty('min-height', `${fixedSize}px`, 'important');
    customButton.style.setProperty('max-width', `${fixedSize}px`, 'important');
    customButton.style.setProperty('max-height', `${fixedSize}px`, 'important');
    
    // DISABLED: No more icon scaling - keep icon at fixed size
    // const voiceIcon = document.getElementById('vapiVoiceIcon');
    
    // if (voiceIcon) {
    //     const iconScale = scale * 0.4; // Icon ist ~40% der Button-Größe
    //     const iconSize = Math.round(baseSize * iconScale);
    //     voiceIcon.style.setProperty('width', `${iconSize}px`, 'important');
    //     voiceIcon.style.setProperty('height', `${iconSize}px`, 'important');
    
    // Keep icon at fixed size instead
    const voiceIcon = document.getElementById('vapiVoiceIcon');
    if (voiceIcon) {
        // Fixed icon size - no more scaling
        voiceIcon.style.setProperty('width', '16px', 'important');
        voiceIcon.style.setProperty('height', '16px', 'important');
    }
    
    // Log nur bei größeren Änderungen - DISABLED
    if (volumeLevel > 0.5) {
        console.log(`🎯 Button kept at fixed ${fixedSize}px (volume: ${volumeLevel.toFixed(3)}) - scaling disabled`);
    }
}

function resetVoiceButtonSize() {
    const customButton = document.getElementById('vapiVoiceButton');
    if (!customButton) return;
    
    // Reset to base size (56px)
    const baseSize = 56;
    customButton.style.setProperty('width', `${baseSize}px`, 'important');
    customButton.style.setProperty('height', `${baseSize}px`, 'important');
    customButton.style.setProperty('min-width', `${baseSize}px`, 'important');
    customButton.style.setProperty('min-height', `${baseSize}px`, 'important');
    customButton.style.setProperty('max-width', `${baseSize}px`, 'important');
    customButton.style.setProperty('max-height', `${baseSize}px`, 'important');
    
    // Reset Icon size
    const voiceIcon = document.getElementById('vapiVoiceIcon');
    if (voiceIcon) {
        const iconSize = Math.round(baseSize * 0.4); // 22px
        voiceIcon.style.setProperty('width', `${iconSize}px`, 'important');
        voiceIcon.style.setProperty('height', `${iconSize}px`, 'important');
    }
    
    // Voice waves removed - only microphone icon now
    
    console.log(`🎯 Button size reset to ${baseSize}px`);
}

// Simple function to remove any leftover wave elements - called only once
function removeAllWaves() {
    // Only remove specific elements that might interfere
    const waveElements = document.querySelectorAll('#vapiVoiceWaves, .voice-wave');
    waveElements.forEach(element => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    if (waveElements.length > 0) {
        console.log('🌊 Removed leftover wave elements');
    }
}

// Voice Call Functions
function toggleVoiceCall() {
    if (window.isCallActive) {
        console.log('🔄 Toggling voice call: stopping active call');
        endVoiceCall();
    } else {
        console.log('🔄 Toggling voice call: starting new call');
        startVoiceCall();
    }
}

function startVoiceCall() {
    if (!window.vapi) {
        console.error('VAPI not initialized');
        showToast('Voice Fehler', 'VAPI nicht initialisiert', 'error');
        return;
    }

    try {
        console.log('Starting voice call with assistant:', window.VAPI_CONFIG.assistantId);
        
        // Build dynamic conversation context from chat history
        const chatHistory = (window.chatHistory || []).slice(-30);
        const conversationContext = chatHistory.map(msg => 
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');
        
        // Update VAPI_CONFIG with current conversation context
        if (window.VAPI_CONFIG && window.VAPI_CONFIG.assistantOverrides && window.VAPI_CONFIG.assistantOverrides.variableValues) {
            // Vapi doesn't transmit empty strings, so use a default value
            window.VAPI_CONFIG.assistantOverrides.variableValues.conversation_context = conversationContext || 'Keine vorherigen Nachrichten';
        }
        
        console.log('🔍 Starting voice call with conversation context:', conversationContext ? conversationContext.substring(0, 100) + '...' : 'No context');
        
        // Create fresh assistantOverrides with updated conversation_context
        const assistantOverrides = {
            variableValues: {
                ...window.VAPI_CONFIG.assistantOverrides.variableValues,
                conversation_context: conversationContext || 'Keine vorherigen Nachrichten'
            }
        };
        
        console.log('📋 Using assistantOverrides:', assistantOverrides.variableValues);
        
        // Start call with fresh overrides - THIS WORKS!
        window.vapi.start(window.VAPI_CONFIG.assistantId, assistantOverrides);
        
        updateVoiceUI('connecting');
        showToast('Voice Starting', 'Sprachverbindung wird hergestellt...', 'info');
        
    } catch (error) {
        console.error('Failed to start voice call:', error);
        showToast('Voice Fehler', 'Sprachanruf konnte nicht gestartet werden', 'error');
        updateVoiceUI('error');
    }
}

function endVoiceCall() {
    if (!window.vapi) {
        console.error('VAPI not initialized');
        return;
    }

    try {
        console.log('Stopping voice call...');
        window.vapi.stop();
        updateVoiceUI('idle');
        
        // Reset voice button size to normal
        resetVoiceButtonSize();
        
        showToast('Voice Ended', 'Sprachverbindung beendet', 'info');
        
    } catch (error) {
        console.error('Failed to stop voice call:', error);
        showToast('Voice Fehler', 'Sprachanruf konnte nicht beendet werden', 'error');
    }
}

// Setup Voice Event Listeners - Based on VAPI Web SDK Documentation
function setupVoiceEventListeners() {
    // Check for VAPI instance - multiple possible locations
    const vapi = window.vapi || window.vapiInstance || window.vapiSDK?.vapi;
    
    if (!vapi || typeof vapi.on !== 'function') {
        console.error('VAPI not initialized for event listeners');
        return;
    }
    
    console.log('🎯 Setting up VAPI Event Listeners with real instance...');

    console.log('🎧 Setting up VAPI Web SDK event listeners...');

    // Call lifecycle events - laut VAPI Web SDK Dokumentation
    vapi.on('call-start', () => {
        console.log('📞 VAPI call started');
        window.isCallActive = true;
        window.isVoiceConnected = true;
        
        // Mark voice as active for adaptive polling
        if (typeof setVoiceActive === 'function') {
            setVoiceActive(true);
        }
        setCustomButtonStyle('connected');
        showToast('Voice Active', 'Sprachverbindung hergestellt - Chat-Nachrichten werden per Voice beantwortet', 'success');
    });

    vapi.on('call-end', () => {
        console.log('📞 VAPI call ended');
        window.isCallActive = false;
        window.isVoiceConnected = false;
        
        // Mark voice as inactive for adaptive polling
        if (typeof setVoiceActive === 'function') {
            setVoiceActive(false);
        }
        setCustomButtonStyle('ended');
        showToast('Voice Ended', 'Sprachverbindung beendet', 'info');
    });

    // Speech detection events - User speaking 
    vapi.on('speech-start', () => {
        console.log('🎤 User started speaking');
        window.isListening = true;
        setCustomButtonStyle('listening');
        updateVoiceUI('listening');
    });

    vapi.on('speech-end', () => {
        console.log('🎤 User stopped speaking');
        window.isListening = false;
        setCustomButtonStyle('thinking');
        updateVoiceUI('active');
    });

    // Assistant speaking events - laut VAPI Web SDK Dokumentation
    vapi.on('assistant-speaking-start', () => {
        console.log('🔊 Assistant started speaking');
        setCustomButtonStyle('speaking');
        updateVoiceUI('speaking');
    });

    vapi.on('assistant-speaking-end', () => {
        console.log('🔊 Assistant stopped speaking');
        window.isAssistantSpeaking = false;
        setCustomButtonStyle('connected');
        updateVoiceUI('active');
    });

    // Message handling - Laut VAPI SDK Dokumentation ist das der Hauptevent für Transcripts
    vapi.on('message', (message) => {
        console.log('📨 VAPI message received:', message);
        
        
        // Handle verschiedene Message-Typen laut VAPI Web SDK
        switch (message.type) {
            case 'transcript':
                // NUR finale Transcripts verarbeiten um Duplikate zu vermeiden
                // Laut offizieller VAPI Dokumentation: transcriptType: "final" für finale Transcripts
                if (message.transcriptType === 'final' && message.transcript && message.transcript.trim().length > 0) {
                    console.log(`✅ Processing FINAL Transcript (${message.transcriptType}) - ${message.role}: ${message.transcript}`);
                    handleVoiceTranscript(message);
                } else {
                    console.log(`⏭️ Skipping ${message.transcriptType || 'partial'} transcript - ${message.role}: ${message.transcript}`);
                }
                break;
                
            case 'function-call':
                console.log('🔧 Function call:', message.functionCall?.name);
                if (message.functionCall) {
                    handleVoiceFunctionCall(message.functionCall);
                }
                break;
                
                
            case 'status-update':
                console.log('📊 Status update:', message);
                break;
                
                
            default:
                console.log('📄 Other message type:', message.type, message);
                // WICHTIG: Verarbeite auch andere Message-Typen als Transcripts
                // Falls es sich um eine Assistant-Antwort handelt, zeige sie im Chat an
                if (message.role === 'assistant' && message.content) {
                    console.log('🎤 Assistant response via other message type:', message.content);
                    handleVoiceTranscript({
                        role: 'assistant',
                        transcript: message.content,
                        transcriptType: 'final'
                    });
                }
        }
    });

    // Volume level monitoring für visuelle Anzeigen und dynamische Button-Größe
    vapi.on('volume-level', (volume) => {
        // Nur bei sehr niedrigem/hohem Volume loggen um Console nicht zu überlasten
        if (volume < 0.1 || volume > 0.8) {
            console.log(`🔊 Volume level: ${volume}`);
        }
        
        // Dynamische Button-Größenanpassung basierend auf Lautstärke
        updateVoiceButtonSize(volume);
    });

    // Error handling - Wichtig für Debugging
    vapi.on('error', (error) => {
        console.error('❌ VAPI error:', error);
        showToast('Voice Fehler', 'Sprachfehler aufgetreten', 'error');
        updateVoiceUI('error');
        window.isCallActive = false;
        window.isVoiceConnected = false;
    });


    console.log('✅ VAPI event listeners configured successfully');
}

// Track processed transcripts to prevent duplicates
if (!window.processedTranscripts) {
    window.processedTranscripts = new Set();
}

// Handle Voice Transcripts - Unified Integration mit Chat System
function handleVoiceTranscript(message) {
    console.log('🎤 Processing voice transcript:', message);
    
    // Validiere Message-Struktur laut VAPI Web SDK Dokumentation
    if (!message || !message.transcript || !message.role) {
        console.warn('⚠️ Invalid transcript message structure:', message);
        return;
    }
    
    // Erstelle eindeutige ID für das Transcript um Duplikate zu verhindern
    const transcriptId = `${message.role}-${message.transcript.trim()}-${Date.now()}`;
    const transcriptContent = `${message.role}-${message.transcript.trim()}`;
    
    // Prüfe ob dieses Transcript bereits verarbeitet wurde (innerhalb von 5 Sekunden)
    const recentlyProcessed = Array.from(window.processedTranscripts).some(id => {
        const [role, content] = id.split('-', 2);
        return role === message.role && content === message.transcript.trim();
    });
    
    if (recentlyProcessed) {
        console.log('⏭️ Skipping duplicate transcript:', message.transcript);
        return;
    }
    
    // Füge zum processed Set hinzu
    window.processedTranscripts.add(transcriptContent);
    
    // Cleanup alte Einträge (älter als 10 Sekunden)
    setTimeout(() => {
        window.processedTranscripts.delete(transcriptContent);
    }, 10000);

    // Laut VAPI SDK Dokumentation haben transcript messages diese Struktur:
    // { type: 'transcript', role: 'user'|'assistant', transcript: 'text', ... }
    const transcript = {
        role: message.role,
        text: message.transcript,
        timestamp: new Date(),
        isFinal: true, // VAPI SDK sendet alle transcripts als final
        source: 'voice' // Markiere als Voice-Quelle
    };
    
    // Synchronisiere Voice mit Chat UI - IMMER mit Voice-Label
    if (message.transcript.trim()) {
        console.log(`🎤 Adding voice transcript to chat: ${message.role} - "${message.transcript}"`);

        // Erstelle Chat Message mit Voice-Label für gemeinsamen Kontext
        const chatMessage = {
            role: message.role === 'user' ? 'user' : 'assistant',
            content: message.transcript,
            timestamp: new Date().toISOString(),
            source: 'voice', // Wichtig: Markiere als Voice-Quelle
            isFinal: true
        };

        // Füge zur globalen Chat History hinzu für Kontext-Synchronisation
        if (!window.chatHistory) {
            window.chatHistory = window.loadChatHistoryFromStorage ? window.loadChatHistoryFromStorage() : [];
        }
        window.chatHistory.push(chatMessage);
        
        // Save voice message to localStorage for persistence
        if (window.saveChatHistoryToStorage) {
            window.saveChatHistoryToStorage(window.chatHistory);
        }
        
        // Zeige im Chat UI mit ursprünglichem Design + Voice-Label
        if (typeof window.addChatMessageWithSource === 'function') {
            console.log('✅ Using addChatMessageWithSource for consistent chat design');
            window.addChatMessageWithSource(
                message.transcript, 
                message.role === 'user' ? 'user' : 'assistant',
                'voice'
            );
            
            // Zusätzliche Aktionen für Voice-Antworten
            if (message.role === 'assistant') {
                handleVoiceResponseActions(message.transcript);
            }
        } else {
            console.warn('⚠️ addChatMessageWithSource function not available, falling back to addChatMessage');
            if (typeof window.addChatMessage === 'function') {
                window.addChatMessage(message.transcript, message.role === 'user' ? 'user' : 'assistant');
            }
        }
        
        // Aktualisiere VAPI Session ID falls verfügbar
        if (message.sessionId) {
            window.vapiSessionId = message.sessionId;
            console.log('📋 Updated VAPI session ID:', message.sessionId);
        }
        
        // Voice transcript variable is now handled by window.chatHistory
        // No need for separate updateVoiceTranscriptVariable function
        
        console.log('✅ Voice transcript successfully added to chat with voice label');
    } else {
        console.warn('⚠️ Empty transcript content, skipping chat integration');
    }
}

// Entfernt: updateVoiceTranscriptVariable - verwende jetzt nur noch window.chatHistory für alle Messages

// Entfernt: updateVoiceTranscriptVariable - nicht mehr benötigt

// Handle Voice Function Calls
function handleVoiceFunctionCall(functionCall) {
    console.log('🔧 Processing function call:', functionCall.name, functionCall.parameters);
    
    // Show typing indicator while function is being executed
    if (typeof window.showTypingIndicator === 'function') {
        window.showTypingIndicator();
    }
    
    switch (functionCall.name) {
        case 'get_customer_info':
            console.log('Getting customer info:', functionCall.parameters);
            break;
        case 'schedule_appointment':
            console.log('Scheduling appointment:', functionCall.parameters);
            break;
        case 'send_chat_message':
            console.log('Sending chat message via function call:', functionCall.parameters);
            break;
        default:
            console.log('Voice function called:', functionCall.name, functionCall.parameters);
    }
}


// setCustomButtonStyle - Voice Status & Bubble Color Updates
function setCustomButtonStyle(state) {
    const customButton = document.getElementById('vapiVoiceButton');
    const voiceIcon = document.getElementById('vapiVoiceIcon');
    const vapiStatus = document.getElementById('vapiStatus');
    const voiceStatus = document.getElementById('voiceStatus');
    
    if (!customButton) {
        console.warn('❌ vapiVoiceButton not found');
        return;
    }

    // Update status texts
    let statusText = 'Klicken Sie, um zu sprechen';
    let bubbleColor = '#3b82f6'; // Default blue
    
    switch (state) {
        case 'loading':
        case 'connecting':
            statusText = 'Verbindung wird hergestellt...';
            bubbleColor = '#f59e0b'; // Orange
            break;
        case 'connected':
        case 'listening':
            statusText = 'Sprechen Sie jetzt...';
            bubbleColor = '#10b981'; // Green
            break;
        case 'thinking':
        case 'speaking':
            statusText = 'Assistant antwortet...';
            bubbleColor = '#8b5cf6'; // Purple
            break;
        case 'ended':
        case 'disconnected':
            statusText = 'Klicken Sie, um zu sprechen';
            bubbleColor = '#3b82f6'; // Blue
            break;
        default:
            statusText = 'Klicken Sie, um zu sprechen';
            bubbleColor = '#3b82f6'; // Blue
    }
    
    // Update status text elements
    if (vapiStatus) {
        vapiStatus.textContent = statusText;
    }
    if (voiceStatus) {
        voiceStatus.textContent = statusText;
    }
    
    // Update bubble color
    customButton.style.setProperty('background-color', bubbleColor, 'important');
    customButton.style.setProperty('box-shadow', `0 4px 12px ${bubbleColor}33`, 'important');
    
    console.log(`🎨 Voice status updated: ${state} → ${statusText} (${bubbleColor})`);
}

// Voice UI Updates - DEPRECATED: Use setCustomButtonStyle instead
function updateVoiceUI(state) {
    // Redirect to new system to avoid conflicts
    console.log('🔄 updateVoiceUI redirecting to setCustomButtonStyle:', state);
    setCustomButtonStyle(state);
}

// Update Transcript - DEPRECATED: Now using addChatMessageWithSource for unified design
// This function is kept for legacy compatibility but should not be used
function updateTranscript(text, role) {
    console.warn('⚠️ updateTranscript is deprecated - use addChatMessageWithSource instead for consistent chat design');
    
    // Redirect to unified chat system
    if (typeof window.addChatMessageWithSource === 'function') {
        window.addChatMessageWithSource(text, role, 'voice');
    } else if (typeof window.addChatMessage === 'function') {
        window.addChatMessage(text, role);
    } else {
        console.error('❌ No chat message function available');
    }
}

// Handle special actions for voice responses (links, addresses, etc.)
function handleVoiceResponseActions(transcript) {
    console.log('🎤 Processing voice response actions for:', transcript);
    
    // Check for URLs and make them more prominent
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = transcript.match(urlRegex);
    if (urls) {
        console.log('🔗 URLs detected in voice response:', urls);
        // URLs werden bereits durch formatMessageContent() klickbar gemacht
    }
    
    // Check for email addresses
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emails = transcript.match(emailRegex);
    if (emails) {
        console.log('📧 Email addresses detected in voice response:', emails);
    }
    
    // Check for phone numbers
    const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/g;
    const phones = transcript.match(phoneRegex);
    if (phones) {
        console.log('📞 Phone numbers detected in voice response:', phones);
    }
    
    // Check for addresses (basic pattern)
    const addressRegex = /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Place|Pl))/gi;
    const addresses = transcript.match(addressRegex);
    if (addresses) {
        console.log('📍 Addresses detected in voice response:', addresses);
    }
}

// Send Chat Message to Active Voice Call
function sendChatToVoice(message) {
    if (!window.vapi || !window.isCallActive) {
        console.warn('⚠️ Kein aktiver Voice-Call - Chat-Nachricht kann nicht gesendet werden');
        return false;
    }
    
    try {
        console.log('🎤 Sende Chat-Nachricht an Voice-Call:', message);
        window.vapi.send({
            type: 'add-message',
            message: {
                role: 'user',
                content: message,
            },
        });
        console.log('✅ Chat-Nachricht erfolgreich an Voice-Call gesendet');
        return true;
    } catch (error) {
        console.error('❌ Fehler beim Senden der Chat-Nachricht an Voice-Call:', error);
        return false;
    }
}

// Send Message to Webhook (umgeht Transcriber-Probleme)
async function sendMessageToWebhook(message, role = 'assistant') {
    try {
        console.log('📨 Sende Nachricht an Webhook:', message);
        
        const response = await fetch('/webhook/vapi/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: {
                    role: role,
                    content: message,
                },
                timestamp: new Date().toISOString(),
                source: 'voice-assistant'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Nachricht erfolgreich an Webhook gesendet:', result);
            return true;
        } else {
            console.error('❌ Webhook-Fehler:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Fehler beim Senden an Webhook:', error);
        return false;
    }
}

// Make functions globally accessible
window.setupVapiWidgetMonitoring = setupVapiWidgetMonitoring;
window.updateCustomButtonFromVapi = updateCustomButtonFromVapi;
window.setCustomButtonStyle = setCustomButtonStyle;
window.updateVoiceButtonSize = updateVoiceButtonSize;
window.resetVoiceButtonSize = resetVoiceButtonSize;
window.removeAllWaves = removeAllWaves;
window.toggleVoiceCall = toggleVoiceCall;
window.startVoiceCall = startVoiceCall;
window.endVoiceCall = endVoiceCall;
window.sendChatToVoice = sendChatToVoice;
// Entfernt - verwende nur die ursprüngliche addChatMessage aus chat-functions.js

window.setupVoiceEventListeners = setupVoiceEventListeners;
window.handleVoiceTranscript = handleVoiceTranscript;
window.handleVoiceFunctionCall = handleVoiceFunctionCall;
window.updateVoiceUI = updateVoiceUI;
window.updateTranscript = updateTranscript;
window.sendMessageToWebhook = sendMessageToWebhook;
// Entfernt - verwende nur die ursprüngliche addChatMessage aus chat-functions.js

// Additional safety: Setup on window load as final fallback
window.addEventListener('load', function() {
    // console.log('🌐 Window loaded - final VAPI setup check...');
    
    setTimeout(() => {
        const vapi = window.vapi || window.vapiInstance || window.vapiSDK?.vapi;
        if (vapi && typeof setupVoiceEventListeners === 'function') {
            // Check if event listeners are already setup by looking for our processedTranscripts
            if (!window.processedTranscripts) {
                console.log('🔧 Final setup: Voice event listeners not initialized - setting up now...');
                setupVoiceEventListeners();
            } else {
                console.log('✅ Voice event listeners already initialized');
            }
        } else {
            console.warn('⚠️ VAPI instance or setupVoiceEventListeners still not available on window load');
        }
    }, 1500);
});

// Session Management für Multi-User-Szenarien
function getCurrentSessionId() {
    // Priorisiere VAPI Session ID, dann generiere eine neue
    if (window.vapiSessionId) {
        return window.vapiSessionId;
    }
    
    // Generiere eine neue Session ID falls keine vorhanden
    if (!window.currentSessionId) {
        window.currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('🆔 Generated new session ID:', window.currentSessionId);
    }
    
    return window.currentSessionId;
}

// Erweitere sendMessageToWebhook um Session-ID
async function sendMessageToWebhook(message, role = 'assistant') {
    const sessionId = getCurrentSessionId();
    
    console.log('📤 Sending message to webhook with session ID:', sessionId);
    
    try {
        const response = await fetch('/webhook/vapi/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                role: role,
                session_id: sessionId,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Message sent to webhook successfully:', result);
            return result;
        } else {
            console.error('❌ Failed to send message to webhook:', response.status);
            return null;
        }
    } catch (error) {
        console.error('❌ Error sending message to webhook:', error);
        return null;
    }
}

// Make functions globally accessible
window.getCurrentSessionId = getCurrentSessionId;
window.sendMessageToWebhook = sendMessageToWebhook;
