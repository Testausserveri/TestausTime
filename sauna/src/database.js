import { database } from './index.js';
import crypto from 'crypto';
import fetch from 'node-fetch';
const Schema = database.Schema;
const time = new Schema({
    date: Date,
    time: {
        type: Number,
        min: 1000,
        max: 300000
    },
    project: String,
    editor: String
});
export const user = new Schema({
    userID: { type: String },
    apiKey: { type: String },
    time: { type: [time], default: [] },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenType: { type: String }
});

user.methods.getTotalTime = function () {
    let amount = 0;
    this.time.forEach((time) => {
        if (time.time)
            amount += time.time;
    });
    return amount;
};

const COOLDOWN_LENGTH = 5 * 60 * 1000; // Five minutes by default.

user.methods.hasCooldown = function () {
    return this.time.length != 0 ? (Date.now() - this.time[this.time.length - 1].date.getTime()) < COOLDOWN_LENGTH : false;
};

const Time = database.model('Time', time);

user.methods.addTime = async function (time, project, editor) {
    if(time < 1000 || time > 300000) {
        return false;
    }
    this.time.push(new Time(
        {
            date: Date.now(),
            time,
            project,
            editor
        }
    ))
    await this.save();
    return true;
};

const getDiscordUser = (tokenType, accessToken) => new Promise(async (resolve, reject) => {
    const userResult = await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${tokenType} ${accessToken}`,
        },
    });

    const userInfo = await userResult.json();
    if (userInfo.code && userInfo.code == 0) {
        return resolve(false);
    }
    resolve(userInfo);
})

user.methods.getDiscordUser = async function() {
    const self = this;
    return new Promise(async (resolve, reject) => {
        let userInfo = await getDiscordUser(self.tokenType, self.accessToken);
        if (!userInfo) {
            const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: config.discord_client_id,
                    client_secret: config.discord_client_secret,
                    refresh_token: self.refreshToken,
                    grant_type: 'refresh_token',
                    scope: 'identify',
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const { access_token, token_type} = oauthResult;
            self.accessToken = access_token;
            self.tokenType = token_type;
            await self.save();
            userInfo = await getDiscordUser(self.tokenType, self.accessToken);
        }
        const { username, discriminator, avatar } = userInfo;
        const tag = `${username}#${discriminator}`;
        resolve({ username, discriminator, avatar, tag });
    })
}

const User = database.model('User', user);

export const getUserById = (userID) => new Promise(async (resolve, reject) => {
    User.findOne({
        userID
    }, (err, user) => {
        if (err)
            return reject(err);
        if (!user)
            return resolve(false);
        resolve(user);
    });
});

export const getUserByAPIKey = (apiKey) => new Promise(async (resolve, reject) => {
    User.findOne({
        apiKey
    }, (err, user) => {
        if (err)
            return reject(err);
        if (!user)
            return resolve(false);
        resolve(user);
    });
});

export const registerUser = (userData) => new Promise(async (resolve, reject) => {
    try {
        const userExists = await getUserById(userData.userID);
        if (userExists) return resolve(false);
        const user = new User(userData);
        user.time = [];
        user.apiKey = crypto.randomBytes(24).toString("hex");
        await user.save();
        resolve(user);
    } catch(e) {
        console.error(e);
        reject(e);
    }
});

export const getTop10 = async () => new Promise(async (resolve, reject) => {
    const top10 = await User.find({});
    resolve(top10.sort((a, b) => {
        return b.getTotalTime() - a.getTotalTime();
    }).slice(0,10));
});
