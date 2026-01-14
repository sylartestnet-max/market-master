/**
 * ═══════════════════════════════════════════════════════════════════
 * MARKET NUI BRIDGE SCRIPT (Minimal - React handles UI)
 * ═══════════════════════════════════════════════════════════════════
 */

// Wait for React to be ready, then hide loading message
window.addEventListener('DOMContentLoaded', function() {
    console.log('[Market NUI] Bridge script loaded, waiting for React...');
});

// ESC key handler (backup - React also handles this)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Let React handle it via window message listener
        // This is just a fallback if React isn't responding
        if (typeof window.GetParentResourceName === 'function') {
            fetch(`https://${window.GetParentResourceName()}/closeMarket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            }).catch(() => {});
        }
    }
});

console.log('[Market NUI] Bridge script initialized');
