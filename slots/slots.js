const emojisMap = require('../emoji-map.json').emojis;
const PointsHelper = require('../helpers/points-helper');
const FileHelper = require('../helpers/file-helper');

class Slots {
    static getEmojiMap() {
        return emojisMap;
    }

    static getEmojiCode(emojiName) {
        return emojisMap[emojiName] !== undefined ? emojisMap[emojiName] : "Emoji is not currently supported.";
    }

    static mapToArray(map) {
        return Object.keys(map).map(function(key) {
            return map[key];
        });
    }

    static generateRandomEmoji() {
        const randomNumber = Math.floor(Math.random() * Object.keys(emojisMap).length);
        const emojiCodeArray = this.mapToArray(emojisMap);

        return emojiCodeArray[randomNumber];
    }

    static generateRandomEmojiRow(rowLength) {
        const emojiArray = [];

        while (emojiArray.length < rowLength) {
            emojiArray.push(this.generateRandomEmoji());
        }

        return emojiArray;
    }

    static checkIfAllInArrayAreSame(slotsItemArrayToCheck) {
        return slotsItemArrayToCheck.every(item => item === slotsItemArrayToCheck[0]);
    }

    static getColumnFrom2DArray(twoDArray, columnIndex) {
        const results = twoDArray.map(
            function(value) {
                return value[columnIndex];
            }
        );

        return results;
    }


    // Both of these assume n x n matrix
    static getNegativeSlopeDiagonal(twoDArray) {
        const diagonal = [];

        for (var i = 0; i < twoDArray.length; i++) {
            diagonal.push(twoDArray[i][i]);
        }

        return diagonal;
    }

    static getPositiveSlopeDiagonal(twoDArray) {
        const diagonal = [];

        for (var i = 0; i < twoDArray.length; i++) {
            diagonal.push(twoDArray[twoDArray.length - 1 - i][i]);
        }

        return diagonal;
    }

    static calculateWinnings(slotsGame, numberOfRows, wager) {
        let points = 0;
        let playerCurrency = {
            points: 0,
            pointsWon: 0
        };

        for (const slotsGameRow of slotsGame) {
            const isEachItemInRowEqual = this.checkIfAllInArrayAreSame(slotsGameRow);

            if (isEachItemInRowEqual) {
                points += 2;
            }
        }

        for (var i = 0; i < numberOfRows; i++) {
            const column = this.getColumnFrom2DArray(slotsGame, i);
            const isEachItemInColumnEqual = this.checkIfAllInArrayAreSame(column);

            if (isEachItemInColumnEqual) {
                points += 2;
            }
        }

        const negativeSlopeDiagonal = this.getNegativeSlopeDiagonal(slotsGame);
        const isEachItemInNegativeSlopeDiagonalEqual = this.checkIfAllInArrayAreSame(negativeSlopeDiagonal);

        if (isEachItemInNegativeSlopeDiagonalEqual) {
            points += 5;
        }

        const positiveSlopeDiagonal = this.getPositiveSlopeDiagonal(slotsGame);
        const isEachItemInPositiveSlopeDiagonalEqual = this.checkIfAllInArrayAreSame(positiveSlopeDiagonal);

        if (isEachItemInPositiveSlopeDiagonalEqual) {
            points += 5;
        }
        points = points * wager;

        playerCurrency.points += points;
        playerCurrency.pointsWon = points;

        return playerCurrency;
    }

    static play(username, userPoints, wager) {
        const emojiRowsAsArrays = [];
        const emojiRowsAsStrings = [];

        // Ensure an n x n matrix
        const numberOfRowsToGenerate = 3;
        const numberOfItemsInRow = numberOfRowsToGenerate;

        while (emojiRowsAsArrays.length < numberOfRowsToGenerate) {
            const emojiRow = this.generateRandomEmojiRow(numberOfItemsInRow);
            emojiRowsAsArrays.push(emojiRow);
            emojiRowsAsStrings.push(emojiRow.join("") + "\n");
        }

        const playerCurrency = this.calculateWinnings(emojiRowsAsArrays, numberOfRowsToGenerate, wager);

        const pointsWon = playerCurrency.pointsWon;
        const isWinner = pointsWon > 0 ? true : false;
        const message = isWinner ? `${username} has won ` + pointsWon + ` points and now has ${userPoints.points + pointsWon} points total!` : `${username} is a loser! Old Total: ${userPoints.points} points; New Total: ${userPoints.points - wager}`;

        const results = {
            "game": emojiRowsAsStrings.join(""),
            "message": message,
            "pointsWon": pointsWon,
            "isWinner": isWinner
        };

        return results;
    }

    static startSlots(msg, userPoints) {
        const username = userPoints.username;
        let wager = msg.content.split(" ")[1];
        let wagerValidation = PointsHelper.validateWager(wager, userPoints);
        wager = parseInt(Number(wager));

        if (!wagerValidation.userHasFunds) {
            msg.channel.send("You do not have enough funds to make this bet. Current Total: " + userPoints.points);
        }

        if (wager < 0) {
            PointsHelper.fuckTheSmartPeople(wager, userPoints, msg);
            wagerValidation.isValid = false;
        } else if (Number(wager) === 0) {
            msg.channel.send("Please bet more than 0!");
        }

        if (wagerValidation.isValid) {
            msg.channel.send("Wager is valid! " + username + " has wagered " + wager + " points.");

            const slotsGameResults = Slots.play(username, userPoints, wager);
            const message = `Points ${slotsGameResults.isWinner ? "Earned" : "Lost"}: ${slotsGameResults.isWinner ? slotsGameResults.pointsWon : wager}` + "\n" + slotsGameResults.game + "\n" + slotsGameResults.message;

            if (slotsGameResults.isWinner) {
                userPoints = PointsHelper.addPoints(slotsGameResults.pointsWon, userPoints);
            } else {
                userPoints = PointsHelper.removePoints(wager, userPoints);
            }

            FileHelper.writeFileToUserPoints(userPoints, username);
            msg.channel.send(message);
        }

        if (!wagerValidation.isWagerAValidNumber) {
            msg.channel.send("That is not a valid wager.  Syntax (How to bet 7000 points): !slots 7000");
        }
    }
}

module.exports = Slots;