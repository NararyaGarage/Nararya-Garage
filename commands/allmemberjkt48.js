// Command to display all current JKT48 members
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const { getAllMembers, getCurrentMembers, getMembersByTeam } = require('../../models/jkt48Members');
const { formatDateIndonesia } = require('../../utils/formatters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('allmemberjkt48')
    .setDescription('Tampilkan daftar semua member JKT48')
    .addStringOption(option => 
      option.setName('team')
        .setDescription('Filter berdasarkan team')
        .setRequired(false)
        .addChoices(
          { name: 'Team J', value: 'J' },
          { name: 'Team K3', value: 'K3' },
          { name: 'Team T', value: 'T' },
          { name: 'Academy', value: 'Academy' },
          { name: 'Semua', value: 'all' }
        )),
  cooldown: 5,
  async execute(interaction, client) {
    try {
      // Get filter option
      const teamFilter = interaction.options.getString('team') || 'all';
      
      // Get members based on filter
      let members;
      let titleSuffix = '';
      
      if (teamFilter === 'all') {
        members = getCurrentMembers();
        titleSuffix = '';
      } else {
        members = getMembersByTeam(teamFilter);
        titleSuffix = ` - Team ${teamFilter}`;
      }
      
      // Sort members by name
      members.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
      
      // Create the main embed
      const mainEmbed = createEmbed()
        .setTitle(`Member JKT48${titleSuffix}`)
        .setDescription(`Berikut adalah daftar member JKT48${titleSuffix} saat ini:`);
      
      // Generate member list for the embed
      if (members.length === 0) {
        mainEmbed.addFields({ 
          name: 'Tidak Ada Member', 
          value: 'Tidak ada member yang ditemukan dengan filter yang dipilih.'
        });
      } else {
        // Group members by team for better display
        const membersByTeam = {};
        
        members.forEach(member => {
          const team = member.team || 'Lainnya';
          
          if (!membersByTeam[team]) {
            membersByTeam[team] = [];
          }
          
          membersByTeam[team].push(member);
        });
        
        // Create fields for each team
        for (const team in membersByTeam) {
          const teamMembers = membersByTeam[team];
          
          let memberList = '';
          teamMembers.forEach(member => {
            memberList += `• **${member.fullName}** (${member.nickName})\n`;
            memberList += `  🎂 ${formatDateIndonesia(member.birthDate)}\n`;
            
            if (member.instagramHandle) {
              memberList += `  📱 [Instagram](https://www.instagram.com/${member.instagramHandle})\n`;
            }
            
            memberList += '\n';
          });
          
          mainEmbed.addFields({ 
            name: `Team ${team} (${teamMembers.length} member)`, 
            value: memberList 
          });
        }
        
        // Add total count
        mainEmbed.setFooter({ 
          text: `Total: ${members.length} member${titleSuffix ? ` di Team ${teamFilter}` : ''}`, 
          iconURL: client.user.displayAvatarURL() 
        });
      }
      
      // Create filter buttons
      const filterButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('filter_all')
            .setLabel('Semua')
            .setStyle(teamFilter === 'all' ? ButtonStyle.Primary : ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('filter_j')
            .setLabel('Team J')
            .setStyle(teamFilter === 'J' ? ButtonStyle.Primary : ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('filter_k3')
            .setLabel('Team K3')
            .setStyle(teamFilter === 'K3' ? ButtonStyle.Primary : ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('filter_t')
            .setLabel('Team T')
            .setStyle(teamFilter === 'T' ? ButtonStyle.Primary : ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('filter_academy')
            .setLabel('Academy')
            .setStyle(teamFilter === 'Academy' ? ButtonStyle.Primary : ButtonStyle.Secondary)
        );
      
      const response = await interaction.reply({
        embeds: [mainEmbed],
        components: [filterButtons],
        fetchReply: true
      });
      
      // Handle button interactions
      const filter = i => i.user.id === interaction.user.id && i.customId.startsWith('filter_');
      const collector = response.createMessageComponentCollector({ filter, time: 60000 });
      
      collector.on('collect', async i => {
        // Get new filter from button
        const newFilter = i.customId.replace('filter_', '');
        
        // Create a new interaction object with the option
        const newInteraction = {
          ...interaction,
          options: {
            getString: (name) => {
              if (name === 'team') {
                return newFilter === 'all' ? 'all' : 
                       newFilter === 'j' ? 'J' : 
                       newFilter === 'k3' ? 'K3' : 
                       newFilter === 't' ? 'T' : 
                       newFilter === 'academy' ? 'Academy' : 'all';
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
      
      logger.info(`All members list requested by ${interaction.user.tag} with filter ${teamFilter}`);
    } catch (error) {
      logger.error('Error executing allmemberjkt48 command:', error);
      await interaction.reply({ 
        content: 'Terjadi kesalahan saat menampilkan daftar member JKT48. Silakan coba lagi nanti.',
        ephemeral: true 
      });
    }
  }
};
