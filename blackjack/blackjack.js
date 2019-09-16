const RandomNumber = require('../helpers/random-helper');
const FileHelper = require('../helpers/file-helper');
const NUMBER_OF_CARD_VALUES = 13;
const NUMBER_OF_CARD_SUITS = 4;
const suitMap = FileHelper.readFile('/../blackjack/suits.json');
const faceCardsMap = FileHelper.readFile('/../blackjack/faceCards.json');
const blackjackFilePath = '/../blackjack/blackjackUsers/';

class BlackJack {
    constructor(userPoints) {
        this.userPoints = userPoints;
        this.cardsToExclude = [];
        this.playersHand = [];
        this.dealersHand = [];
    }

    generateRandomCard() {
        let randomCardValue = RandomNumber.generateRandomNumberBetweenMinAndMaxInclusive(2, NUMBER_OF_CARD_VALUES);
        const randomCardSuit = RandomNumber.generateRandomNumberBetweenZeroAndMax(NUMBER_OF_CARD_SUITS);
        const selectedSuit = Object.keys(suitMap).find(key => suitMap[key] === randomCardSuit);
        randomCardValue = randomCardValue > 10 ? faceCardsMap[randomCardValue.toString()] : randomCardValue.toString();
        const card = {
            value: randomCardValue,
            suit: selectedSuit
        };
        if (this.cardsToExclude !== null && this.cardsToExclude !== undefined && this.cardsToExclude.includes(card)) {
            this.generateRandomCard(this.cardsToExclude);
        } else {
            this.cardsToExclude.push(card);
            return card;
        }
    }

    generateHand() {
        const firstCard = this.generateRandomCard();
        const secondCard = this.generateRandomCard();
        return [firstCard, secondCard];
    }

    createHandMessage(hand, forUser) {
        let message = forUser ? `${this.userPoints.username}'s hand:\n` : `Dealer's hand:\n`;
        for (let card of hand) {
            const { value, suit } = card;
            message = `${message}${value} of ${suit}\n`;
        }
        const sum = this.sumCards(hand);
        message = `${message}Total: ${sum}\n\n`
        return message;
    }

    createDealersShowingMessage() {
        const firstValue = this.dealersHand[0].value;
        const firstSuit = this.dealersHand[0].suit;
        const message = `Dealer is showing:\n${firstValue} of ${firstSuit}`;
        return message;
    }

    saveBlackjackToUser(objectToSave) {
        const userPoints = this.userPoints;
        const filePath = `${blackjackFilePath}${userPoints.username}.json`;
        FileHelper.writeFile(objectToSave, filePath);
    }

    readFromBlackjackUser() {
        const filePath = `${blackjackFilePath}${this.userPoints.username}.json`;
        let blackjackUser = FileHelper.readFile(filePath);

        if (blackjackUser === null || blackjackUser === undefined) {
            blackjackUser = this;
        }

        blackjackUser.userPoints = this.userPoints;
        return blackjackUser;
    }

    setState(blackjackUser) {
        this.cardsToExclude = blackjackUser.cardsToExclude;
        this.playersHand = blackjackUser.playersHand;
        this.dealersHand = blackjackUser.dealersHand;
    }

    resetBlackjackGame() {
        this.saveBlackjackToUser(new BlackJack(this.userPoints));
    }

    beginning() {
        this.playersHand = this.generateHand(this.cardsToExclude);
        this.dealersHand = this.generateHand(this.cardsToExclude);
        let userMessage = this.createHandMessage(this.playersHand, true);
        let dealerMessage = this.createDealersShowingMessage(this.dealersHand);
        this.state = 'userMove';
        this.saveBlackjackToUser(this);
        return `${userMessage}\n${dealerMessage}`;
    }

    dealersTurn() {
        this.hit(this.dealersHand);
        const dealerSum = this.sumCards(this.dealersHand);
        if (dealerSum < 17) {
            this.dealersTurn();
        } else {
            return dealerSum;
        }
    }

    playBlackjack(command) {
        const blackjackUser = this.readFromBlackjackUser();
        this.setState(blackjackUser);
        if (blackjackUser.state === undefined) {
            return this.beginning();
        } else if (blackjackUser.state === 'userMove') {
            let message;
            if (command === null || command === undefined) {
                return `You must either type "!blackjack hit" or "!blackjack stay".\n${this.createHandMessage(this.playersHand, true)}`;
            }

            if (command.toLowerCase() === 'hit') {
                message = this.hit(this.playersHand);
            } else if (command.toLowerCase() === 'stay') {
                const dealerSum = this.dealersTurn();
                const userSum = this.sumCards(this.playersHand);
                message = `${this.createHandMessage(this.dealersHand, false)}${this.userPoints.username}'s Total: ${userSum}\n`;
                if (dealerSum <= 21 && dealerSum > userSum) {
                    message = `${message}You lose.`;
                } else if (dealerSum === userSum) {
                    message = `${message}It is a wash.`;
                } else {
                    message = `${message}You win`;
                }

                this.resetBlackjackGame();
            } else {
                return `You must either type "!blackjack hit" or "!blackjack stay".\n${this.createHandMessage(this.playersHand, true)}`;
            }
            this.setState(blackjackUser);
            return message;
        }
    }

    hit(hand) {
        const newCard = this.generateRandomCard();
        hand.push(newCard);
        const sum = this.sumCards(hand);
        let message = '';
        if (sum > 21) {
            message = `${this.createHandMessage(hand, true)}\n${this.userPoints.username}, you have busted. Pussy.`;
            this.resetBlackjackGame();
        } else if (sum === 21) {
            message = `${this.createHandMessage(hand, true)}\n${this.userPoints.username}, blackjack! Pussy.`;
            this.resetBlackjackGame();
        } else {
            message = `${this.createHandMessage(hand, true)}${this.createDealersShowingMessage()}`;
            this.state = 'userMove';
            this.saveBlackjackToUser(this);
        }

        return message;
    }

    sumCards(hand) {
        const convertedHand = this.convertFaceCardsToNumber(hand);
        const values = convertedHand.map(card => card.value);
        this.convertBackToFaceCardNames(hand);
        return values.reduce((total, currentValue) => currentValue > 10 ? Number(total) + 10 : Number(total) + Number(currentValue));
    }

    convertFaceCardsToNumber(hand) {
        for (let card of hand) {
            if (Number.isNaN(Number(card.value))) {
                card.value = Object.keys(faceCardsMap).find(key => faceCardsMap[key] === card.value);
            }
        }

        return hand;
    }

    convertBackToFaceCardNames(hand) {
        for (let card of hand) {
            if (Number(card.value) > 10) {
                card.value = faceCardsMap[card.value.toString()];
            }
        }

        return hand;
    }
}

module.exports = BlackJack;