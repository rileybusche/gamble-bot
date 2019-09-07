class RandomHelper {
    static generateRandomNumberBetweenZeroAndMax(maxNumber) {
        return Math.floor(Math.random() * maxNumber);
    }
}

module.exports = RandomHelper;