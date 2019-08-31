const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const Slots = require('./slots/slots');
const DiscordHelper = require('./helpers/discord-helper');
const FileHelper = require('./helpers/file-helper');
const PointsHelper = require('./helpers/points-helper');
const RankHelper = require('./helpers/rank-helper');
const Alert = require('./free-games-collection-alert/alert');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    const username = DiscordHelper.getUsername(msg, client);
    let userPoints = FileHelper.readFileFromUserPoints(username);
    const isSpencer = username === 'PoshPrincess7' ? true : false;
    if (userPoints === null) {
        userPoints = DiscordHelper.createNewUser(msg, username);
    }

    if (msg.content.startsWith('!slots')) {
        Slots.startSlots(msg, userPoints);
    }

    if (msg.content === '!points') {
        msg.channel.send(`${username} has ${userPoints.points} total`);
    }

    if (msg.content === '!dailyPoints') {
        if (userPoints.lastDailyPoints === undefined || userPoints.lastDailyPoints !== new Date().setHours(0, 0, 0, 0)) {
            PointsHelper.addDailyPoints(userPoints, msg);
        } else {
            msg.channel.send(`${username}, you have already claimed your daily points.  Try again tomorrow.`);
        }
    }

    if (msg.content.split(" ")[0] === '!addPoints' && isSpencer) {
        const userToGivePointsTo = msg.content.split(" ")[1];
        const pointsToGive = Number(msg.content.split(" ")[2]);
        const userPointsToGiveTo = FileHelper.readFileFromUserPoints(userToGivePointsTo);
        let message, sendMessage;

        if (Number.isNaN(pointsToGive)) {
            message = 'Points is not a valid number.\n';
            sendMessage = true;
        }

        if (userPointsToGiveTo === null) {
            message = message + 'Username is not valid.';
            sendMessage = true;
        }

        if (sendMessage) {
            msg.channel.send(message);
        } else {
            FileHelper.writeFileToUserPoints(PointsHelper.addPoints(pointsToGive, userPointsToGiveTo), userToGivePointsTo);
            msg.channel.send(`Successfully added ${pointsToGive} points to ${userToGivePointsTo}'s account!`);
        }
    }

    if (msg.content === "!rank") {
        const rankBefore = userPoints.rank;
        let message;
        userPoints = RankHelper.updateUserRank(userPoints);

        if (rankBefore !== undefined && rankBefore !== userPoints.rank) {
            message = `You have changed ranks! Rank Before: ${rankBefore};  Current Rank: ${userPoints.rank}`;
        } else {
            message = `Current Rank: ${userPoints.rank}`;
        }

        msg.channel.send(message);
    }
});

client.login(auth.token);