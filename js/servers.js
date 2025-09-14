// Server management module
import { getTranslation, getCurrentLang } from './i18n.js';

// Server data storage
let serversData = [];

// Function to get server status
function getServerStatus(server, lang) {
  if (server.offline) {
    return {
      online: false,
      text: getTranslation('servers.offline', lang)
    };
  }
  
  if (server.player_count !== undefined && server.max_players) {
    return {
      online: true,
      text: getTranslation('servers.online', lang)
    };
  }
  return {
    online: false,
    text: getTranslation('servers.offline', lang)
  };
}

// Function to get map image based on server data
function getServerMap(server) {
  // Default map
  let mapName = 'DonAirConflict';
  
  // Check if map_name is specified in JSON
  if (server.map_name) {
    const mapNameLower = server.map_name.toLowerCase();
    
    if (mapNameLower.includes('donairconflict') || mapNameLower.includes('donair')) {
      mapName = 'DonAirConflict';
    } else if (mapNameLower.includes('udachne') || mapNameLower.includes('удачне')) {
      mapName = 'Udachne';
    } else if (mapNameLower.includes('serhiivka') || mapNameLower.includes('серхіївка')) {
      mapName = 'Serhiivka';
    }
  } else if (server.map) {
    // Fallback to 'map' field if 'map_name' is not available
    const mapLower = server.map.toLowerCase();
    
    if (mapLower.includes('donairconflict') || mapLower.includes('donair')) {
      mapName = 'DonAirConflict';
    } else if (mapLower.includes('udachne') || mapLower.includes('удачне')) {
      mapName = 'Udachne';
    } else if (mapLower.includes('serhiivka') || mapLower.includes('серхіївка')) {
      mapName = 'Serhiivka';
    }
  } else if (server.server_name) {
    // Fallback to server name analysis
    const serverName = server.server_name.toLowerCase();
    
    if (serverName.includes('serhiivka') || serverName.includes('серхіївка')) {
      mapName = 'Serhiivka';
    } else if (serverName.includes('udachne') || serverName.includes('удачне')) {
      mapName = 'Udachne';
    } else if (serverName.includes('donair') || serverName.includes('дон')) {
      mapName = 'DonAirConflict';
    }
  }
  
  return `assets/${mapName}.png`;
}

// Function to parse server name and extract features
function parseServerInfo(serverName) {
  const features = [];
  
  if (serverName.includes('1pp/3pp')) {
    features.push('Third-person view');
  } else if (serverName.includes('1pp')) {
    features.push('First-person only, except for vehicles');
  }
  
  if (serverName.includes('Hardcore')) {
    features.push('Hardcore mode');
    features.push('Shoulder radios unavailable');
    features.push('Limited nickname visibility');
    features.push('Killchat disabled');
  } else {
    features.push('Portable shoulder radios: spawnable and placeable');
    features.push('Nickname rendering up to 300 meters');
    features.push('Killchat fully enabled');
  }
  
  if (serverName.includes('Drones')) {
    features.push('Drones enabled');
  }
  
  return features;
}

// Function to render servers
function renderServers() {
  const serverList = document.querySelector('.server-list');
  if (!serverList) return;
  
  const lang = getCurrentLang() || 'uk'; // Fallback to 'uk' if currentLang is not set
  
  if (serversData.length === 0) {
    serverList.innerHTML = `
      <div class="server-loading">
        ${getTranslation('servers.loading', lang)}
      </div>
    `;
    return;
  }
  
  serverList.innerHTML = serversData.map((server, index) => {
    const status = getServerStatus(server, lang);
    const features = parseServerInfo(server.server_name);
    const mapImage = getServerMap(server);
    const cleanName = server.server_name
      .replace(/\s*\|\s*discord\.gg\/[^\s]*/, '') // Remove discord link
      .replace(/\s*\|\s*$/, '') // Remove trailing separator
      .trim();
    
    const ip = server.ip || 'N/A';
    const port = server.port || 'N/A';
    const ipPort = ip !== 'N/A' && port !== 'N/A' ? `${ip}:${port}` : 'N/A';
    
    // Determine region based on IP
    let region = 'EU';
    if (ip.startsWith('49.12')) {
      region = 'DE (Hetzner)';
    } else if (ip.startsWith('78.46')) {
      region = 'DE (Hetzner)';
    }
    
    return `
      <article class="server-card">
        <div class="server-map" data-map-src="${mapImage}" data-map-name="${cleanName}" onclick="openMapModal('${mapImage}', '${cleanName.replace(/'/g, '\\\'')}')" onkeydown="if(event.key==='Enter') openMapModal('${mapImage}', '${cleanName.replace(/'/g, '\\\'')}');" role="button" tabindex="0" aria-label="View map in full size">
          <img src="${mapImage}" alt="Server map" loading="lazy" />
        </div>

        <div class="server-info">
          <div class="server-name">${cleanName}</div>
          <div class="server-meta">
            <span class="status ${status.online ? '' : 'offline'}">
              <span class="dot"></span>
              <span>${status.text}</span>
            </span>
            <span>
              <span>${getTranslation('servers.players', lang)}</span>: 
              ${server.player_count || 0} / ${server.max_players || 'N/A'}
            </span>
            <span>
              <span>${getTranslation('servers.region', lang)}</span>: 
              ${region}
            </span>
          </div>
          ${ipPort !== 'N/A' ? `<button class="server-ip" data-copy="${ipPort}">${ipPort}</button>` : ''}
          <ul class="server-features">
            ${features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
        <div class="server-cta">
          <a class="btn btn-primary btn-sm" href="#">
            ${getTranslation('servers.join_now', lang)}
          </a>
        </div>
      </article>
    `;
  }).join('');
  
  // Re-attach copy functionality to new IP buttons
  if (window.attachCopyFunctionality) {
    window.attachCopyFunctionality();
  }
  
  // Update leaderboard server list
  if (window.updateServerList && serversData.length > 0) {
    window.updateServerList(serversData);
  }
}

// Fallback server data if API fails
function loadFallbackServers() {
  console.log('Loading fallback server data...');
  
  serversData = [
    {
      server_name: "[EU] Conflict in Europe #1 (CIE) | UA-RU War | 1pp/3pp",
      player_count: 128,
      max_players: 128,
      ip: "49.12.148.120",
      port: 21020,
      map_name: "DonAirConflict"
    },
    {
      server_name: "[EU] Conflict in Europe #2 (CIE) | UA-RU War | 1pp",
      player_count: 64,
      max_players: 128,
      ip: "49.12.148.120", 
      port: 22020,
      map_name: "Serhiivka CIE"
    },
    {
      server_name: "[EU] Conflict in Europe #3 (CIE) | Drones UA-RU | 1pp/3pp",
      player_count: 100,
      max_players: 128,
      ip: "78.46.90.51",
      port: 23020,
      map_name: "CIE Udachne Conflict"
    },
    {
      server_name: "[EU] Conflict in Europe #4 (CIE) | Hardcore UA-RU | 1pp",
      player_count: 0,
      max_players: 128,
      ip: "78.46.90.51",
      port: 24020,
      offline: true,
      map_name: "DonAirConflict"
    },
    {
      server_name: "[EU] Conflict in Europe #5 (CIE) | Drones UA-RU | 1pp/3pp",
      player_count: 40,
      max_players: 128,
      ip: "49.12.148.120",
      port: 25020,
      map_name: "Serhiivka CIE"
    },
    {
      server_name: "[EU] Conflict in Europe #6 (CIE) | Drones Hardcore UA-RU | 1pp",
      player_count: 90,
      max_players: 128,
      ip: "78.46.90.51",
      port: 36020,
      map_name: "CIE Udachne Conflict"
    }
  ];
  
  renderServers();
}

// Function to load servers from API
async function loadServers() {
  const serverList = document.querySelector('.server-list');
  if (!serverList) return;
  
  // Show loading state
  serverList.innerHTML = `
    <div class="server-loading">
      ${getTranslation('servers.loading', getCurrentLang())}
    </div>
  `;
  
  try {
    // Try direct fetch first
    let response;
    let data;
    
    try {
      response = await fetch('https://conflictineurope.com/servers_info.json', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      data = await response.json();
    } catch (corsError) {
      console.info('Direct fetch failed (expected with CORS), trying proxy method...');
      console.debug('Original error:', corsError.message);
      
      // Try with a CORS proxy
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      const targetUrl = encodeURIComponent('https://conflictineurope.com/servers_info.json');
      
      response = await fetch(proxyUrl + targetUrl);
      
      if (!response.ok) {
        throw new Error(`Proxy request failed! status: ${response.status}`);
      }
      
      const proxyData = await response.json();
      data = JSON.parse(proxyData.contents);
    }
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format');
    }
    
    serversData = data.filter(server => !server.error && server.server_name); // Filter out servers with errors
    console.log('Loaded servers:', serversData.length);
    
    if (serversData.length === 0) {
      throw new Error('No valid servers found');
    }
    
    renderServers();
  } catch (error) {
    console.error('Error loading servers:', error);
    console.error('Error details:', error.message);
    
    // Try to load from backup source or show fallback
    loadFallbackServers();
  }
}

// Auto-refresh servers every 30 seconds
function startServerRefresh() {
  setInterval(() => {
    loadServers();
  }, 30000); // 30 seconds
}

// Map modal functions
function openMapModal(mapSrc, serverName) {
  const modal = document.getElementById('mapModal');
  const modalImg = document.getElementById('map-modal-img');
  const modalTitle = document.getElementById('map-modal-title');
  
  if (!modal || !modalImg || !modalTitle) {
    console.error('Map modal elements not found');
    return;
  }
  
  try {
    modalImg.src = mapSrc;
    modalImg.alt = `Map: ${serverName}`;
    modalTitle.textContent = serverName;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  } catch (error) {
    console.error('Error opening map modal:', error);
  }
}

function closeMapModal() {
  const modal = document.getElementById('mapModal');
  
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

// Initialize map modal functionality
function initMapModal() {
  const modal = document.getElementById('mapModal');
  
  if (!modal) {
    console.warn('Map modal element not found');
    return;
  }
  
  const closeBtn = modal.querySelector('.map-modal-close');
  
  // Close button click
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMapModal);
  }
  
  // Click outside modal to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeMapModal();
    }
  });
  
  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeMapModal();
    }
  });
}

// Make functions available globally
window.openMapModal = openMapModal;
window.closeMapModal = closeMapModal;

export { 
  serversData, 
  loadServers, 
  renderServers, 
  startServerRefresh,
  initMapModal
};
