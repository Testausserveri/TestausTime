import { database } from './index.js';
import { apiKey } from './utils.js';
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
        if (userExists) resolve(false);
        const user = new User(userData);
        user.time = [];
        user.apiKey = apiKey();
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
