// Command to display currently live JKT48 members
const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, createLiveEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const { scrapeIDNLive, scrapeShowroom } = require('../../utils/webScraper');
const config = require('../../config');
const { getCurrentMembers } = require('../../models/jkt48Members');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('livememberjkt48')
    .setDescription('Tampilkan member JKT48 yang sedang live streaming'),
  cooldown: 5,
  async execute(interaction, client) {
    // deferReply sudah dihandle oleh commandWrapper, jadi tidak perlu memanggil lagi di sini
    
    try {
      // Get all current JKT48 members
      const members = getCurrentMembers();
      
      // Arrays to store live members from different platforms
      const idnLiveMembers = [];
      const showroomMembers = [];
      
      // Check IDN Live status for members
      for (const member of members) {
        if (member.idnLiveUrl) {
          try {
            const liveData = await scrapeIDNLive(member.idnLiveUrl);
            if (liveData) {
              idnLiveMembers.push({
                ...liveData,
                memberId: member.id,
                memberName: member.nickName || member.fullName,
                platform: 'IDN Live'
              });
            }
          } catch (error) {
            logger.error(`Error checking IDN Live for ${member.nickName}:`, error);
          }
        }
        
        if (member.showroomUrl) {
          try {
            const liveData = await scrapeShowroom(member.showroomUrl);
            if (liveData) {
              showroomMembers.push({
                ...liveData,
                memberId: member.id,
                memberName: member.nickName || member.fullName,
                platform: 'Showroom'
              });
            }
          } catch (error) {
            logger.error(`Error checking Showroom for ${member.nickName}:`, error);
          }
        }
      }
      
      // Combine results
      const allLiveMembers = [...idnLiveMembers, ...showroomMembers];
      
      if (allLiveMembers.length === 0) {
        const noLiveEmbed = createEmbed()
          .setTitle('Tidak Ada Member JKT48 yang Sedang Live')
          .setDescription('Saat ini tidak ada member JKT48 yang sedang melakukan live streaming.')
          .addFields({
            name: 'Cek Lagi Nanti',
            value: 'Gunakan perintah ini lagi nanti untuk melihat apakah ada member yang telah memulai live streaming.'
          });
        
        await interaction.editReply({
          embeds: [noLiveEmbed]
        });
        
        return;
      }
      
      // Create embeds for live members
      const embeds = [];
      
      for (const liveMember of allLiveMembers) {
        const embed = createLiveEmbed(liveMember, liveMember.platform, true);
        embeds.push(embed);
      }
      
      // Create main embed with summary
      const mainEmbed = createEmbed()
        .setTitle(`📱 Member JKT48 yang Sedang Live (${allLiveMembers.length})`)
        .setDescription('Berikut adalah daftar member JKT48 yang sedang melakukan live streaming:');
      
      let liveList = '';
      allLiveMembers.forEach((member, index) => {
        liveList += `${index + 1}. **${member.memberName}** - ${member.platform}\n`;
        liveList += `   Judul: ${member.title || 'No Title'}\n`;
        liveList += `   [Tonton Disini](${member.watchLink})\n\n`;
      });
      
      mainEmbed.addFields({ name: 'Member Live', value: liveList });
      
      // Add the main embed first, then add detail embeds (up to 10 total embeds)
      embeds.unshift(mainEmbed);
      
      // Discord allows up to 10 embeds per message
      const embedsToSend = embeds.slice(0, 10);
      
      await interaction.editReply({
        embeds: embedsToSend
      });
      
      logger.info(`Live members list requested by ${interaction.user.tag}, found ${allLiveMembers.length} live members`);
    } catch (error) {
      logger.error('Error executing livememberjkt48 command:', error);
      await interaction.editReply({ 
        content: 'Terjadi kesalahan saat memeriksa member yang sedang live. Silakan coba lagi nanti.'
      });
    }
  }
};
