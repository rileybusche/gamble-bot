const RandomNumber = require('../helpers/random-helper');
const FileHelper = require('../helpers/file-helper');
const NUMBER_OF_CARD_VALUES = 13;
const NUMBER_OF_CARD_SUITS = 4;

class BlackJack {
    static generateRandomCard(cardsToExclude) {
        const suitMap = FileHelper.readFile('/../blackjack/suits.json');
        const randomCardValue = RandomNumber.generateRandomNumberBetweenZeroAndMax(NUMBER_OF_CARD_VALUES);
        const randomCardSuit = RandomNumber.generateRandomNumberBetweenZeroAndMax(NUMBER_OF_CARD_SUITS);
        const selectedSuit = Object.keys(suitMap).find(key => suitMap[key] === randomCardSuit);
        const card = {
            value: randomCardValue,
            suit: selectedSuit
        };
        if (cardsToExclude !== null && cardsToExclude.includes(card)) {
            this.generateRandomCard(cardsToExclude);
        } else {
            return card;
        }
    }

    static generateHand() {
        const firstCard = this.generateRandomCard(null);
        const secondCard = this.generateRandomCard(firstCard);
        const hand = {
            firstCard: firstCard,
            secondCard: secondCard
        };
        return hand;
    }

    static playBlackjack(userPoints) {
        const playersHand = this.generateHand(null);
        const cardsToExclude = [];
        cardsToExclude.push(playersHand);
        console.log(cardsToExclude);
        const dealersHand = this.generateHand(cardsToExclude);
    }
}

module.exports = BlackJack;