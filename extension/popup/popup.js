const API_URL = 'http://localhost:5000/api';
const USER_ID = 'user_demo@example.com';

document.addEventListener('DOMContentLoaded', async () => {
  updateUI();
  
  // Update stats every 5 seconds while popup is open
  const interval = setInterval(updateUI, 5000);
  
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' }); // Assuming React app runs here
  });

  document.getElementById('toggle-focus').addEventListener('click', async () => {
    // Logic to toggle focus mode
    const btn = document.getElementById('toggle-focus');
    const isFocus = btn.innerText.includes('Stop');
    
    try {
        const response = await fetch(`${API_URL}/preferences`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: USER_ID,
                focusMode: !isFocus
            })
        });
        const data = await response.json();
        updateFocusUI(data.focusMode);
    } catch (e) {
        console.error(e);
    }
  });

  // Cleanup on close
  window.addEventListener('unload', () => clearInterval(interval));
});

async function updateUI() {
  try {
    // Get current tab info from background script or directly
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.startsWith('http')) {
      const domain = new URL(tab.url).hostname;
      document.getElementById('current-domain').innerText = domain;
    }

    // Fetch stats from server
    const statsResponse = await fetch(`${API_URL}/stats/${USER_ID}`);
    const stats = await statsResponse.json();
    
    let totalSeconds = 0;
    stats.forEach(item => totalSeconds += item.totalDuration);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    document.getElementById('today-time').innerText = `${hours}h ${minutes}m`;
    
    // Progress calculation (Assume 8h goal)
    const goalSeconds = 8 * 3600;
    const progress = Math.min((totalSeconds / goalSeconds) * 100, 100);
    document.getElementById('daily-progress').style.width = `${progress}%`;

    // Fetch preferences for focus mode state
    const prefResponse = await fetch(`${API_URL}/preferences/${USER_ID}`);
    const pref = await prefResponse.json();
    updateFocusUI(pref.focusMode);

  } catch (e) {
    console.error('UI update failed:', e);
  }
}

function updateFocusUI(isFocus) {
    const btn = document.getElementById('toggle-focus');
    const badge = document.querySelector('.status-badge');
    
    if (isFocus) {
        btn.innerText = 'Stop Focus Mode';
        btn.classList.remove('primary');
        btn.classList.add('secondary');
        badge.innerText = 'Focus Mode Active';
        badge.style.background = 'rgba(99, 102, 241, 0.2)';
        badge.style.color = '#6366f1';
    } else {
        btn.innerText = 'Start Focus Mode';
        btn.classList.add('primary');
        btn.classList.remove('secondary');
        badge.innerText = 'Tracking Active';
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#10b981';
    }
}
