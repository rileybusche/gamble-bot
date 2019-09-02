const fs = require('fs');

class FileHelper {
    static writeFile(jsonObject, filePath) {
        const fullFilePath = __dirname + filePath;
        const jsonString = JSON.stringify(jsonObject);

        fs.writeFile(fullFilePath, jsonString, (err) => {
            if (err) {
                console.log(`ERROR: ${err.message}`);
                throw err;
            }

            console.log('File saved!');
            return jsonObject;
        });
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