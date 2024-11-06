const jwt = require('jsonwebtoken');

const validateBasicAuth = (username, password) => {
    const credentialsList = process.env.SERVICE_AUTH_LIST.split(';'); // Assuming credentials are separated by semicolons

    // Check if the provided credentials match any of the valid credentials
    const isValidCredential = credentialsList.some(credential => {
        const [validUsername, validPassword] = credential.split(':');
        return username === validUsername && password === validPassword;
    });

    return isValidCredential;
};

const advanceAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const authComponents = authHeader.split('<;>'); // Split the Authorization header by the custom delimiter

        // Check for Basic Authentication
        const basicAuth = authComponents.find(header => header.trim().startsWith('Basic'));
        if (basicAuth) {
            const credentials = Buffer.from(basicAuth.split(' ')[1], 'base64').toString().split(':');
            const username = credentials[0];
            const password = credentials[1];

            if (!validateBasicAuth(username, password)) {
                return res.status(401).json({ message: 'Authentication failed' }); 
            }
        } else {
            return res.status(401).json({ message: 'Authentication failed' }); 
        }

        // Check for Bearer Token Authentication
        const bearerToken = authComponents[1];
        if (bearerToken) {
            const token = bearerToken;

            jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                  if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Token has expired' });
                  }
                  return res.status(401).json({ message: 'Failed to authenticate token' });
                }
                // If the token is valid and not expired
                req.user = decoded; // Attach decoded user info to request object
                next(); // Proceed to next middleware or route handler
            });
        } else {
            return res.status(401).json({ message: 'Authentication failed' }); 
        }
    } else {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = advanceAuth;