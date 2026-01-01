/**
 * Message Polling System
 * 
 * Polls Redis every 3 seconds for new messages and displays them in chat.
 */

// Global variables
let messagePollingInterval = null;
let lastMessageCount = 0;
let currentSessionId = null;
let lastActivity = Date.now();
let currentPollingInterval = 15000; // Start with 15s
let consecutiveEmptyPolls = 0;
let isVoiceActive = false;
let isChatActive = false;
let isPaused = false; // Complete pause when idle
let eventSource = null; // SSE EventSource
let reconnectAttempts = 0;
let maxReconnectAttempts = 10;
let reconnectDelay = 1000; // Start with 1 second

/**
 * Initialize message polling for a session
 */
function startMessagePolling(sessionId) {
    console.log(`❌ Message polling PERMANENTLY DISABLED - ONLY SSE allowed for session: ${sessionId}`);
    // Stop any existing polling
    stopMessagePolling();
    return; // PERMANENTLY DISABLED - Only use SSE
    
    currentSessionId = sessionId;
    
    // Initialize polling variables
    lastActivity = Date.now();
    currentPollingInterval = 15000; // Start with 15s
    consecutiveEmptyPolls = 0;
    isPaused = false;
    
    console.log(`✅ Message polling initialized: sessionId=${currentSessionId}, interval=${currentPollingInterval}ms`);
    
    // Clear any existing polling
    stopMessagePolling();
    
    // Start adaptive polling system (starts at 15s, adjusts based on activity)
    // This dramatically reduces Redis usage while maintaining responsiveness
    scheduleNextPoll();
    
    // Initial check
    checkForNewMessages();
}

/**
 * Stop message polling
 */
function stopMessagePolling() {
    if (messagePollingInterval) {
        console.log('🛑 Stopping message polling');
        clearTimeout(messagePollingInterval);
        messagePollingInterval = null;
    }
}

/**
 * Mark user activity to increase polling frequency temporarily
 */
function markUserActivity() {
    lastActivity = Date.now();
    consecutiveEmptyPolls = 0;
    isChatActive = true;
    
    // Resume polling if it was paused
    if (isPaused) {
        console.log('🔄 Resuming polling due to user activity');
        isPaused = false;
        scheduleNextPoll();
    }
    
    // Temporarily increase polling frequency for 2 minutes after activity
    currentPollingInterval = 8000; // 8 seconds for active periods
    
    // Reset chat activity after 5 minutes of no chat
    setTimeout(() => {
        isChatActive = false;
        // console.log('💤 Chat activity timeout - marked as inactive');
    }, 300000); // 5 minutes
}

/**
 * Mark voice activity state
 */
function setVoiceActive(active) {
    isVoiceActive = active;
    if (active) {
        lastActivity = Date.now();
        consecutiveEmptyPolls = 0;
        
        // Resume polling if it was paused
        if (isPaused) {
            console.log('🔄 Resuming polling due to voice activity');
            isPaused = false;
            scheduleNextPoll();
        }
    }
    console.log(`🎤 Voice active: ${active}`);
}

/**
 * Pause polling completely when totally idle
 */
function pausePolling() {
    if (!isPaused && messagePollingInterval) {
        console.log('⏸️ Pausing polling - system is completely idle');
        clearTimeout(messagePollingInterval);
        messagePollingInterval = null;
        isPaused = true;
    }
}

/**
 * Resume polling from pause
 */
function resumePolling() {
    if (isPaused) {
        console.log('▶️ Resuming polling from pause');
        isPaused = false;
        scheduleNextPoll();
    }
}

/**
 * Check for new messages in Redis
 */
async function checkForNewMessages() {
    if (!currentSessionId) {
        console.log('❌ No session ID for message polling');
        return;
    }
    
    try {
        const response = await fetch(`/api/messages/${currentSessionId}`);
        const data = await response.json();
        
        if (data.success && data.messages) {
            const messageCount = data.messages.length;
            
            // Only process if we have new messages
            if (messageCount > lastMessageCount) {
                console.log(`📨 Found ${messageCount - lastMessageCount} new messages`);
                
                // Get only the new messages
                const newMessages = data.messages.slice(0, messageCount - lastMessageCount);
                
                // Process each new message
                for (const message of newMessages.reverse()) { // Reverse to show oldest first
                    await displayNewMessage(message);
                }
                
                lastMessageCount = messageCount;
                consecutiveEmptyPolls = 0; // Reset counter on new messages
            } else {
                // No new messages - increase consecutive empty polls
                consecutiveEmptyPolls++;
            }
            
            // Adaptive polling: adjust frequency based on activity and empty polls
            adjustPollingFrequency();
        }
    } catch (error) {
        console.error('❌ Error checking for messages:', error);
        // On error, increase polling interval to reduce server load
        consecutiveEmptyPolls += 2;
        adjustPollingFrequency();
    }
    
    // Schedule next poll with adaptive frequency (only if not paused)
    if (!isPaused) {
        scheduleNextPoll();
    }
}

/**
 * Schedule the next polling cycle
 */
function scheduleNextPoll() {
    if (messagePollingInterval) {
        clearTimeout(messagePollingInterval);
    }
    
    messagePollingInterval = setTimeout(() => {
        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                checkForNewMessages();
                // CRITICAL FIX: Schedule next poll to continue the loop!
                scheduleNextPoll();
            });
        } else {
            setTimeout(() => {
                checkForNewMessages();
                // CRITICAL FIX: Schedule next poll to continue the loop!
                scheduleNextPoll();
            }, 0);
        }
    }, currentPollingInterval);
}

/**
 * Adjust polling frequency based on activity and consecutive empty polls
 */
function adjustPollingFrequency() {
    const timeSinceActivity = Date.now() - lastActivity;
    
    // Check if system is completely idle (no voice, no chat, no recent activity)
    if (!isVoiceActive && !isChatActive && timeSinceActivity > 600000 && consecutiveEmptyPolls > 5) {
        pausePolling();
        return;
    }
    
    // Active voice or chat: Poll every 5 seconds
    if (isVoiceActive || isChatActive) {
        currentPollingInterval = 5000;
    }
    // Recent activity (< 2 minutes): Poll every 8 seconds
    else if (timeSinceActivity < 120000) {
        currentPollingInterval = 8000;
    }
    // No activity for 2-10 minutes: Poll every 10 seconds (faster for voice messages!)
    else if (timeSinceActivity < 600000) {
        currentPollingInterval = 10000;
    }
    // No activity for 10+ minutes: Poll every 15 seconds max (never slower!)
    else {
        currentPollingInterval = 15000;
    }
    
    // REDUCED: Less aggressive slowdown - voice messages are critical!
    if (consecutiveEmptyPolls > 25) {
        currentPollingInterval = Math.min(currentPollingInterval * 1.2, 20000); // Max 20s, not 60s!
    }
    
    console.log(`🔄 Polling: ${currentPollingInterval/1000}s (voice: ${isVoiceActive}, chat: ${isChatActive}, activity: ${Math.round(timeSinceActivity/1000)}s ago, empty: ${consecutiveEmptyPolls})`);
}

/**
 * Display a new message in the chat using the existing chat system
 */
async function displayNewMessage(messageData) {
    console.log('💬 Displaying new message via polling:', messageData);
    console.log('💬 Message content:', messageData.content);
    console.log('💬 Message role:', messageData.role);
    console.log('💬 Message source:', messageData.source);
    console.log('💬 Message full object:', JSON.stringify(messageData, null, 2));
    
    // Extract message content
    const content = messageData.content || 'Keine Nachricht';
    const role = messageData.role || 'assistant';
    const source = messageData.source || 'voice-function'; // Default to voice-function for lila label
    
    console.log('💬 Processed values - content:', content, 'role:', role, 'source:', source);
    
    // Use the existing chat system with the correct source parameter
    if (typeof window.addChatMessageWithSource === 'function') {
        console.log('✅ Using existing chat system for voice message display');
        console.log('💬 Calling addChatMessageWithSource with:', { content, role, source });
        
        // Call the function and log the result
        try {
            const result = window.addChatMessageWithSource(content, role, source);
            console.log('✅ addChatMessageWithSource result:', result);
        } catch (error) {
            console.error('❌ Error calling addChatMessageWithSource:', error);
        }
    } else {
        console.warn('⚠️ addChatMessageWithSource not available, falling back to basic display');
        
        // Fallback - basic message display if chat functions not loaded yet
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.log('❌ Chat messages container not found');
            return;
        }
        
        // Create basic message element with voice-function styling
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message flex items-start space-x-3';
        
        messageElement.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            </div>
            <div class="bg-white dark:bg-gray-700 rounded-lg px-4 py-2 shadow-sm max-w-md">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-medium">📧 Nachricht</span>
                </div>
                <div class="text-gray-800 dark:text-gray-200 break-words">${content}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        
        // Basic scrolling
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
    
    // Show notification
    if (typeof showToast === 'function') {
        showToast('Neue Nachricht', 'Sie haben eine neue Nachricht erhalten', 'info');
    }
}

/**
 * Clear all messages for current session
 */
async function clearSessionMessages() {
    if (!currentSessionId) {
        console.log('❌ No session ID to clear messages');
        return;
    }
    
    try {
        const response = await fetch(`/api/messages/${currentSessionId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Messages cleared');
            lastMessageCount = 0;
            
            // Clear chat display
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                // Keep only the welcome message
                const welcomeMessage = chatMessages.querySelector('.chat-message:first-child');
                chatMessages.innerHTML = '';
                if (welcomeMessage) {
                    chatMessages.appendChild(welcomeMessage);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error clearing messages:', error);
    }
}

/**
 * Generate a unique session ID
 */
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Initialize message polling when page loads
 */
// Auto-initialization function that can be called multiple times
function initializeMessagePolling() {
    if (currentSessionId) {
        console.log('🔄 Message polling already initialized (but disabled)');
        return true;
    }
    
    console.log('🔄 Message polling initialization disabled - using SSE only');
    
    if (window.VAPI_CONFIG && window.VAPI_CONFIG.browserSessionId) {
        currentSessionId = window.VAPI_CONFIG.browserSessionId;
        console.log(`🆔 Using VAPI_CONFIG.browserSessionId: ${currentSessionId} (SSE only)`);
        // startMessagePolling(currentSessionId); // DISABLED - SSE only
        return true;
    } else if (window.BROWSER_SESSION_ID) {
        currentSessionId = window.BROWSER_SESSION_ID;
        console.log(`🆔 Using legacy BROWSER_SESSION_ID: ${currentSessionId} (SSE only)`);
        // startMessagePolling(currentSessionId); // DISABLED - SSE only
        return true;
    }
    
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Message polling script loaded (DOMContentLoaded)');
    
    let retryCount = 0;
    const maxRetries = 200; // 20 seconds max wait
    
    const checkForBrowserSession = () => {
        if (initializeMessagePolling()) {
            return true;
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
            setTimeout(checkForBrowserSession, 100);
            return false;
        } else {
            console.error('❌ Failed to find browser session ID after 20 seconds');
            return false;
        }
    };

    checkForBrowserSession();

    // Backup retry attempts at specific intervals
    [1000, 3000, 5000, 10000].forEach(delay => {
        setTimeout(() => {
            if (!currentSessionId) {
                // console.log(`🔄 Backup retry after ${delay}ms...`);
                initializeMessagePolling();
            }
        }, delay);
    });

    // Stop polling when page unloads
    window.addEventListener('beforeunload', function() {
        stopMessagePolling();
    });
});

// Also try initialization when window is fully loaded
window.addEventListener('load', function() {
    // console.log('🔄 Window fully loaded - trying message polling init');
    setTimeout(() => {
        if (!currentSessionId) {
            initializeMessagePolling();
        }
    }, 500);
});

// Global function to manually trigger initialization (for debugging)
window.initMessagePolling = initializeMessagePolling;

/**
 * Start message polling when browser session is ready
 * This function will be called from the main app
 */
function startMessagePollingWhenReady() {
    const sessionId = window.VAPI_CONFIG?.browserSessionId || window.BROWSER_SESSION_ID;
    if (sessionId && !currentSessionId) {
        currentSessionId = sessionId;
        console.log(`🆔 Message polling disabled - using SSE only for session: ${currentSessionId}`);
        // startMessagePolling(currentSessionId); // DISABLED - SSE only
    }
}

// Export functions for global use
window.startMessagePolling = startMessagePolling;
window.stopMessagePolling = stopMessagePolling;
window.clearSessionMessages = clearSessionMessages;
window.startMessagePollingWhenReady = startMessagePollingWhenReady;
