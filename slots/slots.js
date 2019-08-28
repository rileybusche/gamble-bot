const emojisMap = require('../emoji-map.json').emojis;

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

    static calculateWinnings(slotsGame, numberOfRows, username) {
        let points = 0;
        let playerCurrency = {
            points: 0,
            pointsWon: 0
        };

        for (const slotsGameRow of slotsGame) {
            const isEachItemInRowEqual = this.checkIfAllInArrayAreSame(slotsGameRow);

            if (isEachItemInRowEqual) {
                points += 100;
            }
        }

        for (var i = 0; i < numberOfRows; i++) {
            const column = this.getColumnFrom2DArray(slotsGame, i);
            const isEachItemInColumnEqual = this.checkIfAllInArrayAreSame(column);

            if (isEachItemInColumnEqual) {
                points += 100;
            }
        }

        const negativeSlopeDiagonal = this.getNegativeSlopeDiagonal(slotsGame);
        const isEachItemInNegativeSlopeDiagonalEqual = this.checkIfAllInArrayAreSame(negativeSlopeDiagonal);

        if (isEachItemInNegativeSlopeDiagonalEqual) {
            points += 200;
        }

        const positiveSlopeDiagonal = this.getPositiveSlopeDiagonal(slotsGame);
        const isEachItemInPositiveSlopeDiagonalEqual = this.checkIfAllInArrayAreSame(positiveSlopeDiagonal);

        if (isEachItemInPositiveSlopeDiagonalEqual) {
            points += 200;
        }

        playerCurrency.points += points;
        playerCurrency.pointsWon = points;

        return playerCurrency;
    }

    static play(username, userPoints) {
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

        const playerCurrency = this.calculateWinnings(emojiRowsAsArrays, numberOfRowsToGenerate, username);

        const pointsWon = playerCurrency.pointsWon;
        const message = pointsWon > 0 ? `${username} has won ` + pointsWon + ` points and now has ${userPoints.points + pointsWon} points total!` : `${username} is a loser and has ${userPoints.points} points total.`;

        const results = {
            "game": emojiRowsAsStrings.join(""),
            "message": message,
            "pointsWon": pointsWon
        };

        return results;
    }
}

module.exports = Slots;