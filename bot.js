const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const Slots = require('./slots/slots');
const DiscordHelper = require('./helpers/discord-helper');
const FileHelper = require('./helpers/file-helper');
const PointsHelper = require('./helpers/points-helper');
const RankHelper = require('./helpers/rank-helper');
const userPointsFilePath = '/../userPoints.json';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const userPointsList = FileHelper.readFile(userPointsFilePath);
    if (userPointsList === undefined || userPointsList === null) {
        PointsHelper.createUserPointsFile(userPointsFilePath);
    }
});

client.on('message', msg => {
    const username = DiscordHelper.getUsername(msg, client);

    if (username !== 'gamble-bot' && msg.content.startsWith("!")) {
        let userPointsList = FileHelper.readFile(userPointsFilePath);
        let userPoints = PointsHelper.findUserInUserPointsList(userPointsList, username);
        const isSpencer = username === 'PoshPrincess7' ? true : false;
        if (userPoints === null || userPoints === undefined) {
            userPoints = DiscordHelper.createNewUser(msg, username, userPointsFilePath, userPointsList);
        }

        if (msg.content.startsWith('!slots')) {
            userPoints = Slots.startSlots(msg, userPoints);
            userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPoints);
            FileHelper.writeFile(userPointsList, userPointsFilePath);
        }

        if (msg.content === '!points') {
            msg.channel.send(`${username} has ${userPoints.points} total`);
        }

        if (msg.content === '!dailyPoints') {
            if (userPoints.lastDailyPoints === undefined || userPoints.lastDailyPoints !== new Date().setHours(0, 0, 0, 0)) {
                userPoints = PointsHelper.addDailyPoints(userPoints, msg);
                userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPoints);
                FileHelper.writeFile(userPointsList, userPointsFilePath);
            } else {
                msg.channel.send(`${username}, you have already claimed your daily points.  Try again tomorrow.`);
            }
        }

        if (msg.content.split(" ")[0] === '!addPoints' && isSpencer) {
            const userToGivePointsTo = msg.content.split(" ")[1];
            const pointsToGive = Number(msg.content.split(" ")[2]);
            const userPointsToGiveTo = PointsHelper.findUserInUserPointsList(userPointsList, userToGivePointsTo);
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
                userPoints = PointsHelper.addPoints(pointsToGive, userPointsToGiveTo);
                userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPoints);
                FileHelper.writeFile(userPointsList, userPointsFilePath);
                msg.channel.send(`Successfully added ${pointsToGive} points to ${userToGivePointsTo}'s account!`);
            }
        }

        if (msg.content === "!rank") {
            const rankBefore = userPoints.rank;
            let message;
            userPoints = RankHelper.updateUserRank(userPoints);

            if (rankBefore !== undefined && rankBefore !== userPoints.rank) {
                message = `You have changed ranks!\nRank Before: ${rankBefore}\nCurrent Rank: ${userPoints.rank}`;
                userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPoints);
                FileHelper.writeFile(userPointsList, userPointsFilePath);
            } else {
                message = `Current Rank: ${userPoints.rank}`;
            }

            msg.channel.send(message);
        }

        if (msg.content.startsWith("!gift")) {
            const userToGivePointsTo = msg.content.split(" ")[1];
            const pointsToGive = Number(msg.content.split(" ")[2]);
            let userPointsToGiveTo = PointsHelper.findUserInUserPointsList(userPointsList, userToGivePointsTo);
            let message, sendMessage, userToDeductFrom;

            if (Number.isNaN(pointsToGive)) {
                message = 'Points is not a valid number.\n';
                sendMessage = true;
            }

            if (userPointsToGiveTo === null || userPointsToGiveTo === undefined) {
                message = message + 'Username is not valid.';
                sendMessage = true;
            }

            if (sendMessage) {
                msg.channel.send(message);
            } else {
                userPointsToGiveTo = PointsHelper.addPoints(pointsToGive, userPointsToGiveTo);
                userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPointsToGiveTo);
                userToDeductFrom = PointsHelper.findUserInUserPointsList(userPointsList, username);
                userToDeductFrom = PointsHelper.removePoints(pointsToGive, userToDeductFrom);
                userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userToDeductFrom);

                FileHelper.writeFile(userPointsList, userPointsFilePath);
                msg.channel.send(`Successfully added ${pointsToGive} points to ${userToGivePointsTo}'s account from ${username}!\n${userToGivePointsTo} now has ${userPointsToGiveTo.points} points.\n${username} now has ${userToDeductFrom.points} points.`);
            }
        }
    }
});

client.login(auth.token);