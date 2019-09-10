const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const Slots = require('./slots/slots');
const DiscordHelper = require('./helpers/discord-helper');
const FileHelper = require('./helpers/file-helper');
const PointsHelper = require('./points/points-helper');
const RankHelper = require('./rank/rank-helper');
const userPointsFilePath = '/../userPoints.json';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const userPointsList = FileHelper.readFile(userPointsFilePath);
    if (userPointsList === undefined || userPointsList === null) {
        PointsHelper.createUserPointsFile(userPointsFilePath);
    }

    this.avoidCancellation = false;
});

client.on('message', msg => {
    const username = DiscordHelper.getUsername(msg, client);

    if (username !== 'gamble-bot' && msg.content.startsWith("!")) {
        let userPointsList = FileHelper.readFile(userPointsFilePath);
        let userPoints = PointsHelper.findUserInUserPointsList(userPointsList, username);
        const isSpencer = username === 'PoshPrincess7' ? true : false;
        const isWilly = username === 'Gaytor' ? true : false;

        if (userPoints === null || userPoints === undefined) {
            userPoints = DiscordHelper.createNewUser(msg, username, userPointsFilePath, userPointsList);
        }

        if (msg.content === '!avoid-being-cancelled' && isSpencer) {
            this.avoidCancellation = true;
            msg.channel.send('I love Gay people');
        }

        if (msg.content === '!safe-from-being-cancelled' && isWilly) {
            this.avoidCancellation = false;
            msg.channel.send('Successfully avoided being cancelled');
        }

        if (msg.content.startsWith('!slots')) {
            const selectedEmojiMapPath = this.avoidCancellation && (isWilly) ? './support-gays.json' : './emoji-map.json';
            userPoints = Slots.startSlots(msg, userPoints, selectedEmojiMapPath);
            userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPoints);
            FileHelper.writeFile(userPointsList, userPointsFilePath);
        }

        if (msg.content === '!points') {
            msg.channel.send(`${username} has ${userPoints.points} total`);
        }

        if (msg.content === '!daily-points') {
            if (userPoints.lastDailyPoints === undefined || userPoints.lastDailyPoints !== new Date().setHours(0, 0, 0, 0)) {
                userPoints = PointsHelper.addDailyPoints(userPoints, msg);
                userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPoints);
                FileHelper.writeFile(userPointsList, userPointsFilePath);
            } else {
                msg.channel.send(`${username}, you have already claimed your daily points.  Try again tomorrow.`);
            }
        }

        if (msg.content.split(" ")[0] === '!add-points' && isSpencer) {
            const userToGivePointsTo = msg.content.split(" ")[1];
            const pointsToGive = Number(msg.content.split(" ")[2]);
            const userPointsToGiveTo = PointsHelper.findUserInUserPointsList(userPointsList, userToGivePointsTo);
            PointsHelper.addPoints(msg, pointsToGive, userPointsToGiveTo, userPointsList);
        }

        if (msg.content === "!rank") {
            const message = RankHelper.rank(userPointsList, userPoints);
            msg.channel.send(message);
        }

        if (msg.content === "!rank-all") {
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