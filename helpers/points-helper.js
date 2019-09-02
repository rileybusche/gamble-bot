const FileHelper = require('./file-helper');
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
        msg.channel.send(`${username}'s daily points have been added!  Old Points: ${userPoints.points - 500}; Cureent Total: ${userPoints.points}`);
        return userPoints;
    }

    static removePoints(wager, userPoints) {
        userPoints.points = userPoints.points - Number(wager);
        return userPoints;
    }

    static addPoints(pointsWon, userPoints) {
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
        return userPointsList.filter(userPoints => userPoints.username === username)[0];
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
}

module.exports = PointsHelper;