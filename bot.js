const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const Slots = require('./slots/slots');
const DiscordHelper = require('./helpers/discord-helper');
const FileHelper = require('./helpers/file-helper');
const PointsHelper = require('./points/points-helper');
const RankHelper = require('./rank/rank-helper');
const userPointsFilePath = '/../userPoints.json';
const Security = require('./security/security');
const Blackjack = require('./blackjack/blackjack');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const userPointsList = FileHelper.readFile(userPointsFilePath);
    if (userPointsList === undefined || userPointsList === null) {
        PointsHelper.createUserPointsFile(userPointsFilePath);
    }

    this.avoidCancellation = false;
});

client.on('message', msg => {
    try {
        const username = DiscordHelper.getUsername(msg, client);

        if (username !== 'gamble-bot' && msg.content.startsWith("!")) {
            let userPointsList = FileHelper.readFile(userPointsFilePath);
            let userPoints = PointsHelper.findUserInUserPointsList(userPointsList, username);
            const isSpencer = username === 'PoshPrincess7' ? true : false;
            const isWilly = username === 'Gaytor' ? true : false;
            let security = new Security(userPoints);

            if (userPoints === null || userPoints === undefined) {
                userPoints = DiscordHelper.createNewUser(msg, username, userPointsFilePath, userPointsList);
            }

            if (msg.content === '!avoid-being-cancelled' && security.isUserAuthorized('!avoid-being-cancelled')) {
                this.avoidCancellation = true;
                msg.channel.send('I love gay people');
            }

            if (msg.content === '!safe-from-being-cancelled' && security.isUserAuthorized('!safe-from-being-cancelled')) {
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
                let currentDate = new Date().setHours(0, 0, 0, 0);
                if (userPoints.lastDailyPoints === undefined || userPoints.lastDailyPoints !== currentDate) {
                    userPoints = PointsHelper.addDailyPoints(userPoints, msg);
                    userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPoints);
                    FileHelper.writeFile(userPointsList, userPointsFilePath);
                } else {
                    msg.channel.send(`${username}, you have already claimed your daily points.  Try again tomorrow.`);
                }
            }

            if (msg.content.split(" ")[0] === '!add-points' && security.isUserAuthorized('!add-points')) {
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
                const usernameToGivePointsTo = msg.content.split(" ")[1];
                const pointsToGive = Number(msg.content.split(" ")[2]);
                let userPointsToGiveTo = PointsHelper.findUserInUserPointsList(userPointsList, usernameToGivePointsTo);

                if (userPointsToGiveTo === undefined) {
                    msg.channel.send('Not a valid username.');
                } else {
                    PointsHelper.giftPoints(msg, pointsToGive, userPointsToGiveTo, username, userPointsList);
                }

            }

            if (msg.content === "!quit" && security.isUserAuthorized('!quit')) {
                msg.channel.send("Shutting Down.").then(() => {
                    process.exit();
                });
            }

            if (msg.content.startsWith("!help")) {
                let commands = FileHelper.readFile('/../help.json').commands;
                let message = '';
                const pageNumber = msg.content.split(" ")[1];
                const totalPossiblePages = parseInt(commands.length / 4);
                if (pageNumber !== undefined) {
                    if (Number(pageNumber) !== NaN && pageNumber <= totalPossiblePages) {
                        message = `Page Number: ${pageNumber}\n`;

                        for (let i = 0; i < 4; i++) {
                            const commandIndex = i + ((Number(pageNumber) - 1) * 4);
                            const { name, description, usage, example, requireSpecialPermissions } = commands[commandIndex];
                            message = message + `Command: ${name}\nDescription: ${description}\nUsage: ${usage}\nExample: ${example}\n`;
                            message = requireSpecialPermissions ? message + 'This command requires special permissions\n\n' : message + '\n';
                        }

                        msg.channel.send(message);
                    } else if (Number(pageNumber) === totalPossiblePages + 1) {
                        for (let i = 0; i < parseInt(commands.length % 4); i++) {
                            const commandIndex = i + ((Number(pageNumber) - 1) * 4);
                            const { name, description, usage, example, requireSpecialPermissions } = commands[commandIndex];
                            message = message + `Command: ${name}\nDescription: ${description}\nUsage: ${usage}\nExample: ${example}\n`;
                            message = requireSpecialPermissions ? message + 'This command requires special permissions\n\n' : message + '\n';
                        }

                        msg.channel.send(message);
                    } else {
                        msg.channel.send(`Invalid page number.  Total possible pages: ${totalPossiblePages + 1}`);
                    }
                } else {
                    for (let command of commands) {
                        const { name, description, usage, example, requireSpecialPermissions } = command;
                        message = message + `Command: ${name}\nDescription: ${description}\nUsage: ${usage}\nExample: ${example}\n`;
                        message = requireSpecialPermissions ? message + 'This command requires special permissions\n\n' : message + '\n';
                    }

                    msg.channel.send(message);
                }
            }

            // if (msg.content.startsWith("!blackjack")) {
            //     const blackjack = new Blackjack(userPoints);
            //     const command = msg.content.split(" ")[1];
            //     let blackjackResults = blackjack.playBlackjack(command);
            //     let message = blackjackResults.message;
            //     userPoints = blackjackResults.userPoints;
            //
            //     if (userPoints !== undefined && userPoints !== null) {
            //         userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPoints);
            //         FileHelper.writeFile(userPointsList, userPointsFilePath);
            //     }
            //
            //     if (message === '' || message === null || message === undefined) {
            //         message = 'something';
            //     }
            //     msg.channel.send(message);
            // }message
        }
    } catch (err) {
        const date = new Date();
        const timestamp = date.getTime().toString();
        const formatteddatetime = date.toISOString();
        FileHelper.writeFile({ message: err.message, time: formatteddatetime }, `/../logs/error-${timestamp}`)
    }
});

client.login(auth.token);