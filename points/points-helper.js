const FileHelper = require('../helpers/file-helper');
const userPointsFilePath = '/../userPoints.json';
const _ = require('lodash');

class PointsHelper {
    static validateWager(wager, userPoints) {
        const isWagerAValidNumber = wager === undefined ? false : !Number.isNaN(Number(wager));
        let userHasFunds;

        if (userPoints.points <= 0 || wager > userPoints.points) {
            userHasFunds = false;
        } else {
            userHasFunds = true;
        }

        const wagerValidation = { isValid: isWagerAValidNumber && userHasFunds, userHasFunds: userHasFunds, isWagerAValidNumber: isWagerAValidNumber };
        return wagerValidation;
    }

    static fuckTheSmartPeople(wager, userPoints, msg) {
        const pointsToRemove = 10 * wager;
        userPoints.points = userPoints.points + pointsToRemove;
        const oldTotal = userPoints.points - pointsToRemove;
        msg.channel.send("I have removed " + pointsToRemove + " points from your account for being a bad boy.  Old Total: " + oldTotal + "; Current Points: " + userPoints.points);
        return userPoints;
    }

    static addDailyPoints(userPoints, msg) {
        const username = userPoints.username;
        userPoints.points = userPoints.points + 500;
        userPoints.lastDailyPoints = new Date().setHours(0, 0, 0, 0);
        msg.channel.send(`${username}'s daily points have been added!\nOld Points: ${userPoints.points - 500}\nCurrent Total: ${userPoints.points}`);
        return userPoints;
    }

    static removePoints(wager, userPoints) {
        userPoints.points = userPoints.points - Number(wager);
        return userPoints;
    }

    static addPointsToUserPoints(pointsWon, userPoints) {
        userPoints.points += pointsWon;
        return userPoints;
    }

    static createUserPointsFile(userPointsFilePath) {
        let userPointsList = [];
        userPointsList = FileHelper.writeFile(userPointsList, userPointsFilePath);

        if (userPointsList !== undefined) {
            console.log("Initial UserPoints.json file was successfully created.");
        } else {
            console.log("Error creating initial UserPoints.json file.");
        }

        return userPointsList;
    }

    static findUserInUserPointsList(userPointsList, username) {
        return userPointsList === null ? null : userPointsList.filter(userPoints => userPoints.username === username)[0];
    }

    static updateUserPointsInUserPointsList(userPointsList, userPoints) {
        const userPointsIndex = userPointsList.findIndex(userPointsItem => _.isEqual(userPoints, userPointsItem));

        if (userPointsIndex >= 0) {
            userPointsList[userPointsIndex] = userPoints;
        } else {
            userPointsList.push(userPoints);
        }

        return userPointsList;
    }

    static sortUserPointsListByPoints(userPointsList) {
        return userPointsList.sort((userPoints1, userPoints2) => userPoints2.points - userPoints1.points);
    }

    static giftPoints(msg, pointsToGive, userPointsToGiveTo, usernameToDeductFrom, userPointsList) {
        let message, sendMessage, userToDeductFrom;
        userToDeductFrom = this.findUserInUserPointsList(userPointsList, usernameToDeductFrom);

        if (Number.isNaN(pointsToGive) || pointsToGive <= 0 || pointsToGive < userToDeductFrom.points) {
            message = `${pointsToGive} is not a valid number. Make sure you have enough points.\n`;
            sendMessage = true;
        }

        if (usernameToDeductFrom === userPointsToGiveTo.username) {
            message = `${message !== undefined ? message : ''}You may not gift points to yourself.\n`;
            sendMessage = true;
        }

        if (sendMessage) {
            msg.channel.send(message);
        } else {
            userPointsToGiveTo = this.addPointsToUserPoints(pointsToGive, userPointsToGiveTo);
            userPointsList = this.updateUserPointsInUserPointsList(userPointsList, userPointsToGiveTo);

            userToDeductFrom = this.removePoints(pointsToGive, userToDeductFrom);
            userPointsList = this.updateUserPointsInUserPointsList(userPointsList, userToDeductFrom);
            FileHelper.writeFile(userPointsList, userPointsFilePath);
            msg.channel.send(`Successfully added ${pointsToGive} points to ${userPointsToGiveTo.username}'s account from ${usernameToDeductFrom}!\n${userPointsToGiveTo.username} now has ${userPointsToGiveTo.points} points.\n${usernameToDeductFrom} now has ${userToDeductFrom.points} points.`);
        }
    }

    static addPoints(msg, pointsToGive, userPointsToGiveTo, userPointsList) {
        let message, sendMessage;

        if (Number.isNaN(pointsToGive)) {
            message = `${pointsToGive} is not a valid number.\n`;
            sendMessage = true;
        }

        if (userPointsToGiveTo === null || userPointsToGiveTo === undefined) {
            message = message !== undefined ? `${message}${userToGivePointsTo} is not a valid username.` : `${userToGivePointsTo} is not a valid username.`;
            sendMessage = true;
        }

        if (sendMessage) {
            msg.channel.send(message);
        } else {
            userPointsToGiveTo = this.addPointsToUserPoints(pointsToGive, userPointsToGiveTo);
            userPointsList = this.updateUserPointsInUserPointsList(userPointsList, userPointsToGiveTo);
            FileHelper.writeFile(userPointsList, userPointsFilePath);
            msg.channel.send(`Successfully added ${pointsToGive} points to ${userPointsToGiveTo.username}'s account!`);
        }
    }
}

module.exports = PointsHelper;