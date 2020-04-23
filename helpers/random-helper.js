class RandomHelper {
    static generateRandomNumberBetweenZeroAndMax(maxNumber) {
        return Math.floor(Math.random() * maxNumber);
    }

    static generateRandomNumberBetweenMinAndMaxInclusive(minNumber, maxNumber) {
        const numberOfPossibleResults = maxNumber - minNumber + 1;
        if (numberOfPossibleResults <= 0) {
            return null;
        } else {
            return Math.floor(Math.random() * numberOfPossibleResults) + minNumber;
        }

    }
}

module.exports = RandomHelper;