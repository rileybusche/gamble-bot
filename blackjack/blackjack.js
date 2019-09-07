const RandomNumber = require('../helpers/random-helper');
const NUMBER_OF_CARD_VALUES = 13;
const NUMBER_OF_CARD_SUITS = 4;

class BlackJack {
    static generateRandomCard() {
        const randomCardValue = RandomNumber.generateRandomNumberBetweenZeroAndMax(NUMBER_OF_CARD_VALUES);
        const randomCardSuit = RandomNumber.generateRandomNumberBetweenZeroAndMax(NUMBER_OF_CARD_SUITS);
    }
}