// Configuration Status Management
// Check configuration status
async function checkConfigurationStatus() {
    try {
        const response = await fetch('/api/config-status');
        const status = await response.json();
        
        if (!status.isComplete) {
            showConfigWarning(status);
        }
    } catch (error) {
        console.error('Failed to check configuration status:', error);
    }
}

function showConfigWarning(status) {
    const container = document.getElementById('config-status-container');
    if (!container) return;
    
    const missingItems = status.missingItems.map(item => `<li>${item}</li>`).join('');
    
    container.innerHTML = `
        <div class="fixed top-4 right-4 z-50 max-w-md">
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 shadow-lg">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3 flex-1">
                        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Konfiguration unvollständig
                        </h3>
                        <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                            <p class="mb-2">Folgende Einstellungen fehlen:</p>
                            <ul class="list-disc list-inside space-y-1">
                                ${missingItems}
                            </ul>
                        </div>
                        <div class="mt-3 flex space-x-2">
                            <button
                                onclick="window.open('/config', '_blank')"
                                class="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                            >
                                Konfigurieren
                            </button>
                            <button
                                onclick="this.closest('.fixed').remove()"
                                class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 text-xs font-medium"
                            >
                                Später
                            </button>
                        </div>
                    </div>
                    <div class="ml-3 flex-shrink-0">
                        <button
                            onclick="this.closest('.fixed').remove()"
                            class="text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300"
                        >
                            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Create VAPI Session
async function createVapiSession() {
    try {
        console.log('🔄 Creating VAPI session...');
        const response = await fetch('/api/create-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            window.vapiSessionId = data.sessionId;
            window.vapiSessionCreated = true;
            console.log('✅ VAPI session created:', window.vapiSessionId);
            return true;
        } else {
            console.error('❌ Failed to create VAPI session:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Error creating VAPI session:', error);
        return false;
    }
}

// Make functions globally accessible
window.checkConfigurationStatus = checkConfigurationStatus;
window.showConfigWarning = showConfigWarning;
window.createVapiSession = createVapiSession;
