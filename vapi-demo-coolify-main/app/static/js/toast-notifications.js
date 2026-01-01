// Toast Notification System
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    // Set icon and colors based on type
    let iconHtml = '';
    let iconBg = '';
    
    switch (type) {
        case 'success':
            iconBg = 'bg-green-100 dark:bg-green-900';
            iconHtml = '<svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            break;
        case 'error':
            iconBg = 'bg-red-100 dark:bg-red-900';
            iconHtml = '<svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            break;
        case 'info':
            iconBg = 'bg-blue-100 dark:bg-blue-900';
            iconHtml = '<svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
            break;
    }

    toastIcon.className = `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${iconBg}`;
    toastIcon.innerHTML = iconHtml;
    toastTitle.textContent = title;
    toastMessage.textContent = message;

    // Show toast
    toast.classList.remove('translate-y-full', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 4000);
}

// Make function globally accessible
window.showToast = showToast;
