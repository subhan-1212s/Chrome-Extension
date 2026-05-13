let activeTabId = null;
let activeStartTime = null;
let activeDomain = null;

const API_URL = 'http://localhost:5000/api';
const USER_ID = 'user_demo@example.com'; // Placeholder user ID

// Track tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await handleTabChange(activeInfo.tabId);
});

// Track window focus
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await stopTracking();
  } else {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) await handleTabChange(tab.id);
  }
});

async function handleTabChange(tabId) {
  await stopTracking();
  
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url && tab.url.startsWith('http')) {
      const domain = new URL(tab.url).hostname;
      activeTabId = tabId;
      activeDomain = domain;
      activeStartTime = Date.now();
      console.log(`Started tracking: ${domain}`);
    }
  } catch (e) {
    console.error(e);
  }
}

async function stopTracking() {
  if (activeStartTime && activeDomain) {
    const duration = Math.round((Date.now() - activeStartTime) / 1000);
    if (duration > 0) {
      const activity = {
        userId: USER_ID,
        domain: activeDomain,
        startTime: new Date(activeStartTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: duration
      };
      
      // Save locally or sync immediately
      syncActivity(activity);
    }
  }
  activeTabId = null;
  activeStartTime = null;
  activeDomain = null;
}

async function syncActivity(activity) {
  try {
    await fetch(`${API_URL}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    console.log(`Synced: ${activity.domain} (${activity.duration}s)`);
  } catch (e) {
    console.error('Sync failed:', e);
  }
}

// Update blocking rules based on user preferences
chrome.alarms.create('syncPreferences', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncPreferences') {
    updateBlockingRules();
  }
});

async function updateBlockingRules() {
  try {
    const response = await fetch(`${API_URL}/preferences/${USER_ID}`);
    const data = await response.json();
    const blockedSites = data.blockedSites || [];
    
    // Convert domains to DNR rules
    const rules = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'block' },
      condition: { urlFilter: `*://${site}/*`, resourceTypes: ['main_frame'] }
    }));

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map(r => r.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: rules
    });
    console.log('Blocking rules updated');
  } catch (e) {
    console.error('Failed to update rules:', e);
  }
}

// Initial update
updateBlockingRules();
