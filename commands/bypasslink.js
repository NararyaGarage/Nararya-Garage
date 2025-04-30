/**
 * Bypass Link Command
 * 
 * This command allows users to bypass URL shorteners, ad walls, and other redirect services
 * to get the direct destination link.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { 
  SlashCommandBuilder, 
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bypasslink')
    .setDescription('Bypass shortlinks, adfly, arahlink dan dapatkan direct link')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL untuk dibypass (arahlink, adfly, etc)')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('private')
        .setDescription('Tampilkan hasil hanya untuk kamu (default: tidak)')
        .setRequired(false)),
    
  async execute(interaction) {
    try {
      // Get the URL and privacy option
      const url = interaction.options.getString('url');
      const isPrivate = interaction.options.getBoolean('private') || false;
      
      // Defer reply based on privacy option
      await interaction.deferReply({ ephemeral: isPrivate });
      
      // Validate URL
      if (!isValidURL(url)) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed('URL tidak valid. Pastikan URL dimulai dengan http:// atau https://')]
        });
      }
      
      // Check if the URL is from a known shortener service
      const isShortener = isShortenerService(url);
      
      if (!isShortener) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed('URL ini bukan URL shortener yang dikenal. Command ini hanya untuk bypass shortener seperti adf.ly, arahlink.id, bit.ly, dll.')]
        });
      }
      
      // Bypass the shortlink
      const result = await bypassShortlink(url);
      
      if (!result.success) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed(`Gagal bypass link: ${result.error}`)]
        });
      }
      
      // Create embed with the result
      const embed = new EmbedBuilder()
        .setTitle('🔄 Link Bypass Berhasil')
        .setColor('#FF6200')
        .addFields(
          { name: 'Link Original', value: `[${url}](${url})` },
          { name: 'Link Direct', value: `[${result.destination}](${result.destination})` }
        )
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      // Create button to open the direct link
      const linkButton = new ButtonBuilder()
        .setLabel('Buka Link Direct')
        .setStyle(ButtonStyle.Link)
        .setURL(result.destination);
      
      const row = new ActionRowBuilder().addComponents(linkButton);
      
      // Send the result
      await interaction.editReply({ 
        embeds: [embed],
        components: [row]
      });
      
      logger.info(`Link bypassed for ${interaction.user.tag}: ${url} -> ${result.destination}`);
    } catch (error) {
      logger.error('Error bypassing link:', error);
      
      if (interaction.deferred) {
        await interaction.editReply({ 
          embeds: [createErrorEmbed('Terjadi kesalahan saat bypass link. Silakan coba lagi.')] 
        });
      } else {
        await interaction.reply({ 
          embeds: [createErrorEmbed('Terjadi kesalahan saat bypass link. Silakan coba lagi.')],
          ephemeral: true 
        });
      }
    }
  }
};

/**
 * Check if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is valid
 */
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if the URL is from a known shortener service
 * @param {string} url - URL to check
 * @returns {boolean} Whether the URL is from a known shortener
 */
function isShortenerService(url) {
  try {
    const { hostname } = new URL(url);
    
    // List of known URL shortener domains
    const shortenerDomains = [
      'adf.ly',
      'bit.ly',
      'tinyurl.com',
      'goo.gl',
      'ow.ly',
      't.co',
      'is.gd',
      'arahlink.id',
      'arahlink.com',
      'ouo.io',
      'ouo.press',
      'exe.io',
      'exey.io',
      'za.gl',
      'sh.st',
      'cut-urls.com',
      'fc.lc',
      'linkshrink.net',
      'shorte.st',
      'adfoc.us',
      'tr.im',
      'shorturl.at',
      'cutt.ly',
      'tiny.cc',
      'shrinkme.io',
      'shrinkearn.com',
      'shrink.pe',
      'linkvertise.com',
      'link.zip',
      'l.linklyhq.com',
      'outoflife.rocks',
      'sub2unlock.com',
      'clicksfly.com',
      'ay.live',
      'shortconnect.com',
      'mediafire.com',
      '4funbox.com',
      'filehostbox.com',
      'sharer.pw'
    ];
    
    // Check if the domain or a subdomain matches any shortener domains
    return shortenerDomains.some(domain => 
      hostname.endsWith(domain) || hostname.includes(domain)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Bypass a shortlink to get the direct destination
 * @param {string} url - Shortlink URL to bypass
 * @returns {Object} Result of the bypass operation
 */
async function bypassShortlink(url) {
  try {
    // For demonstration purposes, we'll implement a few basic bypasses
    // In a real-world scenario, this would be more comprehensive
    
    const { hostname } = new URL(url);
    
    // Different bypass methods for different shortener services
    if (hostname.includes('adf.ly') || hostname.includes('adfoc.us')) {
      return await bypassAdfly(url);
    } else if (hostname.includes('arahlink')) {
      return await bypassArahlink(url);
    } else if (hostname.includes('ouo.io') || hostname.includes('ouo.press')) {
      return await bypassOuo(url);
    } else if (hostname.includes('mediafire.com')) {
      return await bypassMediafire(url);
    } else {
      // Generic method for other shorteners - follow redirects
      return await followRedirects(url);
    }
  } catch (error) {
    logger.error('Error in bypassShortlink:', error);
    return {
      success: false,
      error: 'Failed to bypass link. The service might have changed its mechanism or the link is invalid.'
    };
  }
}

/**
 * Follow redirects to get the final destination URL
 * @param {string} url - URL to follow
 * @returns {Object} Result with destination URL
 */
async function followRedirects(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 10,
      validateStatus: status => status >= 200 && status < 400
    });
    
    return {
      success: true,
      destination: response.request.res.responseUrl || url
    };
  } catch (error) {
    logger.error('Error following redirects:', error);
    return {
      success: false,
      error: 'Failed to follow redirects'
    };
  }
}

/**
 * Bypass Adfly links
 * @param {string} url - Adfly URL
 * @returns {Object} Result with destination URL
 */
async function bypassAdfly(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    
    // Look for the redirect URL in the page script
    const ysmm = html.match(/ysmm = '([^']+)'/);
    
    if (!ysmm) {
      // If we can't find the ysmm variable, try to find meta refresh
      const dom = new JSDOM(html);
      const metaRefresh = dom.window.document.querySelector('meta[http-equiv="refresh"]');
      
      if (metaRefresh) {
        const content = metaRefresh.getAttribute('content');
        const match = content.match(/URL='([^']+)'/);
        
        if (match && match[1]) {
          return {
            success: true,
            destination: match[1]
          };
        }
      }
      
      // If still not found, try to follow generic redirects
      return await followRedirects(url);
    }
    
    // Adfly algorithm to decode the destination
    let r = '';
    let j = '';
    let decode = ysmm[1];
    
    for (let i = 0; i < decode.length; i++) {
      if (i % 2 === 0) {
        r += decode.charAt(i);
      } else {
        j = decode.charAt(i) + j;
      }
    }
    
    decode = r + j;
    decode = Buffer.from(decode, 'base64').toString('ascii');
    decode = decode.substring(2);
    
    return {
      success: true,
      destination: decode
    };
  } catch (error) {
    logger.error('Error bypassing Adfly:', error);
    return {
      success: false,
      error: 'Failed to bypass Adfly link'
    };
  }
}

/**
 * Bypass Arahlink links
 * @param {string} url - Arahlink URL
 * @returns {Object} Result with destination URL
 */
async function bypassArahlink(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    
    // Parse the page to find the destination URL
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Method 1: Look for the timer bypass link
    const bypassButton = document.querySelector('#go-link, .get-link, .skip-ad');
    if (bypassButton) {
      const bypassUrl = bypassButton.getAttribute('href');
      if (bypassUrl) {
        return {
          success: true,
          destination: bypassUrl
        };
      }
    }
    
    // Method 2: Look for form with hidden destination
    const form = document.querySelector('form[action]');
    if (form) {
      const hiddenInput = form.querySelector('input[name="url"], input[name="dest"]');
      if (hiddenInput) {
        const destination = hiddenInput.getAttribute('value');
        if (destination) {
          return {
            success: true,
            destination: destination
          };
        }
      }
    }
    
    // Method 3: Extract from JavaScript
    const scriptTags = document.querySelectorAll('script');
    for (let i = 0; i < scriptTags.length; i++) {
      const scriptContent = scriptTags[i].textContent;
      
      // Look for common patterns in the script that contain URLs
      const urlMatch = scriptContent.match(/window\.location\s*=\s*['"]([^'"]+)['"]/);
      if (urlMatch && urlMatch[1]) {
        return {
          success: true,
          destination: urlMatch[1]
        };
      }
    }
    
    // If all methods fail, try generic redirect following
    return await followRedirects(url);
  } catch (error) {
    logger.error('Error bypassing Arahlink:', error);
    return {
      success: false,
      error: 'Failed to bypass Arahlink'
    };
  }
}

/**
 * Bypass Ouo.io links
 * @param {string} url - Ouo.io URL
 * @returns {Object} Result with destination URL
 */
async function bypassOuo(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    
    // Ouo.io has multiple steps, but we'll simplify for demonstration
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Method 1: Look for the form submit
    const form = document.querySelector('form#form-captcha');
    if (form) {
      const formAction = form.getAttribute('action');
      if (formAction) {
        // In a real implementation, we'd need to handle the captcha and form submission
        // For demo purposes, we'll just try to follow the generic redirect
        return await followRedirects(formAction);
      }
    }
    
    // Method 2: Look for direct URL in JavaScript
    const scriptTags = document.querySelectorAll('script');
    for (let i = 0; i < scriptTags.length; i++) {
      const scriptContent = scriptTags[i].textContent;
      
      // Look for common patterns
      const urlMatch = scriptContent.match(/window\.location\s*=\s*['"]([^'"]+)['"]/);
      if (urlMatch && urlMatch[1]) {
        return {
          success: true,
          destination: urlMatch[1]
        };
      }
    }
    
    // If all methods fail, try generic redirect following
    return await followRedirects(url);
  } catch (error) {
    logger.error('Error bypassing Ouo.io:', error);
    return {
      success: false,
      error: 'Failed to bypass Ouo.io link'
    };
  }
}

/**
 * Bypass Mediafire links
 * @param {string} url - Mediafire URL
 * @returns {Object} Result with destination URL
 */
async function bypassMediafire(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    
    // Parse the page to find the download link
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Look for the download button
    const downloadButton = document.querySelector('a#downloadButton');
    if (downloadButton) {
      const downloadUrl = downloadButton.getAttribute('href');
      if (downloadUrl) {
        return {
          success: true,
          destination: downloadUrl
        };
      }
    }
    
    // Alternative: look for download link in other elements
    const alternativeButton = document.querySelector('.download_link a, .download-file');
    if (alternativeButton) {
      const downloadUrl = alternativeButton.getAttribute('href');
      if (downloadUrl) {
        return {
          success: true,
          destination: downloadUrl
        };
      }
    }
    
    // If buttons not found, look for link in script
    const scriptTags = document.querySelectorAll('script');
    for (let i = 0; i < scriptTags.length; i++) {
      const scriptContent = scriptTags[i].textContent;
      
      // Look for the download link in JavaScript
      const urlMatch = scriptContent.match(/downloadLink\s*=\s*['"]([^'"]+)['"]/);
      if (urlMatch && urlMatch[1]) {
        return {
          success: true,
          destination: urlMatch[1]
        };
      }
    }
    
    return {
      success: false,
      error: 'Could not find download link on Mediafire page'
    };
  } catch (error) {
    logger.error('Error bypassing Mediafire:', error);
    return {
      success: false,
      error: 'Failed to bypass Mediafire link'
    };
  }
}