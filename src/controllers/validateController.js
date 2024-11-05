const isValidInput = (data) => {
    // Include Thai characters by adding the Unicode range \u0E00-\u0E7F
    const allowedPattern = /^[a-zA-Z0-9_@.!: \u0E00-\u0E7F-]*$/;
    const containsDoubleHyphen = /--/.test(data); 
    return allowedPattern.test(data) && !containsDoubleHyphen;
}

const currentTimeFormatted = () => {
    // Create a new Date object
    const date = new Date();

    // Define options for formatting
    const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok'
    };

    // Format the date using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedDateParts = formatter.formatToParts(date);
    const formattedTime = formattedDateParts[4].value + '-' + formattedDateParts[0].value + '-' + formattedDateParts[2].value + ' ' + 
                        formattedDateParts[6] .value+ ':' + formattedDateParts[8].value + ':' + formattedDateParts[10].value
    
    return formattedTime;
}

module.exports = isValidInput
module.exports = currentTimeFormatted