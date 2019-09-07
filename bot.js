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
        // const isRiley = username === 'LiquidLuck' ? true : false;

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
            PointsHelper.addPoints(msg, pointsToGive, userPointsToGiveTo, userPointsList);
        }

        if (msg.content === "!rank") {
            const message = RankHelper.rank(userPointsList, userPoints);
            msg.channel.send(message);
        }

        if (msg.content === "!rankAll") {
            const sortedUserPointsList = PointsHelper.sortUserPointsListByPoints(userPointsList);
            const message = RankHelper.createUserPointsRankingMessage(sortedUserPointsList);
            msg.channel.send(message);
        }

        if (msg.content.startsWith("!gift")) {
            const userToGivePointsTo = msg.content.split(" ")[1];
            const pointsToGive = Number(msg.content.split(" ")[2]);
            let userPointsToGiveTo = PointsHelper.findUserInUserPointsList(userPointsList, userToGivePointsTo);
            PointsHelper.giftPoints(msg, pointsToGive, userPointsToGiveTo, username, userPointsList);
        }

        if (msg.content === "!quit" && isSpencer) {
            msg.channel.send("Shutting Down.").then(() => {
                process.exit();
            })
        }
    }
});

client.login(auth.token);