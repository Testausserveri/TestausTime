/*
TestausTime: Makkara
*/

import * as Discord from 'discord.js';
import axios from 'axios';
import config from '../config'; // eslint-disable-line import/no-unresolved,import/extensions

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const millisToMinutesAndSeconds = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}min ${(seconds < 10 ? '0' : '')}${seconds}s`;
};

const PREFIX = '.';
client.on('message', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.content.length <= PREFIX.length) return;
    const content = message.content.substring(PREFIX.length);
    const args = content.split(' ');
    const command = args.shift();

    switch (command) {
    case 'leaderboard': {
        const msg = await message.reply('Haetaan listatietoja...');
        axios.get(config.leaderboard_url)
            .then((response) => {
                let leaderboardString = '';
                const { scoreboard } = response.data;
                for (let i = 0; i < scoreboard.length; i += 1) {
                    leaderboardString += `${i + 1}. ${scoreboard[i].discordUser.tag} - ${millisToMinutesAndSeconds(scoreboard[i].totalTime)}\n`;
                }
                const embed = new Discord.MessageEmbed();
                embed.setAuthor('time.testausserveri.fi');
                embed.setDescription(leaderboardString);
                embed.setTitle('Top 10');
                msg.edit('', embed);
            })
            .catch((error) => { // eslint-disable-line no-unused-vars
                message.reply('Virhe toplistaa haettaessa.');
            });
        break;
    }
    case 'register': {
        const embed = new Discord.MessageEmbed();
        embed.setAuthor('time.testausserveri.fi');
        embed.setDescription(`[Paina tästä](<${config.oauth_url}>) rekisteröityäksesi TestausTimeen.\nMuista kopioida API-key ja tallentaa se jonnekkin.`);
        message.reply(embed);
        break;
    }
    default: {
        break;
    }
    }
});

client.login(config.discord_token).catch((e) => { // eslint-disable-line no-unused-vars
    console.log('Login failed.');
    process.exit();
});
