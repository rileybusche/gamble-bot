const RandomNumber = require('../helpers/random-helper');
const FileHelper = require('../helpers/file-helper');
const PointsHelper = require('../points/points-helper');
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
        this.wager = null;
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
        this.setState(blackjackUser);
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
        console.log('before generating hands');
        this.playersHand = this.generateHand(this.cardsToExclude);
        this.dealersHand = this.generateHand(this.cardsToExclude);
        let userMessage = this.createHandMessage(this.playersHand, true);
        let dealerMessage = this.createDealersShowingMessage(this.dealersHand);
        console.log('here');
        this.state = 'userMove';
        this.saveBlackjackToUser(this);
        console.log(userMessage);
        return `${userMessage}\n${dealerMessage}`;
    }

    dealersTurn() {
        const dealerSum = this.sumCards(this.dealersHand);
        if (dealerSum < 17) {
            this.hit(this.dealersHand);
            this.dealersTurn();
        } else {
            return dealerSum;
        }
    }

    playBlackjack(command) {
        const blackjackUser = this.readFromBlackjackUser();
        const firstTime = blackjackUser ? true : false;
        console.log(firstTime);

        if (blackjackUser.state === undefined) {
            const wagerValidation = PointsHelper.validateWager(command, this.userPoints);

            if (wagerValidation.isValid) {
                this.wager = parseInt(Number(command));
                return this.beginning();
            } else {
                console.log('not valid');
                return `You must submit a valid wager to start a game of Blackjack.\nEx: !blackjack 50`;
            }

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
                let isWinner = false;

                message = `${this.createHandMessage(this.dealersHand, false)}${this.userPoints.username}'s Total: ${userSum}\n`;
                if (dealerSum <= 21 && dealerSum > userSum) {
                    message = `${message}You lost ${this.wager} points.\nYou now have ${this.userPoints.points - this.wager} points.`;
                } else if (dealerSum === userSum) {
                    message = `${message}It is a wash.`;
                } else {
                    message = `${message}You win ${this.wager} points.\n You now have ${this.userPoints.points + this.wager} points.`;
                    isWinner = true;
                }

                if (isWinner) {
                    this.userPoints = PointsHelper.addPointsToUserPoints(this.wager, this.userPoints);
                } else {
                    this.userPoints = PointsHelper.removePoints(this.wager, this.userPoints);
                }
                this.resetBlackjackGame();
                console.log(JSON.stringify(this));
                return { message: message, userPoints: this.userPoints };
            } else {
                return `You must either type "!blackjack hit" or "!blackjack stay".\n${this.createHandMessage(this.playersHand, true)}`;
            }
        }
    }


    //SPENCER TO DO: Make this only update the hand and leave something else to check the sum
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
        const values = convertedHand.map(card => card.value > 10 ? 10 : card.value);
        this.convertBackToFaceCardNames(hand);
        return values.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue));
    }

    convertFaceCardsToNumber(hand) {
        for (let card of hand) {
            if (Number.isNaN(Number(card.value))) {
                card.value = Object.keys(faceCardsMap).find(key => faceCardsMap[key] === card.value);
                console.log(card.value);
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