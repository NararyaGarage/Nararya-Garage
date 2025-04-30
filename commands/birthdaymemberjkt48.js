// Command to display JKT48 members having birthdays today or in a specific month
const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const { getAllMembers, getMembersByBirthMonth, getMembersWithBirthdayToday } = require('../../models/jkt48Members');
const { formatDateIndonesia } = require('../../utils/formatters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthdaymemberjkt48')
    .setDescription('Tampilkan member JKT48 yang berulang tahun')
    .addIntegerOption(option => 
      option.setName('bulan')
        .setDescription('Bulan (1-12)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(12)),
  cooldown: 5,
  async execute(interaction, client) {
    // deferReply sudah dihandle oleh commandWrapper, jadi tidak perlu memanggil lagi di sini
    try {
      // Get the month option if provided, otherwise use current month
      const month = interaction.options.getInteger('bulan');
      
      let members;
      let title;
      let description;
      
      if (!month) {
        // Get members with birthdays today
        members = getMembersWithBirthdayToday();
        
        title = '🎂 Member JKT48 Ulang Tahun Hari Ini';
        description = members.length > 0 
          ? 'Berikut adalah member JKT48 yang berulang tahun hari ini:' 
          : 'Tidak ada member JKT48 yang berulang tahun hari ini.';
          
        // If no birthdays today, get this month's birthdays
        if (members.length === 0) {
          const currentMonth = new Date().getMonth() + 1;
          members = getMembersByBirthMonth(currentMonth);
          
          title = '🎂 Member JKT48 Ulang Tahun Bulan Ini';
          description = members.length > 0 
            ? 'Berikut adalah member JKT48 yang berulang tahun di bulan ini:' 
            : 'Tidak ada member JKT48 yang berulang tahun di bulan ini.';
        }
      } else {
        // Get members with birthdays in the specified month
        members = getMembersByBirthMonth(month);
        
        // Get month name
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        title = `🎂 Member JKT48 Ulang Tahun Bulan ${monthNames[month - 1]}`;
        description = members.length > 0 
          ? `Berikut adalah member JKT48 yang berulang tahun di bulan ${monthNames[month - 1]}:` 
          : `Tidak ada member JKT48 yang berulang tahun di bulan ${monthNames[month - 1]}.`;
      }
      
      // Sort members by day of month
      members.sort((a, b) => {
        const dayA = new Date(a.birthDate).getDate();
        const dayB = new Date(b.birthDate).getDate();
        return dayA - dayB;
      });
      
      // Create the embed
      const birthdayEmbed = createEmbed()
        .setTitle(title)
        .setDescription(description);
      
      if (members.length > 0) {
        let memberList = '';
        
        members.forEach(member => {
          const birthDate = new Date(member.birthDate);
          const day = birthDate.getDate();
          const birthYear = birthDate.getFullYear();
          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;
          
          memberList += `• **${member.fullName}** (${member.nickName})\n`;
          memberList += `  📅 ${day} ${formatDateIndonesia(member.birthDate).split(' ')[1]} ${birthYear}\n`;
          memberList += `  🎈 ${age} tahun${member.graduated ? ' (Graduated)' : ''}\n`;
          
          if (member.instagramHandle) {
            memberList += `  📱 [Instagram](https://www.instagram.com/${member.instagramHandle})\n`;
          }
          
          memberList += '\n';
        });
        
        birthdayEmbed.addFields({ name: 'Member', value: memberList });
      }
      
      await interaction.editReply({
        embeds: [birthdayEmbed]
      });
      
      logger.info(`Birthday members list requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error executing birthdaymemberjkt48 command:', error);
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat menampilkan daftar member ulang tahun. Silakan coba lagi nanti.'
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat menampilkan daftar member ulang tahun. Silakan coba lagi nanti.',
          ephemeral: true 
        });
      }
    }
  }
};
