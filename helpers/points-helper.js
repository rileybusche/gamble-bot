const FileHelper = require('./file-helper');

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
        FileHelper.writeFileToUserPoints(userPoints);
        const oldTotal = userPoints.points - pointsToRemove;
        msg.channel.send("I have removed " + pointsToRemove + " points from your account for being a bad boy.  Old Total: " + oldTotal + "; Current Points: " + userPoints.points);
    }

    static addDailyPoints(userPoints, msg) {
        const username = userPoints.username;
        userPoints.points = userPoints.points + 500;
        userPoints.lastDailyPoints = new Date().setHours(0, 0, 0, 0);
        FileHelper.writeFileToUserPoints(userPoints, username);
        msg.channel.send(`${username}'s daily points have been added!  Old Points: ${userPoints.points - 500}; Cureent Total: ${userPoints.points}`);
    }

    static removePoints(wager, userPoints) {
        userPoints.points = userPoints.points - Number(wager);
        return userPoints;
    }

    static addPoints(pointsWon, userPoints) {
        userPoints.points += pointsWon;
        return userPoints;
    }
}

module.exports = PointsHelper;