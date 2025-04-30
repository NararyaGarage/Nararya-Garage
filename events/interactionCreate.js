// Event handler for Discord interactions (slash commands, buttons, etc.)
const { logger } = require('../utils/logger');
const config = require('../config');
const { Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Handle slash commands
    if (interaction.isCommand()) {
      try {
        const command = client.commands.get(interaction.commandName);
        
        if (!command) {
          logger.warn(`Command "${interaction.commandName}" not found`);
          return;
        }
        
        // HANYA defer reply, TIDAK MENCOBA MENAMPILKAN PREVIEW - kembali ke versi stabil
        if (!interaction.deferred && !interaction.replied) {
          try {
            await interaction.deferReply();
            logger.info(`Command ${interaction.commandName} was deferred successfully`);
          } catch (deferError) {
            logger.warn(`Failed to defer ${interaction.commandName}: ${deferError.message}`);
            // Teruskan eksekusi command meskipun deferReply gagal
          }
        }
        
        // Check if command requires special permissions - dilakukan setelah defer untuk menghindari timeout
        if (command.permissions && command.permissions.length > 0) {
          const hasPermission = command.permissions.some(permissionId => {
            // Check if user has any of the required roles
            if (permissionId.startsWith('ROLE:')) {
              const roleId = permissionId.replace('ROLE:', '');
              return interaction.member.roles.cache.has(roleId);
            }
            
            // Check if user has any of the required permissions
            return interaction.member.permissions.has(permissionId);
          });
          
          if (!hasPermission) {
            logger.warn(`User ${interaction.user.tag} attempted to use restricted command "${interaction.commandName}" without permission`);
            return interaction.editReply({ 
              content: 'Anda tidak memiliki izin untuk menggunakan perintah ini.'
            });
          }
        }
        
        // Check if command is moderator-only - dilakukan setelah defer untuk menghindari timeout
        if (command.moderatorOnly && !config.roles.modRoles.some(roleId => 
          interaction.member.roles.cache.has(roleId)
        )) {
          logger.warn(`User ${interaction.user.tag} attempted to use moderator command "${interaction.commandName}"`);
          return interaction.editReply({ 
            content: 'Perintah ini hanya dapat digunakan oleh moderator.'
          });
        }
        
        // Handle command cooldowns
        if (!client.cooldowns.has(command.data.name)) {
          client.cooldowns.set(command.data.name, new Collection());
        }
        
        const now = Date.now();
        const timestamps = client.cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown || 3) * 1000; // Default 3 seconds cooldown
        
        if (timestamps.has(interaction.user.id)) {
          const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
          
          if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            logger.debug(`Command "${interaction.commandName}" on cooldown for user ${interaction.user.tag}`);
            return interaction.editReply({ 
              content: `Mohon tunggu ${timeLeft.toFixed(1)} detik sebelum menggunakan perintah \`${command.data.name}\` lagi.`
            });
          }
        }
        
        // Set the cooldown timestamp
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        
        // Execute the command LANGSUNG tanpa menunggu timeout
        logger.info(`User ${interaction.user.tag} executed command "${interaction.commandName}"`);
        
        // Log pemanggilan command dengan lebih detail untuk debugging
        logger.info(`Executing command "${interaction.commandName}" by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.channel?.name || 'DM'}`);
        
        // Execute command LANGSUNG tanpa wrapper atau try-catch nested
        try {
          // Execute command langsung dan segera tanpa menunggu error
          await command.execute(interaction, client);
          logger.info(`Successfully executed command "${interaction.commandName}" for ${interaction.user.tag}`);
        } catch (error) {
          // Tangani error dengan sederhana - jangan terlalu banyak pesan error
          logger.error(`Error executing command "${interaction.commandName}": ${error.message}`);
          
          // Coba edit reply jika belum replied
          if (interaction.deferred && !interaction.replied) {
            await interaction.editReply({ 
              content: `Tidak dapat menampilkan hasil perintah ${interaction.commandName}. Silakan coba lagi.`
            }).catch(e => {
              // Ignore error if failed to edit reply
              logger.debug(`Failed to edit reply: ${e.message}`);
            });
          }
        }
      } catch (error) {
        // Tangani error di top level dengan lebih sederhana
        logger.error(`Error top-level execute "${interaction.commandName}": ${error.message}`);
        
        // Jangan terlalu banyak pesan error kompleks, gunakan pesan sederhana saja
        try {
          if (!interaction.replied && interaction.isRepliable()) {
            await interaction.reply({ 
              content: `Tidak dapat menjalankan perintah ${interaction.commandName}. Silakan coba lagi.`,
              ephemeral: true 
            });
          }
        } catch (e) {
          // Ignore error if failed to send error response
          logger.debug(`Failed to send error response: ${e.message}`);
        }
      }
    }
    
    // Handle button interactions
    else if (interaction.isButton()) {
      try {
        const buttonId = interaction.customId;
        
        // Handle ticket creation button
        if (buttonId === 'create_ticket') {
          // Defer reply to prevent timing out
          await interaction.deferReply({ ephemeral: true });
          
          try {
            // Get member who clicked button
            const member = interaction.member;
            const guild = interaction.guild;
            
            // Check if a ticket channel already exists for this user
            const existingTicketChannel = guild.channels.cache.find(
              c => c.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            );
            
            if (existingTicketChannel) {
              return interaction.followUp({
                content: `Anda sudah memiliki ticket yang terbuka: <#${existingTicketChannel.id}>`,
                ephemeral: true
              });
            }
            
            // Get or create tickets category
            let ticketCategory = guild.channels.cache.find(
              c => c.name === 'Tickets' && c.type === 4 // CategoryChannel type
            );
            
            if (!ticketCategory) {
              ticketCategory = await guild.channels.create({
                name: 'Tickets',
                type: 4, // CategoryChannel type
                permissionOverwrites: [
                  {
                    id: guild.id, // @everyone role
                    deny: ['ViewChannel']
                  }
                ]
              });
            }
            
            // Get support roles from config
            const supportRoles = config.roles.ticketSupportRoles || [
              '1343224344591077386',
              '1343224002113699973',
              '1343223432334282894'
            ];
            
            // Create permission overwrites
            const permissionOverwrites = [
              {
                id: guild.id, // @everyone role
                deny: ['ViewChannel']
              },
              {
                id: member.user.id, // Ticket creator
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
              }
            ];
            
            // Add support roles
            for (const roleId of supportRoles) {
              permissionOverwrites.push({
                id: roleId,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
              });
            }
            
            // Create the ticket channel
            const ticketChannel = await guild.channels.create({
              name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              type: 0, // TextChannel
              parent: ticketCategory.id,
              permissionOverwrites: permissionOverwrites
            });
            
            // Create close ticket button
            const closeButton = new ButtonBuilder()
              .setCustomId('close_ticket')
              .setLabel('Tutup Ticket')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('🔒');
            
            const row = new ActionRowBuilder().addComponents(closeButton);
            
            // Create welcome embed
            const embed = new EmbedBuilder()
              .setTitle('🎫 Ticket Support')
              .setDescription(`Halo ${member}, terima kasih telah membuat ticket. Tim support kami akan segera membantu Anda.\n\nSilakan jelaskan masalah atau pertanyaan Anda dengan detail.`)
              .setColor('#FF6200')
              .addFields(
                { name: 'User', value: `${member}`, inline: true },
                { name: 'ID', value: `${member.user.id}`, inline: true }
              )
              .setFooter({ 
                text: `𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 - 𝙲𝙾𝙼𝙼𝚄𝙽𝙸𝚃𝚈 𝚂𝙴𝚁𝚅𝙴𝚁`,
                iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
              })
              .setTimestamp();
            
            // Send welcome message to new ticket channel
            await ticketChannel.send({
              content: `${member} ${supportRoles.map(r => `<@&${r}>`).join(' ')}`,
              embeds: [embed],
              components: [row]
            });
            
            // Notify user
            return interaction.followUp({
              content: `✅ Ticket Anda telah dibuat: <#${ticketChannel.id}>`,
              ephemeral: true
            });
          } catch (err) {
            logger.error('Error creating ticket channel:', err);
            return interaction.followUp({
              content: '❌ Terjadi kesalahan saat membuat ticket. Silakan coba lagi nanti.',
              ephemeral: true
            });
          }
        }
        
        // Handle ticket closing button
        else if (buttonId === 'close_ticket') {
          // Defer reply to prevent timing out
          await interaction.deferReply({ ephemeral: true });
          
          try {
            const channel = interaction.channel;
            
            // Verify this is a ticket channel
            if (!channel.name.startsWith('ticket-')) {
              return interaction.followUp({
                content: '❌ Channel ini bukan ticket.',
                ephemeral: true
              });
            }
            
            // Get permissions for current user
            const member = interaction.member;
            const supportRoles = config.roles.ticketSupportRoles || [
              '1343224344591077386',
              '1343224002113699973',
              '1343223432334282894'
            ];
            
            // Check if user has permission to close ticket
            const hasSupportRole = supportRoles.some(roleId => member.roles.cache.has(roleId));
            const isTicketCreator = channel.permissionOverwrites.cache.find(
              o => o.type === 'member' && o.id === member.user.id && o.allow.has('ViewChannel')
            );
            
            if (!hasSupportRole && !isTicketCreator) {
              return interaction.followUp({
                content: '❌ Anda tidak memiliki izin untuk menutup ticket ini.',
                ephemeral: true
              });
            }
            
            // Create confirmation embed
            const embed = new EmbedBuilder()
              .setTitle('🔒 Ticket Ditutup')
              .setDescription(`Ticket ini telah ditutup oleh ${member}.\nChannel ini akan dihapus dalam 10 detik.`)
              .setColor('#FF6200')
              .setFooter({ 
                text: `𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 - 𝙲𝙾𝙼𝙼𝚄𝙽𝙸𝚃𝚈 𝚂𝙴𝚁𝚅𝙴𝚁`,
                iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
              })
              .setTimestamp();
            
            // Send confirmation message
            await channel.send({ embeds: [embed] });
            
            // Notify user the ticket is closed
            await interaction.followUp({
              content: '✅ Ticket akan ditutup dalam 10 detik.',
              ephemeral: true
            });
            
            // Set timeout to delete the channel
            setTimeout(async () => {
              try {
                await channel.delete();
              } catch (err) {
                logger.error('Error deleting ticket channel:', err);
              }
            }, 10000); // 10 seconds
          } catch (err) {
            logger.error('Error closing ticket:', err);
            return interaction.followUp({
              content: '❌ Terjadi kesalahan saat menutup ticket.',
              ephemeral: true
            });
          }
        }
        
        // Handle other button interactions as needed
        else {
          logger.debug(`Unknown button interaction: ${buttonId}`);
          await interaction.reply({ 
            content: 'Tombol ini tidak memiliki handler yang terdaftar.',
            ephemeral: true 
          });
        }
      } catch (error) {
        logger.error(`Error handling button interaction (${interaction.customId}):`, error);
        await interaction.reply({ 
          content: '⚠️ Maaf, terjadi gangguan saat memproses tombol. Silakan coba lagi dalam beberapa saat.',
          ephemeral: true 
        }).catch(e => {
          logger.error('Failed to send button error reply:', e);
        });
      }
    }
    
    // Handle select menu interactions
    else if (interaction.isSelectMenu()) {
      try {
        const menuId = interaction.customId;
        
        // Handle reaction role select menu
        if (menuId.startsWith('role_select_')) {
          // Implement role selection logic
          logger.debug(`Role select menu interaction: ${menuId}`);
        }
        
        // Handle other select menu interactions as needed
        else {
          logger.debug(`Unknown select menu interaction: ${menuId}`);
          await interaction.reply({ 
            content: 'Menu ini tidak memiliki handler yang terdaftar.',
            ephemeral: true 
          });
        }
      } catch (error) {
        logger.error(`Error handling select menu interaction (${interaction.customId}):`, error);
        await interaction.reply({ 
          content: '⚠️ Maaf, terjadi gangguan saat memproses menu. Silakan coba lagi nanti.',
          ephemeral: true 
        }).catch(e => {
          logger.error('Failed to send select menu error reply:', e);
        });
      }
    }
    
    // Handle modal form submissions
    else if (interaction.isModalSubmit()) {
      try {
        const modalId = interaction.customId;
        
        // Handle ticket creation modal
        if (modalId.startsWith('ticket_modal_')) {
          const { handleTicketModal } = require('../commands/tickets/createticket');
          await handleTicketModal(interaction, client);
        }
        
        // Handle other modal submissions as needed
        else {
          logger.debug(`Unknown modal submission: ${modalId}`);
          await interaction.reply({ 
            content: 'Form ini tidak memiliki handler yang terdaftar.',
            ephemeral: true 
          });
        }
      } catch (error) {
        logger.error(`Error handling modal submission (${interaction.customId}):`, error);
        await interaction.reply({ 
          content: '⚠️ Mohon maaf, terjadi gangguan saat memproses formulir. Silakan coba lagi dalam beberapa saat.',
          ephemeral: true 
        }).catch(e => {
          logger.error('Failed to send modal error reply:', e);
        });
      }
    }
  }
};
