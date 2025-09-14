// Leaderboard management module
import { getTranslation, getCurrentLang } from './i18n.js';

// Leaderboard data storage
let leaderboardData = {};
let availableServers = [];
let currentServerId = null;
let isLoading = false;

// Function to get server list from servers data
function updateServerList(serversData) {
  // Show all servers from API
  availableServers = serversData.map(server => {
    const serverId = extractServerId(server);
    return {
      ...server,
      serverId: serverId
    };
  }).filter(server => server.serverId); // Only servers with extractable IDs
  
  // Sort servers by ID
  availableServers.sort((a, b) => parseInt(a.serverId) - parseInt(b.serverId));
  
  renderServerTabs();
  
  // Start preloading leaderboard data
  preloadLeaderboardData();
}

// Function to preload all leaderboard data
async function preloadLeaderboardData() {
  if (isLoading) return;
  
  isLoading = true;
  setRefreshButtonState(true);
  
  console.log('Preloading leaderboard data...');
  
  // Load data for servers sequentially to avoid rate limiting
  let hasSelectedServer = false;
  
  for (let i = 0; i < availableServers.length; i++) {
    const server = availableServers[i];
    
    // Show loading state for this server
    const tab = document.querySelector(`[data-server-id="${server.serverId}"]`);
    if (tab) {
      tab.classList.add('loading');
      tab.classList.add('disabled');
    }
    
    const result = await loadServerData(server.serverId);
    
    // Remove loading state
    if (tab) {
      tab.classList.remove('loading');
    }
    
    // Update UI immediately when data loads
    if (result && !hasSelectedServer) {
      updateTabsAvailability();
      // Auto-select first server with data
      if (tab) {
        selectServerTab(server.serverId, tab);
        hasSelectedServer = true;
      }
    } else {
      // Update this specific tab
      updateTabsAvailability();
    }
    
    // Add delay between requests to avoid rate limiting
    if (i < availableServers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 600)); // Increased delay
    }
  }
  
  isLoading = false;
  setRefreshButtonState(false);
  
  // Final update of all tabs
  updateTabsAvailability();
  
  // If no server was selected during loading, select first available
  if (!hasSelectedServer) {
    selectFirstAvailableServer();
  }
  
  console.log('Leaderboard data preloading completed');
}

// Function to load data for a specific server
async function loadServerData(serverId) {
  const maxRetries = 3; // Increased retries
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const url = `https://conflictineurope.com/server${serverId}_top_players.json`;
      let response;
      let data;
      
      try {
        // Try direct fetch first with shorter timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout
        
        response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // If 404, file doesn't exist - don't retry
          if (response.status === 404) {
            console.log(`Server ${serverId} data file not found (404)`);
            return false;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        data = await response.json();
      } catch (corsError) {
        // Only try proxy if it's not a 404 or timeout
        if (corsError.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        // Try with CORS proxy - use different proxies on retries
        const proxies = [
          'https://api.allorigins.win/get?url=',
          'https://corsproxy.io/?'
        ];
        
        const proxyIndex = retryCount % proxies.length;
        const corsProxy = proxies[proxyIndex];
        const targetUrl = encodeURIComponent(url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for proxy
        
        response = await fetch(corsProxy + targetUrl, {
          method: 'GET',
          cache: 'no-cache',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Proxy request failed! status: ${response.status}`);
        }
        
        if (corsProxy.includes('allorigins')) {
          const proxyData = await response.json();
          data = JSON.parse(proxyData.contents);
        } else {
          data = await response.json();
        }
      }
      
      // Validate data structure
      if (!data || typeof data !== 'object' || !Array.isArray(data.players) || data.players.length === 0) {
        throw new Error('Invalid data format');
      }
      
      // Store data
      leaderboardData[serverId] = data;
      console.log(`✓ Loaded data for server ${serverId}`);
      return true;
      
    } catch (error) {
      retryCount++;
      
      // Don't retry for 404 errors (file doesn't exist)
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.log(`Server ${serverId} data file not found - skipping retries`);
        return false;
      }
      
      console.warn(`✗ Failed to load server ${serverId} (attempt ${retryCount}):`, error.message);
      
      if (retryCount < maxRetries) {
        // Longer delay for rate limiting errors
        const delay = error.message.includes('429') || error.message.includes('Too Many Requests') 
          ? 3000 // 3 seconds for rate limiting
          : 1500; // 1.5 seconds for other errors
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
}

// Function to update tabs availability based on loaded data
function updateTabsAvailability() {
  document.querySelectorAll('.server-tab').forEach(tab => {
    const serverId = tab.dataset.serverId;
    const hasData = leaderboardData[serverId];
    const isLoading = tab.classList.contains('loading');
    
    if (hasData) {
      tab.classList.remove('disabled');
      tab.classList.remove('loading');
      tab.removeAttribute('data-status');
      // Enable clicks for servers with data
      tab.style.pointerEvents = 'auto';
      tab.style.cursor = 'pointer';
    } else if (!isLoading) {
      tab.classList.add('disabled');
      const lang = getCurrentLang();
      tab.dataset.status = getTranslation('leaderboard.no_data_short', lang) || 'Soon';
      // Keep disabled tabs non-clickable
      tab.style.pointerEvents = 'none';
      tab.style.cursor = 'not-allowed';
    } else {
      // Loading state - disable clicks until data loads
      tab.style.pointerEvents = 'none';
      tab.style.cursor = 'wait';
    }
  });
}

// Function to select first available server
function selectFirstAvailableServer() {
  // Find first server with data
  const firstAvailable = availableServers.find(server => 
    leaderboardData[server.serverId]
  );
  
  if (firstAvailable) {
    const firstTab = document.querySelector(`[data-server-id="${firstAvailable.serverId}"]`);
    if (firstTab) {
      selectServerTab(firstAvailable.serverId, firstTab);
    }
  }
}

// Function to set refresh button state
function setRefreshButtonState(loading) {
  const refreshBtn = document.getElementById('refreshLeaderboard');
  if (!refreshBtn) return;
  
  const lang = getCurrentLang();
  const refreshText = refreshBtn.querySelector('.refresh-text');
  
  if (loading) {
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
    if (refreshText) {
      refreshText.textContent = getTranslation('leaderboard.refreshing', lang) || 'Refreshing...';
    }
  } else {
    refreshBtn.classList.remove('loading');
    refreshBtn.disabled = false;
    if (refreshText) {
      refreshText.textContent = getTranslation('leaderboard.refresh', lang) || 'Refresh';
    }
  }
}

// Function to extract server ID from server data
function extractServerId(server) {
  // Skip test servers
  if (server.server_name.toLowerCase().includes('test')) {
    return null;
  }
  
  // Try to extract from server name like "[EU] Conflict in Europe #1"
  const nameMatch = server.server_name.match(/#(\d+)/);
  if (nameMatch) {
    return nameMatch[1];
  }
  
  // Try to extract from port, but only for official CIE servers
  if (server.port && server.server_name.includes('Conflict in Europe')) {
    const port = server.port;
    if (port === 21020) return '1';
    if (port === 22020) return '2';
    if (port === 23020) return '3';
    if (port === 24020) return '4';
    if (port === 25020) return '5';
    if (port === 36020) return '6';
  }
  
  return null;
}

// Function to render server tabs
function renderServerTabs() {
  const tabsList = document.querySelector('.server-tabs-list');
  if (!tabsList) return;
  
  const lang = getCurrentLang();
  
  // Clear existing tabs
  tabsList.innerHTML = '';
  
  // Add server tabs for all servers
  availableServers.forEach(server => {
    const tab = document.createElement('button');
    tab.className = 'server-tab disabled'; // Start as disabled
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', 'false');
    tab.dataset.serverId = server.serverId;
    tab.style.pointerEvents = 'none'; // Initially disable clicks
    
    tab.innerHTML = `
      <span class="server-name">Server</span>
      <span class="server-id">#${server.serverId}</span>
    `;
    
    // Always add click handler
    tab.addEventListener('click', () => selectServerTab(server.serverId, tab));
    
    tabsList.appendChild(tab);
  });
}

// Function to select a server tab
function selectServerTab(serverId, tabElement) {
  // Prevent selection if tab is disabled (no data) or still loading
  if (tabElement.classList.contains('disabled') || tabElement.classList.contains('loading')) return;
  
  // Allow selection if server has data, even during global loading
  if (!leaderboardData[serverId]) return;
  
  // Remove active class from all tabs
  document.querySelectorAll('.server-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
  });
  
  // Add active class to selected tab
  tabElement.classList.add('active');
  tabElement.setAttribute('aria-selected', 'true');
  
  currentServerId = serverId;
  
  // Show leaderboard data if available
  if (leaderboardData[serverId]) {
    renderLeaderboard(leaderboardData[serverId]);
  } else {
    showNoDataMessage();
  }
}

// Function to initialize leaderboard functionality
function initLeaderboard() {
  // Show initial empty state
  const loadingDiv = document.querySelector('.leaderboard-loading');
  const emptyDiv = document.querySelector('.leaderboard-empty');
  const dataDiv = document.querySelector('.leaderboard-data');
  
  if (loadingDiv && emptyDiv && dataDiv) {
    loadingDiv.style.display = 'none';
    dataDiv.style.display = 'none';
    emptyDiv.style.display = 'block';
  }
  
  // Setup refresh button
  const refreshBtn = document.getElementById('refreshLeaderboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefreshClick);
  }
}

// Function to handle refresh button click
async function handleRefreshClick() {
  if (isLoading) return;
  
  // Clear existing data
  leaderboardData = {};
  
  const lang = getCurrentLang();
  const loadingText = getTranslation('leaderboard.loading_short', lang) || 'Loading...';
  
  // Update all tabs to show loading state
  document.querySelectorAll('.server-tab').forEach(tab => {
    tab.classList.add('disabled');
    tab.dataset.status = loadingText;
  });
  
  // Reload all data
  await preloadLeaderboardData();
  
  // Refresh current view if a server is selected
  if (currentServerId && leaderboardData[currentServerId]) {
    renderLeaderboard(leaderboardData[currentServerId]);
  }
}

// Function to render leaderboard data
function renderLeaderboard(data) {
  const loadingDiv = document.querySelector('.leaderboard-loading');
  const emptyDiv = document.querySelector('.leaderboard-empty');
  const dataDiv = document.querySelector('.leaderboard-data');
  const playersList = document.getElementById('players-list');
  
  if (!dataDiv || !playersList) return;
  
  const lang = getCurrentLang();
  
  try {
    // Hide loading, show data
    loadingDiv.style.display = 'none';
    emptyDiv.style.display = 'none';
    dataDiv.style.display = 'block';
    
    // Update match info with safe defaults
    document.getElementById('match-duration').textContent = data.duration || '-';
    document.getElementById('total-kills').textContent = data.total_kills?.toString() || '0';
    
    const winnerInfo = document.getElementById('winner-info');
    const winnerElement = document.getElementById('match-winner');
    if (data.winner && data.winner.trim()) {
      winnerElement.textContent = data.winner;
      winnerInfo.style.display = 'block';
    } else {
      winnerInfo.style.display = 'none';
    }
    
    // Render players list with error handling for each player
    const playersHtml = data.players.map(player => {
      try {
        // Validate player data
        const rank = parseInt(player.rank) || 0;
        const playerName = player.player || 'Unknown';
        const kills = parseInt(player.kills) || 0;
        const deaths = parseInt(player.deaths) || 0;
        const kd = parseFloat(player.kd) || 0;
        
        return `
          <div class="table-row ${rank <= 3 ? `rank-${rank}` : ''}">
            <div class="rank-col">
              <span class="rank-number">${rank}</span>
              ${rank <= 3 ? `<span class="rank-medal">${getRankMedal(rank)}</span>` : ''}
            </div>
            <div class="player-col">
              <span class="player-name">${escapeHtml(playerName)}</span>
            </div>
            <div class="kills-col">${kills}</div>
            <div class="deaths-col">${deaths}</div>
            <div class="kd-col">${kd.toFixed(2)}</div>
          </div>
        `;
      } catch (playerError) {
        console.warn('Error rendering player:', player, playerError);
        return ''; // Skip invalid player
      }
    }).filter(html => html).join('');
    
    playersList.innerHTML = playersHtml;
    
  } catch (error) {
    console.error('Error rendering leaderboard:', error);
    showLeaderboardError();
  }
}

// Function to get rank medal emoji
function getRankMedal(rank) {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}

// Function to escape HTML
function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Function to show error state
function showLeaderboardError() {
  const loadingDiv = document.querySelector('.leaderboard-loading');
  const emptyDiv = document.querySelector('.leaderboard-empty');
  const dataDiv = document.querySelector('.leaderboard-data');
  
  loadingDiv.style.display = 'none';
  dataDiv.style.display = 'none';
  emptyDiv.style.display = 'block';
  
  const lang = getCurrentLang();
  emptyDiv.innerHTML = `<p>${getTranslation('leaderboard.error', lang)}</p>`;
}

// Function to show no data message
function showNoDataMessage() {
  const loadingDiv = document.querySelector('.leaderboard-loading');
  const emptyDiv = document.querySelector('.leaderboard-empty');
  const dataDiv = document.querySelector('.leaderboard-data');
  
  loadingDiv.style.display = 'none';
  dataDiv.style.display = 'none';
  emptyDiv.style.display = 'block';
  
  const lang = getCurrentLang();
  emptyDiv.innerHTML = `<p>${getTranslation('leaderboard.no_data', lang)}</p>`;
}

export { 
  initLeaderboard,
  updateServerList,
  preloadLeaderboardData
};
