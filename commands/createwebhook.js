/**
 * Create Webhook Command
 * 
 * This command allows moderators to create and customize webhooks with banners,
 * custom avatars, names, and messages.
 */

const { 
  SlashCommandBuilder, 
  PermissionFlagsBits,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createwebhook')
    .setDescription('Create a customizable webhook with banner and message options')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new webhook')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to create the webhook in')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Name for the webhook')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('avatar')
            .setDescription('URL of the webhook avatar')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('banner')
            .setDescription('URL of the banner image to use in messages')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('color')
            .setDescription('Color for the webhook messages (hex format e.g., #FF6200)')
            .setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('send')
        .setDescription('Send a message with an existing webhook')
        .addStringOption(option =>
          option.setName('webhook_url')
            .setDescription('URL of the webhook to use')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('message')
            .setDescription('Message to send (use long message option for more text)')
            .setRequired(false))
        .addBooleanOption(option =>
          option.setName('use_embed')
            .setDescription('Send as an embed message instead of plain text')
            .setRequired(false))
        .addBooleanOption(option =>
          option.setName('long_message')
            .setDescription('Set to true if you want to write a longer message or title with a modal')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('banner')
            .setDescription('URL of the banner image to use in the message')
            .setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all webhooks in a channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to list webhooks for')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a webhook by ID or URL')
        .addStringOption(option =>
          option.setName('webhook_url')
            .setDescription('URL of the webhook to delete')
            .setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks),
    
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      
      switch (subcommand) {
        case 'create':
          await handleCreateWebhook(interaction);
          break;
        case 'send':
          const useLongMessage = interaction.options.getBoolean('long_message');
          
          if (useLongMessage) {
            await showMessageModal(interaction);
          } else {
            await handleSendWebhookMessage(interaction);
          }
          break;
        case 'list':
          await handleListWebhooks(interaction);
          break;
        case 'delete':
          await handleDeleteWebhook(interaction);
          break;
      }
    } catch (error) {
      logger.error('Error executing createwebhook command:', error);
      await interaction.reply({ 
        embeds: [createErrorEmbed('An error occurred while executing the webhook command. Please try again.')],
        ephemeral: true 
      });
    }
  },
  
  /**
   * Handle modal submissions for webhook message content
   * @param {ModalSubmitInteraction} interaction - Modal interaction
   */
  async handleModal(interaction) {
    try {
      if (interaction.customId === 'webhook_message_modal') {
        const title = interaction.fields.getTextInputValue('webhook_title');
        const content = interaction.fields.getTextInputValue('webhook_content');
        
        // Store this data in session storage
        const sessionData = {
          webhook_url: interaction.webhook_url,
          use_embed: interaction.use_embed,
          banner: interaction.banner,
          title: title,
          content: content
        };
        
        // Send the webhook message
        await sendWebhookMessage(interaction, sessionData);
      }
    } catch (error) {
      logger.error('Error handling webhook modal:', error);
      await interaction.reply({ 
        embeds: [createErrorEmbed('An error occurred while processing your webhook message. Please try again.')],
        ephemeral: true 
      });
    }
  }
};

/**
 * Create a new webhook
 * @param {CommandInteraction} interaction - Slash command interaction
 */
async function handleCreateWebhook(interaction) {
  try {
    const channel = interaction.options.getChannel('channel');
    const name = interaction.options.getString('name');
    const avatarURL = interaction.options.getString('avatar');
    const bannerURL = interaction.options.getString('banner');
    const color = interaction.options.getString('color') || '#FF6200';
    
    // Check if the channel supports webhooks
    if (!channel.isTextBased() || channel.isVoiceBased() || channel.isThread()) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('Webhooks can only be created in text channels.')],
        ephemeral: true 
      });
    }
    
    // Validate URLs
    if (!isValidURL(avatarURL)) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('The avatar URL is invalid. Please provide a valid image URL.')],
        ephemeral: true 
      });
    }
    
    if (bannerURL && !isValidURL(bannerURL)) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('The banner URL is invalid. Please provide a valid image URL.')],
        ephemeral: true 
      });
    }
    
    // Create webhook
    const webhook = await channel.createWebhook({
      name: name,
      avatar: avatarURL,
      reason: `Created by ${interaction.user.tag} using /createwebhook command`
    });
    
    // Store webhook configuration in database (optional - implement later)
    
    // Create response embed
    const embed = new EmbedBuilder()
      .setTitle('✅ Webhook Created Successfully')
      .setDescription(`A new webhook has been created in ${channel}`)
      .setColor(color)
      .addFields(
        { name: 'Name', value: name, inline: true },
        { name: 'ID', value: webhook.id, inline: true },
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'URL', value: '```' + webhook.url + '```' }
      )
      .setFooter({ text: `Created by ${interaction.user.tag}` })
      .setTimestamp();
    
    if (bannerURL) {
      embed.setImage(bannerURL);
      embed.addFields({ name: 'Banner URL', value: bannerURL });
    }
    
    // Send response
    await interaction.reply({ 
      embeds: [embed],
      ephemeral: true 
    });
    
    logger.info(`Webhook '${name}' created by ${interaction.user.tag} in channel ${channel.name}`);
  } catch (error) {
    logger.error('Error creating webhook:', error);
    await interaction.reply({ 
      embeds: [createErrorEmbed('An error occurred while creating the webhook. Please try again.')],
      ephemeral: true 
    });
  }
}

/**
 * Show modal for long webhook messages
 * @param {CommandInteraction} interaction - Slash command interaction
 */
async function showMessageModal(interaction) {
  try {
    const webhookURL = interaction.options.getString('webhook_url');
    const useEmbed = interaction.options.getBoolean('use_embed') || false;
    const bannerURL = interaction.options.getString('banner');
    
    // Create modal
    const modal = new ModalBuilder()
      .setCustomId('webhook_message_modal')
      .setTitle('Create Webhook Message');
    
    // Add inputs
    const titleInput = new TextInputBuilder()
      .setCustomId('webhook_title')
      .setLabel('Message Title (for embeds)')
      .setPlaceholder('Enter a title for your message...')
      .setStyle(TextInputStyle.Short)
      .setRequired(useEmbed)
      .setMaxLength(256);
    
    const contentInput = new TextInputBuilder()
      .setCustomId('webhook_content')
      .setLabel('Message Content')
      .setPlaceholder('Enter your message content here...')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(2000);
    
    // Create action rows
    const titleRow = new ActionRowBuilder().addComponents(titleInput);
    const contentRow = new ActionRowBuilder().addComponents(contentInput);
    
    // Add components to modal
    modal.addComponents(titleRow, contentRow);
    
    // Store data in the interaction object temporarily
    interaction.webhook_url = webhookURL;
    interaction.use_embed = useEmbed;
    interaction.banner = bannerURL;
    
    // Show modal
    await interaction.showModal(modal);
    
  } catch (error) {
    logger.error('Error showing webhook message modal:', error);
    await interaction.reply({ 
      embeds: [createErrorEmbed('An error occurred while creating the webhook message modal. Please try again.')],
      ephemeral: true 
    });
  }
}

/**
 * Send a message using a webhook
 * @param {CommandInteraction} interaction - Slash command interaction
 * @param {Object} modalData - Data from modal (if used)
 */
async function handleSendWebhookMessage(interaction, modalData = null) {
  try {
    // Check if we're using modal data or direct options
    let webhookURL, message, useEmbed, bannerURL, title;
    
    if (modalData) {
      webhookURL = modalData.webhook_url;
      useEmbed = modalData.use_embed;
      bannerURL = modalData.banner;
      title = modalData.title;
      message = modalData.content;
    } else {
      webhookURL = interaction.options.getString('webhook_url');
      message = interaction.options.getString('message') || '';
      useEmbed = interaction.options.getBoolean('use_embed') || false;
      bannerURL = interaction.options.getString('banner');
      title = null;
    }
    
    // Validate webhook URL
    if (!isValidWebhookURL(webhookURL)) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('The webhook URL is invalid. Please provide a valid Discord webhook URL.')],
        ephemeral: true 
      });
    }
    
    // Validate banner URL if provided
    if (bannerURL && !isValidURL(bannerURL)) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('The banner URL is invalid. Please provide a valid image URL.')],
        ephemeral: true 
      });
    }
    
    // Extract ID and token from webhook URL
    const { id, token } = extractWebhookInfo(webhookURL);
    
    if (!id || !token) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('Could not extract webhook information. Please provide a valid webhook URL.')],
        ephemeral: true 
      });
    }
    
    // Create webhook instance
    const webhook = new interaction.client.fetchWebhook(id, token);
    
    // Send message based on options
    let sentMessage;
    
    if (useEmbed) {
      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#FF6200');
      
      if (title) {
        embed.setTitle(title);
      }
      
      if (message) {
        embed.setDescription(message);
      }
      
      if (bannerURL) {
        embed.setImage(bannerURL);
      }
      
      // Send embed
      sentMessage = await webhook.send({
        embeds: [embed]
      });
    } else {
      // Send regular message with optional banner
      const messageOptions = { content: message };
      
      if (bannerURL) {
        const embed = new EmbedBuilder()
          .setColor('#FF6200')
          .setImage(bannerURL);
        
        messageOptions.embeds = [embed];
      }
      
      sentMessage = await webhook.send(messageOptions);
    }
    
    // Send confirmation response
    await interaction.reply({ 
      embeds: [createSuccessEmbed('Webhook message sent successfully!')],
      ephemeral: true 
    });
    
    logger.info(`Webhook message sent by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('Error sending webhook message:', error);
    await interaction.reply({ 
      embeds: [createErrorEmbed('An error occurred while sending the webhook message. Please check the webhook URL and try again.')],
      ephemeral: true 
    });
  }
}

/**
 * Send webhook message after modal submission
 * @param {ModalSubmitInteraction} interaction - Modal interaction
 * @param {Object} data - Data from modal
 */
async function sendWebhookMessage(interaction, data) {
  try {
    // Validate webhook URL
    if (!isValidWebhookURL(data.webhook_url)) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('The webhook URL is invalid. Please provide a valid Discord webhook URL.')],
        ephemeral: true 
      });
    }
    
    // Validate banner URL if provided
    if (data.banner && !isValidURL(data.banner)) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('The banner URL is invalid. Please provide a valid image URL.')],
        ephemeral: true 
      });
    }
    
    // Extract ID and token from webhook URL
    const { id, token } = extractWebhookInfo(data.webhook_url);
    
    if (!id || !token) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('Could not extract webhook information. Please provide a valid webhook URL.')],
        ephemeral: true 
      });
    }
    
    // Fetch webhook
    const webhook = await interaction.client.fetchWebhook(id, token);
    
    // Send message based on options
    let sentMessage;
    
    if (data.use_embed) {
      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#FF6200');
      
      if (data.title) {
        embed.setTitle(data.title);
      }
      
      if (data.content) {
        embed.setDescription(data.content);
      }
      
      if (data.banner) {
        embed.setImage(data.banner);
      }
      
      // Send embed
      sentMessage = await webhook.send({
        embeds: [embed]
      });
    } else {
      // Send regular message with optional banner
      const messageOptions = { content: data.content };
      
      if (data.banner) {
        const embed = new EmbedBuilder()
          .setColor('#FF6200')
          .setImage(data.banner);
        
        messageOptions.embeds = [embed];
      }
      
      sentMessage = await webhook.send(messageOptions);
    }
    
    // Send confirmation response
    await interaction.reply({ 
      embeds: [createSuccessEmbed('Webhook message sent successfully!')],
      ephemeral: true 
    });
    
    logger.info(`Webhook message sent by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('Error sending webhook message after modal:', error);
    await interaction.reply({ 
      embeds: [createErrorEmbed('An error occurred while sending the webhook message. Please check the webhook URL and try again.')],
      ephemeral: true 
    });
  }
}

/**
 * List webhooks in a channel
 * @param {CommandInteraction} interaction - Slash command interaction
 */
async function handleListWebhooks(interaction) {
  try {
    const channel = interaction.options.getChannel('channel');
    
    // Check channel permissions
    if (!channel.isTextBased() || channel.isVoiceBased() || channel.isThread()) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('Webhooks can only be listed for text channels.')],
        ephemeral: true 
      });
    }
    
    // Fetch webhooks
    const webhooks = await channel.fetchWebhooks();
    
    if (webhooks.size === 0) {
      return interaction.reply({ 
        embeds: [createErrorEmbed(`No webhooks found in ${channel}.`)],
        ephemeral: true 
      });
    }
    
    // Create embed for webhooks list
    const embed = new EmbedBuilder()
      .setTitle(`Webhooks in #${channel.name}`)
      .setColor('#FF6200')
      .setDescription(`Found ${webhooks.size} webhook(s)`)
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();
    
    // Add each webhook to the embed
    webhooks.forEach(webhook => {
      embed.addFields({
        name: webhook.name,
        value: `**ID:** ${webhook.id}\n**URL:** ||${webhook.url}||`,
        inline: false
      });
    });
    
    // Send response
    await interaction.reply({ 
      embeds: [embed],
      ephemeral: true 
    });
    
  } catch (error) {
    logger.error('Error listing webhooks:', error);
    await interaction.reply({ 
      embeds: [createErrorEmbed('An error occurred while listing webhooks. Please try again.')],
      ephemeral: true 
    });
  }
}

/**
 * Delete a webhook
 * @param {CommandInteraction} interaction - Slash command interaction
 */
async function handleDeleteWebhook(interaction) {
  try {
    const webhookURL = interaction.options.getString('webhook_url');
    
    // Validate webhook URL
    if (!isValidWebhookURL(webhookURL)) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('The webhook URL is invalid. Please provide a valid Discord webhook URL.')],
        ephemeral: true 
      });
    }
    
    // Extract ID and token from webhook URL
    const { id, token } = extractWebhookInfo(webhookURL);
    
    if (!id || !token) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('Could not extract webhook information. Please provide a valid webhook URL.')],
        ephemeral: true 
      });
    }
    
    // Fetch and delete webhook
    const webhook = await interaction.client.fetchWebhook(id, token);
    await webhook.delete(`Deleted by ${interaction.user.tag} using /createwebhook delete`);
    
    // Send confirmation
    await interaction.reply({ 
      embeds: [createSuccessEmbed(`Webhook "${webhook.name}" has been deleted successfully.`)],
      ephemeral: true 
    });
    
    logger.info(`Webhook ${webhook.name} (${webhook.id}) deleted by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('Error deleting webhook:', error);
    await interaction.reply({ 
      embeds: [createErrorEmbed('An error occurred while deleting the webhook. Please check the webhook URL and try again.')],
      ephemeral: true 
    });
  }
}

/**
 * Validate if a string is a valid URL
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
 * Validate if a string is a valid Discord webhook URL
 * @param {string} url - Webhook URL to validate
 * @returns {boolean} Whether the webhook URL is valid
 */
function isValidWebhookURL(url) {
  try {
    const webhookURL = new URL(url);
    return webhookURL.hostname === 'discord.com' && 
           webhookURL.pathname.includes('/api/webhooks/');
  } catch (error) {
    return false;
  }
}

/**
 * Extract webhook ID and token from URL
 * @param {string} url - Webhook URL
 * @returns {Object} Object containing ID and token
 */
function extractWebhookInfo(url) {
  try {
    const regex = /\/api\/webhooks\/(\d+)\/([a-zA-Z0-9_-]+)/;
    const matches = url.match(regex);
    
    if (matches && matches.length >= 3) {
      return {
        id: matches[1],
        token: matches[2]
      };
    }
    
    return { id: null, token: null };
  } catch (error) {
    logger.error('Error extracting webhook info:', error);
    return { id: null, token: null };
  }
}