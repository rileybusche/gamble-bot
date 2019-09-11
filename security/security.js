const FileHelper = require('../helpers/file-helper');

class Security {
    constructor(userPoints) {
        this.userPoints = userPoints;
        this.security = FileHelper.readFile('/../security/security.json');
    }

    isUserAuthorized(command) {
        const username = this.userPoints.username;
        const permissionsDictionary = this.security[username];
        if (permissionsDictionary !== undefined) {
            return permissionsDictionary[command] !== undefined ? true : false;
        } else {
            return false;
        }
    }
}

module.exports = Security;