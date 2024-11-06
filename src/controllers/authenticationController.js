const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt');
const isValidInput = require('./validateController');
const { pool } = require('../db-settings');
const currentTimeFormatted = require('./validateController');
const { getTimeFormatted } = require('./commonFunctionController');


// Function to handle decryption and validation securely
const decryptDataWithSecret = (data, secret) => {
    try {
        // Decrypt the data
        const bytes = CryptoJS.AES.decrypt(data, secret);
        
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        return decryptedData;
    } catch (error) {
        // Handle and log error securely
        console.error('Error during data decryption or validation:', error.message);
        throw new Error('Invalid request data');
    }
}

const login = async (req, res) => {

    const data = req.body.data;
    const decryptedData = decryptDataWithSecret(data, process.env.ACCESS_TOKEN_SECRET);
    const login_type = 'email';
    const { email, password } = decryptedData;
    const username = email;

    try {
        // Check if the user exists in the database
        const [rows] = await pool.query('SELECT * FROM user_managements WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = rows[0];

        // Check if the account is locked
        if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
            const lockedUntil = getTimeFormatted(user.account_locked_until);
            return res.status(403).json({ message: `Account is temporarily locked. Please try again later. ${lockedUntil}` });
        }

        if (login_type === 'email' && user.login_type === 'email') {

            // Compare the provided password with the hashed password stored in the database
            const passwordMatch = await verifyPassword(password, user.password);
            if (!passwordMatch) {
                let newFailedAttempts = user.failed_login + 1;
                newFailedAttempts = isNaN(newFailedAttempts) ? 1 : newFailedAttempts;

                await pool.query('UPDATE user_managements SET failed_login = ? WHERE id = ?', [newFailedAttempts, user.id]);

                if (newFailedAttempts >= 3) {
                    await pool.query('UPDATE user_managements SET account_locked_until = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?', [user.id]);
                    return res.status(403).json({ message: 'Account locked due to multiple failed login attempts. Please try again after 1 hour.' });
                }
                return res.status(401).json({ message: `Invalid username or password, Fail: ${newFailedAttempts} times and Account will be locked after 3 times` });
            }

            // Reset failed login attempts on successful login
            await pool.query('UPDATE user_managements SET failed_login = 0, account_locked_until = NULL WHERE id = ?', [user.id]);
        } else if (login_type === 'scg-ad' && user.login_type === 'scg-ad') {

            // Single sign-on
            const sso_response = decryptedData.sso_response;
            if (!sso_response) {
                return res.status(401).json({ message: 'Invalid username or password from SSO' });
            }
        } else {
            // Handle case where `login_type` flags do not match
            return res.status(401).json({ message: 'Invalid username or password not matching' });
        }

        // Generate JWT token
        const token = generateTokens(user);

        // Send the token back to the client
        return res.json({ message: "OK", token: token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const register = async (req, res) => {
    const data = req.body.data;
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(data, process.env.ACCESS_TOKEN_SECRET);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    // Role 1 = User, Role 2 = Admin, Role 3 = Super Admin
    decryptedData.role = '1';
    if (decryptedData.login_type === 'email') {
        decryptedData.password = await hashPassword(decryptedData.password);
    }
    const isSingleSignOn = decryptedData.login_type === 'email' ? 'email' : 'scg-ad';

    decryptedData.created_at = currentTimeFormatted();
    decryptedData.updated_at = currentTimeFormatted();
    decryptedData.last_login = currentTimeFormatted();

    const requiredFields = ['username', 'password', 'email', 'role', 'location'];
    for (const field of requiredFields) {
        if (!(field in decryptedData)) {
            return res.status(400).json({ message: 'Invalid key' });
        }
    }

    for (const key in decryptedData) {
        if (!isValidInput(decryptedData[key])) {
            return res.status(400).json({ message: 'Invalid Parameter' });
        }
    }

    const resultCheck = await checkDupUsername(decryptedData.username);
    if (resultCheck > 0) {
        return res.status(400).json({ message: 'Invalid username already exist' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction(); 
    
        // Insert data into the database
        const query = 'INSERT INTO user_managements (username, password, email, role, location, created_at, updated_at, last_login, login_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [decryptedData.username, decryptedData.password, decryptedData.email, decryptedData.role, decryptedData.location, decryptedData.created_at, decryptedData.updated_at, decryptedData.last_login, isSingleSignOn]; // Assuming these variables are defined and sanitized
    
        const [result] = await connection.query(query, values);
    
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(401).json({ message: 'Error inserting data' });
        }
    
        await connection.commit();
    
        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.log('Register error:', error);
        if (connection) {
            await connection.rollback();
        }
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
    
};

const checkDupUsername = (username) => {
    return new Promise(async (resolve) => {
        try {
            const [rows] = await pool.query('SELECT * FROM user_managements WHERE username = ?', [username]);
            resolve(rows.length);
        } catch (error) {
            resolve(null);
        }
    });
}

const hashPassword = async (plainPassword) => {
    const saltRounds = 10; // Number of salt rounds, higher is more secure but slower
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
}

const verifyPassword = async (plainPassword, hashedPassword) => {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
}


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split('<;>')[1]; // Extract token from Authorization header
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(401).json({ message: 'Failed to authenticate token' });
      }
      
      // If the token is valid and not expired
      req.user = decoded; // Attach decoded user info to request object
    //   next(); // Proceed to next middleware or route handler
      return res.status(200).json({ message: 'Token is valid' });
    });
};

const regenerateTokenExpire = (req, res) => {
    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
  
    // Verify refresh token
    jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
  
      // Generate new access token
      const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  
      return res.json({ message: "OK", accessToken: accessToken });
    });
  };

const generateTokens = (user) => {
    const isSingleSignOn = user.login_type === 'email' ? false : true;
    const accessToken = jwt.sign({ userId: user.id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
    const username = user.username;
    return { accessToken, refreshToken, isSingleSignOn, username };
};

module.exports = {
    login,
    register,
    verifyToken,
    regenerateTokenExpire
}