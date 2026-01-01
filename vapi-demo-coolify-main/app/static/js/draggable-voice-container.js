/**
 * Draggable Voice Container with Separate Drag Ring
 * 
 * NEW APPROACH:
 * - Voice Button: Only for voice calls - no dragging, no touch conflicts
 * - Drag Ring: Small gray ring 10px below - only for dragging
 * - Solves 490px height issue and mobile touch conflicts
 * - Clean separation of concerns
 */

class DraggableVoiceContainer {
    constructor() {
        this.container = document.getElementById('floatingVoiceContainer');
        this.voiceButton = document.getElementById('vapiVoiceButton');
        this.dragRing = document.getElementById('dragRing');
        
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.startX = 0;
        this.startY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.minMargin = 1; // 1px minimum distance from screen edges
        
        this.init();
    }
    
    init() {
        this.waitForElements();
    }
    
    waitForElements() {
        const checkElements = () => {
            if (this.container && this.dragRing) {
                this.setupDragRing();
                this.setupVoiceButton();
                this.loadPosition();
                console.log('🎯 Voice Container with Drag Ring initialized');
            } else {
                setTimeout(checkElements, 100);
            }
        };
        checkElements();
    }
    
    setupDragRing() {
        // Only the drag ring handles dragging
        this.dragRing.addEventListener('mousedown', (e) => this.handleDragStart(e));
        this.dragRing.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: false });
        
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        
        document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
        document.addEventListener('touchend', (e) => this.handleDragEnd(e));
        
        // Visual feedback on hover
        this.dragRing.addEventListener('mouseenter', () => {
            this.dragRing.style.opacity = '0.8';
            this.dragRing.style.transform = 'translate(-50%, 0) scale(1.1)';
        });
        
        this.dragRing.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.dragRing.style.opacity = '0.5';
                this.dragRing.style.transform = 'translate(-50%, 0) scale(1)';
            }
        });
    }
    
    setupVoiceButton() {
        // Voice button is completely separate - only for calls
        // Remove any existing drag-related classes/events
        this.voiceButton.style.cursor = 'pointer';
        
        console.log('🎤 Voice button configured for calls only');
    }
    
    handleDragStart(e) {
        e.preventDefault();
        this.isDragging = true;
        
        // Get touch or mouse coordinates
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // Store start position
        this.startX = clientX;
        this.startY = clientY;
        
        // Get current container position
        const rect = this.container.getBoundingClientRect();
        this.currentX = rect.left;
        this.currentY = rect.top;
        this.offsetX = clientX - rect.left;
        this.offsetY = clientY - rect.top;
        
        // Visual feedback
        this.dragRing.style.opacity = '1';
        this.dragRing.style.transform = 'translate(-50%, 0) scale(1.2)';
        this.container.style.transition = 'none';
        this.container.style.zIndex = '9999';
        
        console.log('🎯 Drag started on ring');
    }
    
    handleDragMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        // Get touch or mouse coordinates
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // Calculate new position
        const newX = clientX - this.offsetX;
        const newY = clientY - this.offsetY;
        
        // Apply constraints (1px margin from screen edges)
        const constrainedPosition = this.constrainToViewport(newX, newY);
        
        // Update position
        this.container.style.left = constrainedPosition.x + 'px';
        this.container.style.top = constrainedPosition.y + 'px';
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
        
        this.currentX = constrainedPosition.x;
        this.currentY = constrainedPosition.y;
    }
    
    handleDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // Reset visual feedback
        this.dragRing.style.opacity = '0.5';
        this.dragRing.style.transform = 'translate(-50%, 0) scale(1)';
        this.container.style.transition = 'all 0.3s ease';
        this.container.style.zIndex = '40';
        
        // Save position
        this.savePosition();
        
        console.log('🎯 Drag ended, position saved:', this.currentX, this.currentY);
    }
    
    constrainToViewport(x, y) {
        const containerWidth = 56; // Voice button width
        const containerHeight = 90; // Voice button + drag ring height
        
        const maxX = window.innerWidth - containerWidth - this.minMargin;
        const maxY = window.innerHeight - containerHeight - this.minMargin;
        
        return {
            x: Math.max(this.minMargin, Math.min(x, maxX)),
            y: Math.max(this.minMargin, Math.min(y, maxY))
        };
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
    
    loadPosition() {
        try {
            const saved = localStorage.getItem('voiceButtonPosition');
            if (saved) {
                const position = JSON.parse(saved);
                
                // Validate position is still within viewport
                const constrained = this.constrainToViewport(position.x, position.y);
                
                // Apply position
                this.container.style.left = constrained.x + 'px';
                this.container.style.top = constrained.y + 'px';
                this.container.style.right = 'auto';
                this.container.style.bottom = 'auto';
                
                this.currentX = constrained.x;
                this.currentY = constrained.y;
                
                console.log('🎯 Voice container position restored:', constrained.x, constrained.y);
                return;
            }
        } catch (e) {
            console.warn('Could not load voice button position:', e);
        }
        
        // Default position (bottom-right)
        this.currentX = window.innerWidth - 56 - 24;
        this.currentY = window.innerHeight - 90 - 24;
        console.log('🎯 Using default voice container position');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.draggableVoiceContainer = new DraggableVoiceContainer();
});

// Also initialize on window load as fallback
window.addEventListener('load', () => {
    if (!window.draggableVoiceContainer) {
        window.draggableVoiceContainer = new DraggableVoiceContainer();
    }
});
