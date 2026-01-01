"""
Tests for VAPI Events and Voice-Chat Integration

Tests verify:
- VAPI widget loading and initialization
- Voice event handlers and UI updates  
- Chat integration with voice transcripts
- Voice-labeled messages in chat
"""

import pytest
from playwright.sync_api import Page, expect
import time


class TestVapiEvents:
    """Test suite for VAPI Events and Voice-Chat Integration"""

    @pytest.fixture(autouse=True)
    def setup(self, page: Page):
        """Setup test environment before each test"""
        # Navigate to webapp with test parameters
        page.goto("http://localhost:8000/webapp?domain=example.com&firstname=Test")
        
        # Wait for page to load completely
        page.wait_for_load_state("networkidle")
        
        # Wait for VAPI SDK to initialize
        page.wait_for_function("() => window.vapi !== undefined", timeout=10000)
        
        self.page = page

    def test_vapi_sdk_initialization(self):
        """Test that VAPI SDK is properly initialized"""
        # Check VAPI is available
        vapi_available = self.page.evaluate("() => typeof window.vapi !== 'undefined'")
        assert vapi_available, "VAPI SDK should be initialized"
        
        # Check VAPI config is set
        vapi_config = self.page.evaluate("() => window.VAPI_CONFIG")
        assert vapi_config is not None, "VAPI_CONFIG should be available"
        assert "assistantId" in vapi_config, "Assistant ID should be configured"

    def test_voice_button_visibility_and_states(self):
        """Test voice button visibility and UI states"""
        # Check voice button exists and is visible
        voice_button = self.page.locator("#vapiVoiceButton")
        expect(voice_button).to_be_visible()
        
        # Check initial state is idle
        voice_status = self.page.locator("#vapiStatus")
        expect(voice_status).to_contain_text("Klicken Sie, um zu sprechen")

    def test_voice_event_listeners_setup(self):
        """Test that VAPI event listeners are properly set up"""
        # Check setupVoiceEventListeners function exists
        setup_function = self.page.evaluate("() => typeof window.setupVoiceEventListeners === 'function'")
        assert setup_function, "setupVoiceEventListeners should be available"
        
        # Check event listeners are configured (by calling setup)
        self.page.evaluate("() => window.setupVoiceEventListeners()")
        
        # Verify console logs show successful setup
        console_logs = []
        self.page.on("console", lambda msg: console_logs.append(msg.text))
        
        # Re-run setup to capture logs
        self.page.evaluate("() => window.setupVoiceEventListeners()")
        time.sleep(0.5)
        
        # Check for setup success message
        setup_messages = [log for log in console_logs if "event listeners configured" in log.lower()]
        assert len(setup_messages) > 0, "Event listeners should be configured successfully"

    def test_chat_interface_elements(self):
        """Test chat interface elements are present"""
        # Check chat container exists
        chat_container = self.page.locator("#chatContainer")
        expect(chat_container).to_be_visible()
        
        # Check chat messages area
        chat_messages = self.page.locator("#chatMessages")
        expect(chat_messages).to_be_visible()
        
        # Check chat input
        chat_input = self.page.locator("input[placeholder*='Nachricht']")
        expect(chat_input).to_be_visible()

    def test_add_chat_message_with_voice_label(self):
        """Test adding chat messages with voice labels"""
        # Test user message with voice label
        self.page.evaluate("""
            () => window.addChatMessageWithSource(
                'Test voice message from user', 
                'user', 
                'voice'
            )
        """)
        
        # Check message appears with voice badge
        user_message = self.page.locator(".chat-message").last
        expect(user_message).to_contain_text("Test voice message from user")
        expect(user_message).to_contain_text("🎤 Voice")
        
        # Test assistant message with voice label
        self.page.evaluate("""
            () => window.addChatMessageWithSource(
                'Test voice response from assistant', 
                'assistant', 
                'voice'
            )
        """)
        
        # Check assistant message appears with voice badge
        assistant_message = self.page.locator(".chat-message").last
        expect(assistant_message).to_contain_text("Test voice response from assistant")
        expect(assistant_message).to_contain_text("🎤 Voice")

    def test_voice_transcript_handling(self):
        """Test voice transcript processing and chat integration"""
        # Simulate VAPI transcript message
        test_transcript = {
            "type": "transcript",
            "role": "user", 
            "transcript": "Hello, this is a test voice message"
        }
        
        # Call handleVoiceTranscript function
        self.page.evaluate(f"""
            () => window.handleVoiceTranscript({test_transcript})
        """)
        
        # Check message appears in chat with voice label
        chat_message = self.page.locator(".chat-message").last
        expect(chat_message).to_contain_text("Hello, this is a test voice message")
        expect(chat_message).to_contain_text("🎤 Voice")
        
        # Check voice transcript array is updated
        voice_transcript_length = self.page.evaluate("() => window.voiceTranscript?.length || 0")
        assert voice_transcript_length > 0, "Voice transcript should be updated"

    def test_voice_transcript_variable_update(self):
        """Test voice transcript variable formatting for VAPI context"""
        # Add some test transcripts
        self.page.evaluate("""
            () => {
                window.voiceTranscript = [];
                window.handleVoiceTranscript({
                    type: 'transcript',
                    role: 'user',
                    transcript: 'First test message'
                });
                window.handleVoiceTranscript({
                    type: 'transcript', 
                    role: 'assistant',
                    transcript: 'Assistant response'
                });
            }
        """)
        
        # Check formatted transcript is created
        formatted_transcript = self.page.evaluate("() => window.voiceTranscriptFormatted")
        assert formatted_transcript is not None, "Formatted transcript should be created"
        assert "user: First test message" in formatted_transcript
        assert "assistant: Assistant response" in formatted_transcript

    def test_chat_history_integration(self):
        """Test that voice messages are properly added to chat history"""
        initial_history_length = self.page.evaluate("() => window.chatHistory?.length || 0")
        
        # Add voice transcript
        self.page.evaluate("""
            () => window.handleVoiceTranscript({
                type: 'transcript',
                role: 'user',
                transcript: 'Test for chat history integration'
            })
        """)
        
        # Check chat history is updated
        new_history_length = self.page.evaluate("() => window.chatHistory.length")
        assert new_history_length > initial_history_length, "Chat history should be updated"
        
        # Check latest message has voice source
        latest_message = self.page.evaluate("() => window.chatHistory[window.chatHistory.length - 1]")
        assert latest_message["source"] == "voice", "Message should be marked as voice source"
        assert latest_message["content"] == "Test for chat history integration"

    def test_voice_ui_updates(self):
        """Test voice UI state updates"""
        # Test different UI states
        states_to_test = ["idle", "active", "listening", "speaking", "error"]
        
        for state in states_to_test:
            self.page.evaluate(f"() => window.updateVoiceUI('{state}')")
            
            # Check voice status is updated appropriately
            voice_status = self.page.locator("#vapiStatus")
            status_text = voice_status.inner_text()
            
            # Each state should have different status text
            assert len(status_text) > 0, f"Status text should be set for {state} state"

    def test_error_handling_for_invalid_transcripts(self):
        """Test error handling for invalid transcript messages"""
        console_logs = []
        self.page.on("console", lambda msg: console_logs.append(msg.text))
        
        # Test with invalid message structure
        self.page.evaluate("""
            () => window.handleVoiceTranscript({
                type: 'transcript',
                // Missing role and transcript
            })
        """)
        
        # Check warning is logged
        warning_logs = [log for log in console_logs if "Invalid transcript" in log]
        assert len(warning_logs) > 0, "Warning should be logged for invalid transcript"

    def test_voice_function_calls(self):
        """Test voice function call handling"""
        console_logs = []
        self.page.on("console", lambda msg: console_logs.append(msg.text))
        
        # Simulate function call
        self.page.evaluate("""
            () => window.handleVoiceFunctionCall({
                name: 'test_function',
                parameters: { test: 'value' }
            })
        """)
        
        # Check function call is logged
        function_logs = [log for log in console_logs if "Voice function called" in log]
        assert len(function_logs) > 0, "Function call should be logged"


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Configure browser context for tests"""
    return {
        **browser_context_args,
        "viewport": {"width": 1280, "height": 720},
        "ignore_https_errors": True,
    }


@pytest.fixture(scope="session") 
def browser_type_launch_args(browser_type_launch_args):
    """Configure browser launch args for tests"""
    return {
        **browser_type_launch_args,
        "headless": True,  # Set to False for debugging
    }
