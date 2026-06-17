import { SocksProxyAgent } from 'socks-proxy-agent';
import { logger } from './logger.js';

let torAgent = null;
let torEnabled = false;

export function initTorProxy(proxyUrl) {
  if (!proxyUrl) {
    torEnabled = false;
    torAgent = null;
    return;
  }

  try {
    torAgent = new SocksProxyAgent(proxyUrl);
    torEnabled = true;
    logger.info('[TOR] Proxy SOCKS5 configure', { proxy: proxyUrl });
  } catch (error) {
    torEnabled = false;
    torAgent = null;
    logger.warn('[TOR] Echec de configuration du proxy', { error: error.message });
  }
}

export function isTorEnabled() {
  return torEnabled;
}

export async function fetchWithTor(url, options = {}) {
  const fetchOptions = { ...options };

  if (torAgent) {
    fetchOptions.dispatcher = torAgent;
  }

  try {
    return await fetch(url, fetchOptions);
  } catch (error) {
    if (torEnabled) {
      logger.warn('[TOR] Requete echouee via Tor, tentative sans proxy', { url });
      const fallbackOptions = { ...options };
      delete fallbackOptions.dispatcher;
      return await fetch(url, fallbackOptions);
    }
    throw error;
  }
}

export function getTorDispatcher() {
  return torAgent;
}
