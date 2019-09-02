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

    static createNewUser(msg, username, userPointsFilePath, userPointsList) {
        msg.channel.send(`Welcome, ${username}! I have started you at 5000 points.`);
        let userPoints = {
            username: username,
            points: 5000
        };

        userPointsList.push(userPoints);
        FileHelper.writeFile(userPointsList, userPointsFilePath);

        return userPoints;
    }
}

module.exports = DiscordHelper;