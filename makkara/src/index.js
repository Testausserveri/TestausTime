/*
TestausTime: Makkara
*/

import * as Discord from 'discord.js';
import * as config from '../config.js';
import * as axios from 'axios';
const client = new Discord.Client();

client.on('ready', () => {
  console.log('Login succesful. Testing connection to Sauna.');
})

client.login(config.discord_token).catch((e)=>{
  console.log('Login failed.')
  process.exit();
})