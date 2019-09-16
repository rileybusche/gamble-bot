const RandomNumber = require('../helpers/random-helper');
const FileHelper = require('../helpers/file-helper');
const NUMBER_OF_CARD_VALUES = 13;
const NUMBER_OF_CARD_SUITS = 4;

class BlackJack {
    constructor(userPoints) {
        this.userPoints = userPoints;
        this.cardsToExclude = [];
        this.playersHand = [];
        this.dealersHand = [];
    }

    generateRandomCard() {
        const suitMap = FileHelper.readFile('/../blackjack/suits.json');
        const randomCardValue = RandomNumber.generateRandomNumberBetweenZeroAndMax(NUMBER_OF_CARD_VALUES);
        const randomCardSuit = RandomNumber.generateRandomNumberBetweenZeroAndMax(NUMBER_OF_CARD_SUITS);
        const selectedSuit = Object.keys(suitMap).find(key => suitMap[key] === randomCardSuit);
        const card = {
            value: randomCardValue,
            suit: selectedSuit
        };
        if (this.cardsToExclude !== null && this.cardsToExclude !== undefined && this.cardsToExclude.includes(card)) {
            this.generateRandomCard(this.cardsToExclude);
        } else {
            return card;
        }
    }

    generateHand() {
        const firstCard = this.generateRandomCard(this.cardsToExclude);
        this.cardsToExclude.push(firstCard);
        const secondCard = this.generateRandomCard(this.cardsToExclude);
        this.cardsToExclude.push(secondCard);
        return [firstCard, secondCard];
    }

    createUserHandMessage() {
        const firstValue = this.playersHand[0].value;
        const firstSuit = this.playersHand[0].suit;
        const secondValue = this.playersHand[1].value;
        const secondSuit = this.playersHand[1].suit;
        const message = `${this.userPoints.username}'s hand:\n${firstValue} of ${firstSuit}\n${secondValue} of ${secondSuit}`;
        return message;
    }

    createDealersShowingMessage() {
        const firstValue = this.dealersHand[0].value;
        const firstSuit = this.dealersHand[0].suit;
        const message = `Dealer is showing:\n${firstValue} of ${firstSuit}`;
        return message;
    }

    playBlackjack() {
        this.playersHand = this.generateHand(this.cardsToExclude);
        this.dealersHand = this.generateHand(this.cardsToExclude);
        let userMessage = this.createUserHandMessage(this.playersHand);
        let dealerMessage = this.createDealersShowingMessage(this.dealersHand);
        return `${userMessage}\n\n${dealerMessage}`;
    }
}

module.exports = BlackJack;