const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Outfit = db.define('outfit', {
    outfitURL: {
        type: Sequelize.STRING
    },
    fitting: {
        type: Sequelize.INTEGER
    },
    notFitting: {
        type: Sequelize.INTEGER
    },
});

module.exports = Outfit;