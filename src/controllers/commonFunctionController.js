const getTimeFormatted = (data) => {
    // Create a new Date object
    const date = new Date(data);

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

module.exports = {
    getTimeFormatted
}