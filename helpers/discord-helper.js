const Discord = require('discord.js');
const FileHelper = require('./file-helper');

class DiscordHelper {
    static getUsername(msg, client) {
        var user = msg.member;
        user = user.toString();
        if (user.includes("!")) {
            user = user.split("!")[1].split(">")[0];
        } else {
            user = user.split("@")[1].split(">")[0];
        }

        return client.users.get(user).username;
    }

    static createNewUser(msg, username) {
        msg.channel.send(`Welcome, ${username}! I have started you at 5000 points.`);
        const userPoints = {
            username: username,
            points: 5000
        };
        FileHelper.writeFileToUserPoints(userPoints, username);

        return userPoints;
    }
}

module.exports = DiscordHelper;