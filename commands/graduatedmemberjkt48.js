// Command to display graduated JKT48 members
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const { getGraduatedMembers } = require('../../models/jkt48Members');
const { formatDateIndonesia } = require('../../utils/formatters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('graduatedmemberjkt48')
    .setDescription('Tampilkan daftar member JKT48 yang sudah lulus (graduated)')
    .addIntegerOption(option => 
      option.setName('generasi')
        .setDescription('Filter berdasarkan generasi')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)),
  cooldown: 5,
  async execute(interaction, client) {
    try {
      // Get filter option
      const genFilter = interaction.options.getInteger('generasi');
      
      // Get all graduated members
      let members = getGraduatedMembers();
      
      // Apply generation filter if specified
      if (genFilter) {
        members = members.filter(member => member.generation === genFilter);
      }
      
      // Sort members by graduation date (most recent first)
      members.sort((a, b) => new Date(b.graduationDate) - new Date(a.graduationDate));
      
      // Create the embed
      const graduatedEmbed = createEmbed()
        .setTitle(`Member JKT48 yang Sudah Graduated${genFilter ? ` (Generasi ${genFilter})` : ''}`)
        .setDescription(`Berikut adalah daftar member JKT48 yang sudah lulus (graduated)${genFilter ? ` dari generasi ${genFilter}` : ''}:`);
      
      if (members.length === 0) {
        graduatedEmbed.addFields({ 
          name: 'Tidak Ada Member', 
          value: 'Tidak ada member graduated yang ditemukan dengan filter yang dipilih.'
        });
      } else {
        // Group members by generation for better display
        const membersByGeneration = {};
        
        members.forEach(member => {
          const gen = member.generation || 'Tidak Diketahui';
          
          if (!membersByGeneration[gen]) {
            membersByGeneration[gen] = [];
          }
          
          membersByGeneration[gen].push(member);
        });
        
        // Create fields for each generation
        // Sort generations numerically
        const sortedGenerations = Object.keys(membersByGeneration).sort((a, b) => {
          return parseInt(a) - parseInt(b);
        });
        
        for (const gen of sortedGenerations) {
          const genMembers = membersByGeneration[gen];
          
          let memberList = '';
          genMembers.forEach(member => {
            memberList += `• **${member.fullName}** (${member.nickName})\n`;
            memberList += `  🎭 Team ${member.team}\n`;
            memberList += `  📅 Lulus: ${formatDateIndonesia(member.graduationDate)}\n`;
            
            if (member.instagramHandle) {
              memberList += `  📱 [Instagram](https://www.instagram.com/${member.instagramHandle})\n`;
            }
            
            memberList += '\n';
          });
          
          graduatedEmbed.addFields({ 
            name: `Generasi ${gen} (${genMembers.length} member)`, 
            value: memberList 
          });
        }
        
        // Add total count
        graduatedEmbed.setFooter({ 
          text: `Total: ${members.length} member graduated${genFilter ? ` dari generasi ${genFilter}` : ''}`, 
          iconURL: client.user.displayAvatarURL() 
        });
      }
      
      // Create generation filter buttons (only if there are multiple generations)
      const generations = [...new Set(getGraduatedMembers().map(m => m.generation))].sort((a, b) => a - b);
      
      if (generations.length > 1) {
        // Create button rows (max 5 buttons per row)
        const buttonRows = [];
        let currentRow = new ActionRowBuilder();
        let buttonCount = 0;
        
        // Add "All" button
        currentRow.addComponents(
          new ButtonBuilder()
            .setCustomId('gen_filter_all')
            .setLabel('Semua')
            .setStyle(genFilter ? ButtonStyle.Secondary : ButtonStyle.Primary)
        );
        buttonCount++;
        
        // Add generation buttons
        for (const gen of generations) {
          if (buttonCount === 5) {
            buttonRows.push(currentRow);
            currentRow = new ActionRowBuilder();
            buttonCount = 0;
          }
          
          currentRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`gen_filter_${gen}`)
              .setLabel(`Gen ${gen}`)
              .setStyle(genFilter === gen ? ButtonStyle.Primary : ButtonStyle.Secondary)
          );
          
          buttonCount++;
        }
        
        if (buttonCount > 0) {
          buttonRows.push(currentRow);
        }
        
        const response = await interaction.reply({
          embeds: [graduatedEmbed],
          components: buttonRows,
          fetchReply: true
        });
        
        // Handle button interactions
        const filter = i => i.user.id === interaction.user.id && i.customId.startsWith('gen_filter_');
        const collector = response.createMessageComponentCollector({ filter, time: 60000 });
        
        collector.on('collect', async i => {
          // Get new filter from button
          const newFilter = i.customId.replace('gen_filter_', '');
          
          // Create a new interaction object with the option
          const newInteraction = {
            ...interaction,
            options: {
              getInteger: (name) => {
                if (name === 'generasi') {
                  return newFilter === 'all' ? null : parseInt(newFilter);
                }
                return null;
              }
            }
          };
          
          // Acknowledge the interaction
          await i.deferUpdate();
          
          // Execute the command again with the new filter
          await this.execute(newInteraction, client);
        });
        
        collector.on('end', () => {
          // Remove buttons after timeout
          interaction.editReply({
            components: []
          }).catch(e => logger.error('Failed to remove buttons after timeout:', e));
        });
      } else {
        // If there's only one generation or no filter buttons, just send the embed
        await interaction.reply({
          embeds: [graduatedEmbed]
        });
      }
      
      logger.info(`Graduated members list requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error executing graduatedmemberjkt48 command:', error);
      await interaction.reply({ 
        content: 'Terjadi kesalahan saat menampilkan daftar member graduated. Silakan coba lagi nanti.',
        ephemeral: true 
      });
    }
  }
};
