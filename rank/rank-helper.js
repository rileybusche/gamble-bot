const FileHelper = require('../helpers/file-helper');
const userPointsFilePath = '/../userPoints.json';
const rankDictionaryFilePath = '/../rank/rank-dictionary.json';
const PointsHelper = require('../points/points-helper');

class RankHelper {
    static updateUserRank(userPoints) {
        userPoints = this.calculateUserRank(userPoints);
        return userPoints;
    }

    static calculateUserRank(userPoints) {
        const userPointsRankDictionary = FileHelper.readFile(rankDictionaryFilePath);
        const keys = Object.keys(userPointsRankDictionary);
        for (let key of keys) {
            const rankRange = userPointsRankDictionary[key];
            const points = userPoints.points;

            if (rankRange[1] === undefined && rankRange[0] <= points) {
                userPoints.rank = key;
            } else if (rankRange[0] <= points && rankRange[1] >= points) {
                userPoints.rank = key;
            }
        }

        return userPoints;
    }

    static createUserPointsRankingMessage(sortedUserPointsList) {
        let message = 'Rankings:\n';

        for (let i = 0; i < sortedUserPointsList.length; i++) {
            const currentUser = sortedUserPointsList[i];
            const rank = i + 1;
            message = `${message}${rank}. ${currentUser.username} - ${currentUser.points}\n`;
        }

        return message;
    }

    static rank(userPointsList, userPoints) {
        const rankBefore = userPoints.rank;
        let message;
        userPoints = this.updateUserRank(userPoints);

        if (rankBefore !== undefined && rankBefore !== userPoints.rank) {
            message = `You have changed ranks!\nRank Before: ${rankBefore}\nCurrent Rank: ${userPoints.rank}`;
            userPointsList = PointsHelper.updateUserPointsInUserPointsList(userPointsList, userPoints);
            FileHelper.writeFile(userPointsList, userPointsFilePath);
        } else {
            message = `Current Rank: ${userPoints.rank}`;
        }

        return message;
    }
}

module.exports = RankHelper;