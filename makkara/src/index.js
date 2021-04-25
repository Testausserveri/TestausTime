/*
TestausTime: Makkara
*/

import * as Discord from 'discord.js';
import * as config from '../config.js';
import * as axios from 'axios';
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  // register commands
  client.api.applications(client.user.id).commands.post({data: {
      name: 'leaderboard',
      description: 'Näytä TestausTimen top 10 käyttäjää.',
      options: [],
  }})
  client.api.applications(client.user.id).commands.post({data: {
    name: 'register',
    description: 'Rekisteröidy TestausTimeen',
    options: [],
  }})
});

client.ws.on('INTERACTION_CREATE', async interaction => {
  console.log(interaction)
  const channelId = interaction.data.options[0].value
  const channel = await client.channels.fetch(channelId)

  // check that channel is a voice channel
  if (!channel || channel.type != "voice") {
      client.api.interactions(interaction.id, interaction.token).callback.post({data: {
          type: 4,
          data: {
            content: `Toi ei oo äänikanava.`
          }
      }})
  }

  // create invite
  client.api
  .channels(channel.id)
  .invites.post({
      data: {
          "max_age": 604800,
          "max_uses": 0,
          "target_application_id": "755600276941176913",
          "target_type": 2,
          "temporary": false,
      }
  })
  .then(invite => new Discord.Invite(client, invite))
  .then((invite) => {
      console.log(`Luotu kutsu ${invite.url} palvelimelle ${channel.guild.name}`)
      client.api.interactions(interaction.id, interaction.token).callback.post({data: {
          type: 4,
          data: {
            content: `[Paina tästä](<${invite.url}>) avataksesi YouTube-katselusession kanavalla ${channel.name}.`
          }
      }})
  })
})

client.login(config.discord_token).catch((e)=>{
  console.log('Login failed.')
  process.exit();
})