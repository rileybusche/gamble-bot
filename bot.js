const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const Slots = require('./slots/slots');
const DiscordHelper = require('./helpers/discord-helper');
const FileHelper = require('./helpers/file-helper');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === '!slots') {
        const username = DiscordHelper.getUsername(msg, client);
        let userPoints = FileHelper.readFileFromUserPoints(username);

        if (userPoints === null) {
            userPoints = {
                username: username,
                points: 0
            };

            FileHelper.writeFileToUserPoints(userPoints, username);
        }

        console.log(userPoints);
        const slotsGameResults = Slots.play(username, userPoints);
        const message = "Points Earned: " + slotsGameResults.pointsWon + "\n" + slotsGameResults.game + "\n" + slotsGameResults.message;

        userPoints.points += slotsGameResults.pointsWon;

        FileHelper.writeFileToUserPoints(userPoints, username);
        msg.channel.send(message);
    }

    if (msg.content.includes('!trade')) {


    }
});

client.login(auth.token);