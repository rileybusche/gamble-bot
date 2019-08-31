const Axios = require('axios');

class Alert {
    static getFreeGamesCollectionWebPage() {
        Axios.get('https://www.epicgames.com/store/en-US/collection/free-games-collection')
            .then(function(response) {
                console.log(response);
            });
    }
}

module.exports = Alert;