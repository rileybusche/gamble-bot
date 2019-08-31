const fs = require('fs');

class FileHelper {
    static writeFileToUserPoints(jsonObject, username) {
        const filePath = __dirname + '/../userPoints/' + username + '.json';
        const jsonString = JSON.stringify(jsonObject);

        fs.writeFile(filePath, jsonString, (err) => {
            if (err) throw err;

            console.log('File saved!');
        });
    }

    static readFileFromUserPoints(username) {
        const filePath = __dirname + '/../userPoints/' + username + '.json';

        try {
            return JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));
        } catch (err) {
            return null;
        }
    }

    static readFile(filePath) {
        filePath = __dirname + filePath;

        try {
            return JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));
        } catch (err) {
            return null;
        }
    }
}

module.exports = FileHelper;