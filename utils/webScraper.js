/**
 * Web Scraping Utility
 * 
 * Contains functions for scraping various websites without using APIs
 * including Twitter, Instagram, TikTok, Showroom, IDN, YouTube, etc.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { logger } = require('./logger');

// Setup axios defaults
axios.defaults.timeout = 10000; // 10 seconds timeout
axios.defaults.headers.common['User-Agent'] = 
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// For CORS issues
async function bypassCORS(url) {
  return url; // Normally would use a proxy, but for now we'll try direct
}

// Cache mechanism to prevent redundant requests
const cache = {
  data: new Map(),
  expiry: new Map(),
  
  set(key, value, ttlSeconds = 300) {
    this.data.set(key, value);
    this.expiry.set(key, Date.now() + (ttlSeconds * 1000));
    
    // Log cache stats occasionally
    if (this.data.size % 50 === 0) {
      logger.debug(`Cache size: ${this.data.size} items`);
    }
  },
  
  get(key) {
    if (!this.data.has(key) || !this.expiry.has(key)) {
      return null;
    }
    
    const expiry = this.expiry.get(key);
    if (Date.now() > expiry) {
      // Expired
      this.data.delete(key);
      this.expiry.delete(key);
      return null;
    }
    
    return this.data.get(key);
  },
  
  clear() {
    this.data.clear();
    this.expiry.clear();
    logger.debug('Cache cleared');
  }
};

// Clean up cache periodically
setInterval(() => {
  const now = Date.now();
  let count = 0;
  
  for (const [key, expiry] of cache.expiry.entries()) {
    if (now > expiry) {
      cache.data.delete(key);
      cache.expiry.delete(key);
      count++;
    }
  }
  
  if (count > 0) {
    logger.debug(`Cache cleanup: removed ${count} expired items`);
  }
}, 60 * 60 * 1000); // Run every hour

/**
 * Scrape web page with error handling and caching
 * @param {string} url - URL to scrape
 * @param {Object} options - Options for the request
 * @returns {Promise<string|null>} - HTML content or null on error
 */
async function fetchHTML(url, options = {}) {
  const { 
    useCache = true,
    cacheTTL = 300,
    timeout = 10000,
    headers = {},
    retries = 2,
    proxyMode = 'none' // 'none', 'cors-proxy', 'tor'
  } = options;

  // Check cache first
  const cacheKey = `${url}-${JSON.stringify(headers)}`;
  if (useCache) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for: ${url}`);
      return cachedData;
    }
  }

  // Prepare target URL based on proxy mode
  let targetUrl = url;
  if (proxyMode === 'cors-proxy') {
    targetUrl = await bypassCORS(url);
  }

  // User agents rotation to avoid blocking
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  ];
  
  // Enhanced headers to appear more like a real browser
  const enhancedHeaders = {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    ...headers
  };

  // Attempt to fetch with retries
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add a delay for retries to avoid rate limits
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
      const response = await axios.get(targetUrl, {
        headers: enhancedHeaders,
        timeout: timeout,
        maxRedirects: 5,
        validateStatus: status => status < 500 // Accept all responses except server errors
      });
      
      // Some sites return 403 but still provide content
      if (response.status >= 200 && response.status < 300) {
        // Success - cache and return
        if (useCache) {
          cache.set(cacheKey, response.data, cacheTTL);
        }
        return response.data;
      } else {
        logger.warn(`HTTP ${response.status} from ${url}: ${response.statusText}`);
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      lastError = error;
      logger.warn(`Fetch attempt ${attempt + 1}/${retries + 1} failed for ${url}: ${error.message}`);
      
      // Stop retrying on specific errors
      if (error.response && error.response.status === 404) {
        break; // Don't retry on 404 Not Found
      }
    }
  }
  
  logger.error(`Failed to fetch ${url} after ${retries + 1} attempts: ${lastError?.message}`);
  return null;
}

/**
 * Use Python's trafilatura for better content extraction
 * @param {string} url - URL to scrape
 * @returns {Promise<string|null>} - Extracted content or null on error
 */
async function extractWithTrafilatura(url) {
  try {
    const { stdout, stderr } = await execPromise(`python web_scraper.py "${url}"`);
    
    if (stderr && stderr.trim()) {
      logger.warn(`Trafilatura stderr: ${stderr}`);
    }
    
    return stdout;
  } catch (error) {
    logger.error(`Trafilatura extraction error for ${url}: ${error.message}`);
    return null;
  }
}

/**
 * Scrape Twitter/X posts
 * @param {string} url - Twitter profile URL
 * @returns {Promise<Array>} - Array of tweets
 */
async function scrapeTwitter(url) {
  logger.debug(`Scraping Twitter: ${url}`);
  
  try {
    // First try with trafilatura for better content
    let content = await extractWithTrafilatura(url);
    
    // Fallback to direct scraping if trafilatura fails
    if (!content) {
      const html = await fetchHTML(url, { 
        cacheTTL: 300,
        headers: {
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      
      if (!html) return [];
      
      // Direct parsing of Twitter HTML is complex and prone to breaking
      // This is a simplified implementation
      const $ = cheerio.load(html);
      content = $('body').text();
    }
    
    // Basic extraction with regex patterns (simplified)
    const tweets = [];
    
    // Find tweet blocks in the content
    const tweetBlocks = content.split(/(?:Tweet|Post|Status)\s*(?:by|from|:)/gi);
    
    // Process each block (starting from 1 to skip header)
    for (let i = 1; i < tweetBlocks.length && i < 10; i++) {
      const block = tweetBlocks[i];
      if (!block || block.length < 10) continue;
      
      // Simplified parsing - this would be more robust in production
      const text = block.split(/\n+/)[0].trim();
      const date = extractDateFromText(block);
      
      // Create a unique timestamp-based URL if none found
      const id = Date.now() + i;
      const tweetUrl = block.match(/https:\/\/twitter\.com\/[\w\d_]+\/status\/\d+/) || 
                       `${url}/status/${id}`;
      
      tweets.push({
        url: typeof tweetUrl === 'string' ? tweetUrl : tweetUrl[0],
        text: text || 'Media post',
        timestamp: date || 'Recently',
        mediaUrls: extractMediaUrlsFromText(block)
      });
    }
    
    logger.debug(`Found ${tweets.length} tweets from ${url}`);
    return tweets;
  } catch (error) {
    logger.error(`Error scraping Twitter ${url}:`, error);
    return [];
  }
}

/**
 * Scrape Instagram posts
 * @param {string} url - Instagram profile URL
 * @returns {Promise<Array>} - Array of posts
 */
async function scrapeInstagram(url) {
  logger.debug(`Scraping Instagram: ${url}`);
  
  try {
    // First try with trafilatura
    let content = await extractWithTrafilatura(url);
    
    // Fallback to direct scraping
    if (!content) {
      const html = await fetchHTML(url, { 
        cacheTTL: 300,
        headers: {
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      
      if (!html) return [];
      
      const $ = cheerio.load(html);
      content = $('body').text();
    }
    
    // Basic extraction with regex patterns (simplified)
    const posts = [];
    
    // Find post blocks in the content
    const postBlocks = content.split(/(?:Post|Photo|Image|Video)\s*(?:by|from|:)/gi);
    
    // Process each block (starting from 1 to skip header)
    for (let i = 1; i < postBlocks.length && i < 10; i++) {
      const block = postBlocks[i];
      if (!block || block.length < 10) continue;
      
      // Simplified parsing
      const caption = block.split(/\n+/)[0].trim();
      const date = extractDateFromText(block);
      
      // Extract likes if available
      const likesMatch = block.match(/(\d[\d,.]*)\s*(?:likes|suka|like)/i);
      const likes = likesMatch ? parseFloat(likesMatch[1].replace(/[,.]/g, '')) : 0;
      
      // Create post URL
      const id = Date.now() + i;
      const postUrl = block.match(/https:\/\/www\.instagram\.com\/p\/[\w\d-_]+/) || 
                     `${url}p/${id}`;
      
      posts.push({
        url: typeof postUrl === 'string' ? postUrl : postUrl[0],
        caption: caption || 'Media post',
        timestamp: date || 'Recently',
        likes: likes,
        mediaUrl: extractMediaUrlsFromText(block)[0] || null
      });
    }
    
    logger.debug(`Found ${posts.length} posts from ${url}`);
    return posts;
  } catch (error) {
    logger.error(`Error scraping Instagram ${url}:`, error);
    return [];
  }
}

/**
 * Scrape TikTok videos
 * @param {string} url - TikTok profile URL
 * @returns {Promise<Array>} - Array of videos
 */
async function scrapeTikTok(url) {
  logger.debug(`Scraping TikTok: ${url}`);
  
  try {
    // TikTok is particularly difficult to scrape directly
    // We'll primarily rely on trafilatura here
    const content = await extractWithTrafilatura(url);
    
    if (!content) {
      logger.warn(`Couldn't extract content from TikTok: ${url}`);
      return [];
    }
    
    // Basic extraction (simplified)
    const videos = [];
    
    // Find video blocks in the content
    const videoBlocks = content.split(/(?:Video|TikTok)\s*(?:by|from|:)/gi);
    
    // Process each block (starting from 1 to skip header)
    for (let i = 1; i < videoBlocks.length && i < 10; i++) {
      const block = videoBlocks[i];
      if (!block || block.length < 10) continue;
      
      // Simplified parsing
      const caption = block.split(/\n+/)[0].trim();
      const date = extractDateFromText(block);
      
      // Extract likes if available
      const likesMatch = block.match(/(\d[\d,.]*)\s*(?:likes|suka|like)/i);
      const likes = likesMatch ? parseFloat(likesMatch[1].replace(/[,.]/g, '')) : 0;
      
      // Create video URL
      const id = Date.now() + i;
      const videoUrl = block.match(/https:\/\/www\.tiktok\.com\/@[\w\d._]+\/video\/\d+/) || 
                      `${url}video/${id}`;
      
      videos.push({
        url: typeof videoUrl === 'string' ? videoUrl : videoUrl[0],
        caption: caption || 'TikTok video',
        timestamp: date || 'Recently',
        likes: likes,
        thumbnail: extractMediaUrlsFromText(block)[0] || null
      });
    }
    
    logger.debug(`Found ${videos.length} videos from ${url}`);
    return videos;
  } catch (error) {
    logger.error(`Error scraping TikTok ${url}:`, error);
    return [];
  }
}

/**
 * Scrape JKT48 official website news
 * @returns {Promise<Array>} - Array of news items
 */
async function scrapeJKT48News() {
  const url = 'https://jkt48.com/news/list?lang=id';
  logger.debug(`Scraping JKT48 news: ${url}`);
  
  try {
    const html = await fetchHTML(url, { cacheTTL: 1800 }); // 30 minutes cache
    
    if (!html) return [];
    
    const $ = cheerio.load(html);
    const newsItems = [];
    
    $('.entry-news').each((i, el) => {
      const title = $(el).find('h5 a').text().trim();
      const link = 'https://jkt48.com' + $(el).find('h5 a').attr('href');
      const date = $(el).find('.entry-date').text().trim();
      const category = $(el).find('.entry-category').text().trim();
      const summary = $(el).find('.card-body p').text().trim();

      // Only add if we have at least a title and link
      if (title && link) {
        newsItems.push({
          title,
          link,
          date,
          category,
          summary
        });
      }
    });
    
    logger.debug(`Found ${newsItems.length} news items from JKT48 website`);
    return newsItems;
  } catch (error) {
    logger.error(`Error scraping JKT48 news:`, error);
    return [];
  }
}

/**
 * Scrape JKT48 theater schedule
 * @returns {Promise<Array>} - Array of theater shows
 */
async function scrapeJKT48Theater() {
  const url = 'https://jkt48.com/theater/schedule?lang=id';
  logger.debug(`Scraping JKT48 theater: ${url}`);
  
  try {
    const html = await fetchHTML(url, { cacheTTL: 3600 }); // 1 hour cache
    
    if (!html) return [];
    
    const $ = cheerio.load(html);
    const shows = [];
    
    $('.item').each((i, el) => {
      const date = $(el).find('.entry-date').text().trim();
      const title = $(el).find('.entry-title').text().trim();
      const timeText = $(el).find('.entry-time').text().trim();
      const time = timeText.replace(/.*?(\d{1,2}:\d{2}).*/, '$1'); // Extract time pattern

      const setlistText = $(el).find('.setlist').text().trim();
      const setlist = setlistText.replace('Setlist: ', '');
      
      let members = [];
      $(el).find('.member-list .member').each((j, member) => {
        members.push($(member).text().trim());
      });
      
      // Only add if we have date and title
      if (date && title) {
        shows.push({
          date,
          title,
          time,
          setlist,
          members,
          isTheater: true,
          url
        });
      }
    });
    
    logger.debug(`Found ${shows.length} theater shows from JKT48 website`);
    return shows;
  } catch (error) {
    logger.error(`Error scraping JKT48 theater:`, error);
    return [];
  }
}

/**
 * Scrape Showroom live status
 * @param {string} roomId - Showroom room ID or name
 * @returns {Promise<Object|null>} - Live data or null if not live
 */
async function scrapeShowroomLive(roomId) {
  // Construct proper URL
  let url;
  if (isNaN(roomId)) {
    // If not a number, assume it's a room name
    url = `https://www.showroom-live.com/${roomId}`;
  } else {
    // If numeric, try the JKT48 official format first
    // JKT48 rooms typically follow a pattern like: https://www.showroom-live.com/JKT48_MemberName
    url = `https://www.showroom-live.com/JKT48_Official`;
  }
  
  logger.debug(`Checking Showroom live: ${url}`);
  
  try {
    const html = await fetchHTML(url, { 
      cacheTTL: 30, // Short cache for live status
      timeout: 5000, // Faster timeout for status check
      retries: 1
    });
    
    if (!html) return null;
    
    const $ = cheerio.load(html);
    
    // Check if live
    const isLive = $('.js-live-box').length > 0 || 
                   $('.info-box').text().toLowerCase().includes('live') ||
                   $('.js-online-user-count').length > 0;
                   
    if (!isLive) {
      return null;
    }
    
    // Extract data
    const title = $('.room-header-title').text().trim() || $('.live_title').text().trim() || 'Showroom Live';
    const streamerName = $('.room-header-username').text().trim() || $('.profile_name').text().trim() || 'JKT48 Member';
    const viewers = $('.online-user-count').text().trim() || $('.view_cnt').text().trim() || '0';
    
    return {
      isLive: true,
      title,
      streamerName,
      viewerCount: parseInt(viewers.replace(/[^0-9]/g, '') || '0'),
      url,
      startTime: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    };
  } catch (error) {
    logger.warn(`Error checking Showroom live ${url}:`, error.message);
    return null;
  }
}

/**
 * Scrape IDN live status
 * @param {string} url - IDN App URL
 * @returns {Promise<Object|null>} - Live data or null if not live
 */
async function scrapeIDNLive(url) {
  logger.debug(`Checking IDN live: ${url}`);
  
  try {
    const html = await fetchHTML(url, { 
      cacheTTL: 30, // Short cache for live status
      timeout: 5000, // Faster timeout for status check
      retries: 1
    });
    
    if (!html) return null;
    
    const $ = cheerio.load(html);
    
    // Check if live
    const isLive = $('.livestream-container').length > 0 || 
                  $('div[data-testid="live-badge"]').length > 0 ||
                  $('.sc-eylMVC').length > 0;
                   
    if (!isLive) {
      return null;
    }
    
    // Extract data
    const title = $('.livestream-title').text().trim() || $('h1').first().text().trim() || 'IDN Live';
    const streamerName = $('.livestream-username').text().trim() || $('.username').text().trim() || url.split('/').pop();
    const viewerText = $('.viewer-count').text().trim() || $('.sc-eylMVC').text().trim() || '0';
    const viewers = viewerText.match(/\d+/g)?.join('') || '0';
    
    return {
      isLive: true,
      title,
      streamerName,
      viewerCount: parseInt(viewers),
      url,
      startTime: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    };
  } catch (error) {
    logger.warn(`Error checking IDN live ${url}:`, error.message);
    return null;
  }
}

/**
 * Extract date from text content
 * @param {string} text - Text content
 * @returns {string|null} - Formatted date or null
 */
function extractDateFromText(text) {
  if (!text) return null;
  
  // Common date patterns
  const patterns = [
    // Standard date formats
    /(\d{1,2})[-\/\s.](\d{1,2})[-\/\s.](\d{2,4})/i,
    // Month name formats
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})/i,
    // Indonesian month names
    /(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{2,4})/i,
    // Relative time
    /(a few|[0-9]+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i,
    // Indonesian relative time
    /(\d+)\s+(detik|menit|jam|hari|minggu|bulan|tahun)\s+yang\s+lalu/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

/**
 * Extract media URLs from text
 * @param {string} text - Text content
 * @returns {Array} - Array of media URLs
 */
function extractMediaUrlsFromText(text) {
  if (!text) return [];
  
  const urls = [];
  
  // Image URL patterns
  const patterns = [
    /https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)(?:\?\S+)?/gi,
    /https?:\/\/(?:www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+/gi,
    /https?:\/\/(?:www\.)?twitter\.com\/\w+\/status\/\d+\/photo\/\d+/gi,
    /https?:\/\/pbs\.twimg\.com\/media\/\S+\.\w+/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      urls.push(...matches);
    }
  }
  
  return [...new Set(urls)]; // Remove duplicates
}

module.exports = {
  fetchHTML,
  extractWithTrafilatura,
  scrapeTwitter,
  scrapeInstagram,
  scrapeTikTok,
  scrapeJKT48News,
  scrapeJKT48Theater,
  scrapeShowroomLive,
  scrapeIDNLive,
  extractDateFromText,
  extractMediaUrlsFromText
};