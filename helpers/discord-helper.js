const Discord = require('discord.js');

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
}

module.exports = DiscordHelper;