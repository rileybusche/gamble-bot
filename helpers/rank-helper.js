const FileHelper = require('./file-helper');
const userPointsFilePath = '/../userPoints.json';
const rankDictionaryFilePath = '/../rank-dictionary.json';

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
}

module.exports = RankHelper;