const config = require('../config.json');
const Discord = require('discord.js');

module.exports = {
  name: 'ready',
  async execute(bot) {
    await bot.user.setPresence({ activities: [{ name: 'By nekrxs.', type: 5 }], status: 'idle' });

    let msg;
    const save = new Set();
    const save2 = new Set();

    const getStatusIcon = (status) => {
      switch (status) {
        case 'online':
        case 'idle':
        case 'dnd':
          return '🟢';
        default:
          return '🔴';
      }
    };

    const getClientPlatform = (clientStatus) => {
      if (!clientStatus) return 'Offline';
      if (clientStatus.desktop) return 'PC';
      if (clientStatus.mobile) return 'Phone';
      if (clientStatus.web) return 'Web';
      return '';
    };
    const updateStatus = async () => {
      let devs = '';
      let bots = '';

      const channel = bot.channels.cache.get(config.channel);
      if (!channel) {
        console.log(`\x1b[31m[!] — Channel with ID ${config.channel} not found. Please configure a valid channel ID.\x1b[0m`);
        return;
      }

      await Promise.all(channel.guild.members.cache.map(async (member) => {
        if (config.bots.includes(member.id) && !save.has(member.id)) {
          bots += `- \`${getStatusIcon(member.presence?.status)}\` [\`${member.user.username}\`](https://discord.com/users/${member.user.id})\n`;
          save.add(member.id);
        }
        if (config.devs.includes(member.id) && !save2.has(member.id)) {
          devs += `- \`${getStatusIcon(member.presence?.status)}\` [\`${member.user.username}\`](https://discord.com/users/${member.user.id}) (\`${getClientPlatform(member.presence?.clientStatus)}\`)\n`;
          save2.add(member.id);
        }
      }));

      const embedStatus = new Discord.EmbedBuilder()
      .setTitle(`\`🪄\` ▸ Status of ${channel.guild.name}`)
      .setDescription(`**Developers**\n${devs}\n**Bots**\n${bots}\n**Last update :**\n<t:${Math.floor(Date.now() / 1000)}:R>`)
      .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL({ dynamic: true }) })
      .setColor(config.color)
      .setTimestamp();

      if (!msg) {
        msg = await channel.send({ embeds: [embedStatus] });
      } else {
        await msg.edit({ embeds: [embedStatus] });
      }
      
      save.clear();
      save2.clear();
    };

    setInterval(updateStatus, config.time * 1000);
    updateStatus();
  },
};