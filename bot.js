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
    const username = DiscordHelper.getUsername(msg, client);
    let userPoints = FileHelper.readFileFromUserPoints(username);

    if (userPoints === null) {
        userPoints = {
            username: username,
            points: 5000
        };

        msg.channel.send(`Welcome, ${username}! I have started you at 5000 points.`)
        FileHelper.writeFileToUserPoints(userPoints, username);
    }

    if (msg.content.startsWith('!slots')) {
        const wager = msg.content.split(" ")[1];
        var wagerIsValid = wager === undefined ? false : !Number.isNaN(Number(wager));
        let userHasFunds = false;

        if (userPoints.points <= 0 || wager > userPoints.points) {
            msg.channel.send("You do not have enough funds to play this game. Current Total: " + userPoints.points);
        } else {
            userHasFunds = true;
        }

        if (wager < 0) {
            const pointsToRemove = 10 * wager;
            userPoints.points = userPoints.points + pointsToRemove;
            FileHelper.writeFileToUserPoints(userPoints, username);
            const oldTotal = userPoints.points - pointsToRemove;
            msg.channel.send("I have removed " + pointsToRemove + " points from your account for being a bad boy.  Old Total: " + oldTotal + "; Current Points: " + userPoints.points);
            wagerIsValid = false;
        } else if (Number(wager) === 0) {
            msg.channel.send("Please bet more than 0!");
        }

        if (wagerIsValid && userHasFunds) {
            msg.channel.send("Wager is valid! " + username + " has wagered " + wager + " points.");

            const slotsGameResults = Slots.play(username, userPoints, wager);
            const message = `Points ${slotsGameResults.isWinner ? "Earned" : "Lost"}: ${slotsGameResults.isWinner ? slotsGameResults.pointsWon : wager}` + "\n" + slotsGameResults.game + "\n" + slotsGameResults.message;

            slotsGameResults.isWinner ? userPoints.points += slotsGameResults.pointsWon : userPoints.points = userPoints.points - Number(wager);

            FileHelper.writeFileToUserPoints(userPoints, username);
            msg.channel.send(message);
        }

        if (!wagerIsValid) {
            msg.channel.send("That is not a valid wager.  Syntax (How to bet 7000 points): !slots 7000");
        }
    }

    if (msg.content === '!points') {
        msg.channel.send(`${username} has ${userPoints.points} total`);
    }
});

client.login(auth.token);