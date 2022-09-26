const moment = require('moment');

module.exports = {
    formatDate: function(date, targetFormat) {
        return moment(date).format(targetFormat);
    },

    radioCheck: function(value, radioValue) {
        if (value === radioValue) {
            return 'checked';
        }
        return '';
    },

    replaceCommas: function(str) {
        if (str != null || str.length !== 0) { // Check for null & empty string
            if (str.trim().length !== 0) {
                // Replace the ',' to '|'. Use pattern-matching string /,/g for ','
                return str.replace(/,/g, ' | ');
            }
        }
        return 'None'; // display 'None' if got no subtitles
    }
};