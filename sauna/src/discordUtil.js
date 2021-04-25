// Util to get usernames using discord.js

import * as Discord from 'discord.js';
import config from '../config.js';
const client = new Discord.Client();

export const getDiscordUserById = (userID) => new Promise(async (resolve, reject) => {
  try {
    let userData = await client.api.users(userID).get();
    resolve({
      username: userData.username,
      discriminator: userData.discriminator,
      tag: `${userData.username}#${userData.discriminator}`,
      avatar: userData.avatar,
    })
  } catch(e) {
    reject(e);
  }
})

client.login(config.discord_token).then(function() {
  console.log('Logged in to Discord.')
}, function(err) {
  console.log('Error while logging to Discord. Probably invalid token.');
  process.exit();
})
