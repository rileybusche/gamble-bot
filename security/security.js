const FileHelper = require('../helpers/file-helper');

class Security {
    static Security(userPoints) {
        this.userPoints = userPoints;
        this.security = FileHelper.readFile('/../security/security.json');
    }

    static isUserAuthorized() {
        console.log(this.security);
    }
}

module.exports = Security;