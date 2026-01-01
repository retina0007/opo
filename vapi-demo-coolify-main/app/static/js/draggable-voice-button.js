/**
 * Draggable Voice Button
 * Makes the floating voice button draggable with touch and mouse support
 * 
 * Mobile: Long-press (500ms) to drag, normal tap for voice call
 * Desktop: Immediate drag on mouse down
 * 
 * Button can be positioned anywhere with 1px minimum margin from screen edges
 * Includes position persistence in localStorage
 */

class DraggableVoiceButton {
    constructor() {
        this.button = null;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.minMargin = 1; // Minimum distance from screen edge
        this.animationDuration = 300; // ms
        
        this.init();
        this.fixButtonSize();
    }

    fixButtonSize() {
        // Force reset height to prevent huge touch area
        this.button.style.height = '56px';
        this.button.style.minHeight = '56px';
        this.button.style.maxHeight = '56px';
        
        // Monitor and prevent any changes to height
        const observer = new MutationObserver(() => {
            if (this.button.style.height !== '56px') {
                this.button.style.height = '56px';
                this.button.style.minHeight = '56px';
                this.button.style.maxHeight = '56px';
                console.log('🛠️ Button height corrected back to 56px');
            }
        });
        
        observer.observe(this.button, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
        
        console.log('🎯 Button size protection activated: 56x56px');
    }

    init() {
        // Wait for button to be available
        this.waitForButton();
    }

    waitForButton() {
        const checkButton = () => {
            this.button = document.getElementById('floatingVoiceButton');
            if (this.button) {
                this.setupDragging();
                this.loadSavedPosition();
                console.log('🎯 Draggable Voice Button initialized');
            } else {
                // Check again in 100ms
                setTimeout(checkButton, 100);
            }
        };
        checkButton();
    }

    setupDragging() {
        this.longPressTimer = null;
        this.longPressDelay = 500; // 500ms für long press
        this.dragStarted = false;
        this.moved = false;
        this.touchDevice = false;

        // Detect if we have touch support or are in mobile viewport
        this.isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 || 
                           window.innerWidth <= 768 || // Mobile viewport
                           /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (this.isTouchDevice) {
            // Only touch events for mobile devices
            this.button.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
            console.log('📱 Touch device detected - using long-press for drag');
        } else {
            // Only mouse events for desktop
            this.button.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
            console.log('🖥️ Desktop device detected - using immediate drag');
        }

        // Prevent context menu on long press
        this.button.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Touch event handlers (Mobile)
    handleTouchStart(e) {
        this.moved = false;
        this.dragStarted = false;
        
        // Get touch position
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        
        // Get current button position
        const rect = this.button.getBoundingClientRect();
        this.initialX = rect.left;
        this.initialY = rect.top;
        this.offsetX = touch.clientX - rect.left;
        this.offsetY = touch.clientY - rect.top;
        
        // Start long press timer für drag
        this.longPressTimer = setTimeout(() => {
            this.dragStarted = true;
            this.isDragging = true;
            this.button.style.cursor = 'grabbing';
            this.button.style.transform = 'scale(1.1)';
            console.log('📱 Long press detected - drag mode activated');
        }, this.longPressDelay);
        
        // DON'T prevent default - allow normal tap events to work
        console.log('📱 Touch start - timer started');
    }

    handleTouchMove(e) {
        if (!this.dragStarted) {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - this.startX);
            const deltaY = Math.abs(touch.clientY - this.startY);
            
            // If moved more than 10px, clear long press timer
            if (deltaX > 10 || deltaY > 10) {
                this.moved = true;
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
            }
        }
        
        // Only handle move if drag is active
        if (this.isDragging && this.dragStarted) {
            e.preventDefault();
            this.handleMove(e);
        }
    }

    handleTouchEnd(e) {
        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        if (this.dragStarted) {
            // End drag
            this.handleEnd(e);
        } else if (!this.moved) {
            // Normal tap - trigger voice button click event
            console.log('📱 Normal tap detected - triggering voice button');
            e.preventDefault();
            
            // Find the actual voice button and trigger its click
            const voiceButton = document.getElementById('vapiVoiceButton');
            if (voiceButton) {
                voiceButton.click();
                console.log('📱 Voice button clicked programmatically');
            }
        }
        
        this.dragStarted = false;
        this.moved = false;
    }

    // Mouse event handler (Desktop) 
    handleStart(e) {
        e.preventDefault();
        this.startDrag();
        
        // Get mouse position
        const rect = this.button.getBoundingClientRect();
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.initialX = rect.left;
        this.initialY = rect.top;
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
        
        console.log('🎯 Mouse drag started');
    }

    startDrag() {
        this.isDragging = true;
        this.dragStarted = true;
        
        // Add visual feedback
        this.button.style.transition = 'none';
        this.button.style.transform = 'scale(1.1)';
        this.button.style.zIndex = '9999';
    }

    handleMove(e) {
        if (!this.isDragging || !this.dragStarted) return;
        
        e.preventDefault();
        
        // Get touch or mouse position
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        // Calculate new position based on offset
        this.currentX = clientX - this.offsetX;
        this.currentY = clientY - this.offsetY;
        
        // Constrain to viewport with 1px minimum margin
        const maxX = window.innerWidth - this.button.offsetWidth - this.minMargin;
        const maxY = window.innerHeight - this.button.offsetHeight - this.minMargin;
        
        this.currentX = Math.max(this.minMargin, Math.min(this.currentX, maxX));
        this.currentY = Math.max(this.minMargin, Math.min(this.currentY, maxY));
        
        // Apply position
        this.button.style.left = `${this.currentX}px`;
        this.button.style.top = `${this.currentY}px`;
        this.button.style.bottom = 'auto';
        this.button.style.right = 'auto';
    }

    handleEnd(e) {
        if (!this.isDragging || !this.dragStarted) return;
        
        this.isDragging = false;
        this.dragStarted = false;
        
        // Remove visual feedback
        this.button.style.transform = 'scale(1)';
        this.button.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        this.button.style.zIndex = '40';
        
        // Final position constraint (no snapping - button stays where dropped)
        this.constrainToViewport();
        
        // Save position
        this.savePosition();
        
        console.log('🎯 Voice button positioned at:', this.currentX, this.currentY);
    }

    constrainToViewport() {
        // Ensure button stays within viewport with minimum margin
        const maxX = window.innerWidth - this.button.offsetWidth - this.minMargin;
        const maxY = window.innerHeight - this.button.offsetHeight - this.minMargin;
        
        // Apply constraints but keep button where user dropped it
        const constrainedX = Math.max(this.minMargin, Math.min(this.currentX, maxX));
        const constrainedY = Math.max(this.minMargin, Math.min(this.currentY, maxY));
        
        // Only update if position actually changed
        if (constrainedX !== this.currentX || constrainedY !== this.currentY) {
            this.currentX = constrainedX;
            this.currentY = constrainedY;
            
            this.button.style.left = `${this.currentX}px`;
            this.button.style.top = `${this.currentY}px`;
        }
    }

    savePosition() {
        const position = {
            x: this.currentX,
            y: this.currentY,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('voiceButtonPosition', JSON.stringify(position));
        } catch (e) {
            console.warn('Could not save voice button position:', e);
        }
    }

    loadSavedPosition() {
        try {
            const saved = localStorage.getItem('voiceButtonPosition');
            if (!saved) return;
            
            const position = JSON.parse(saved);
            
            // Check if position is recent (within 7 days)
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - position.timestamp > sevenDays) {
                localStorage.removeItem('voiceButtonPosition');
                return;
            }
            
            // Validate position is still within viewport with minimum margin
            const maxX = window.innerWidth - this.button.offsetWidth - this.minMargin;
            const maxY = window.innerHeight - this.button.offsetHeight - this.minMargin;
            
            if (position.x >= this.minMargin && position.x <= maxX && position.y >= this.minMargin && position.y <= maxY) {
                this.currentX = position.x;
                this.currentY = position.y;
                
                // Apply saved position
                this.button.style.left = `${position.x}px`;
                this.button.style.top = `${position.y}px`;
                this.button.style.bottom = 'auto';
                this.button.style.right = 'auto';
                
                console.log('🎯 Voice button position restored from localStorage');
            }
        } catch (e) {
            console.warn('Could not load voice button position:', e);
        }
    }

    // Reset to default position
    resetPosition() {
        this.button.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        this.button.style.left = 'auto';
        this.button.style.top = 'auto';
        this.button.style.bottom = '1.5rem';
        this.button.style.right = '1.5rem';
        
        localStorage.removeItem('voiceButtonPosition');
        console.log('🎯 Voice button position reset to default');
    }

    // Handle window resize
    handleResize() {
        if (!this.button) return;
        
        // Ensure button is still within viewport after resize
        const rect = this.button.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        if (rect.left > maxX || rect.top > maxY || rect.left < this.minMargin || rect.top < this.minMargin) {
            this.currentX = rect.left;
            this.currentY = rect.top;
            this.constrainToViewport();
            this.savePosition();
        }
    }
}

// Initialize draggable voice button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.draggableVoiceButton = new DraggableVoiceButton();
    });
} else {
    window.draggableVoiceButton = new DraggableVoiceButton();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.draggableVoiceButton) {
        window.draggableVoiceButton.handleResize();
    }
});

// Expose reset function globally for debugging
window.resetVoiceButtonPosition = () => {
    if (window.draggableVoiceButton) {
        window.draggableVoiceButton.resetPosition();
    }
};
