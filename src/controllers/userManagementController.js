const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt');
const isValidInput = require('./validateController');
const { pool } = require('../db-settings');
const currentTimeFormatted = require('./validateController');

const register = async (req, res) => {
    const data = req.body.data;
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(data, process.env.ACCESS_TOKEN_SECRET);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    // Role 1 = User, Role 2 = Admin, Role 3 = Super Admin
    decryptedData.role = '1';
    decryptedData.password = await hashPassword(decryptedData.password);
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

    const login_type = decryptedData.login_type === 'email' ? 'email' : decryptedData.login_type + '-ad';
    decryptedData.login_type = login_type;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction(); 
    
        // Insert data into the database
        const query = 'INSERT INTO user_managements (username, password, email, role, location, login_type, created_at, updated_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [decryptedData.username, decryptedData.password, decryptedData.email, decryptedData.role, decryptedData.location, decryptedData.login_type, decryptedData.created_at, decryptedData.updated_at, decryptedData.last_login]; // Assuming these variables are defined and sanitized
    
        const [result] = await connection.query(query, values);
    
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(401).json({ message: 'Error inserting data' });
        }
    
        await connection.commit();
        // console.log(decryptedData)
    
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

const login = async (req, res) => {
    const { param1, param2 } = req.body;
    const username = param1;
    const password = param2;

    try {
        // Check if the user exists in the database
        const [rows] = await pool.query('SELECT * FROM user_managements WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = rows[0];

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await verifyPassword(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // // Generate JWT token
        // const token = generateTokens(user);

        // Send the token back to the client
        return res.status(200).json({ message: "OK", data: { email: user.email, role: user.role, location: user.location } });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const hashPassword = async (plainPassword) => {
    const saltRounds = 10; // Number of salt rounds, higher is more secure but slower
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
}

const verifyPassword = async (plainPassword, hashedPassword) => {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
}

const checkDupUsername = (username) => {
    return new Promise(async (resolve) => {
        try {
            const [rows] = await pool.query('SELECT * FROM user_managements WHERE username = ?', [username]);
            resolve(rows.length);
        } catch (error) {
            console.log(error);
            resolve(null);
        }
    });
}

const getUserIdFromEmail = async (params) => {
    return new Promise(async (resolve) => {
        const email = params.email;
        try {
        const sql = 'SELECT id FROM user_managements WHERE email = ?';
        const [rows] = await pool.query(sql, [email]);
        if (rows.length === 0) {
            resolve(null);
        } else {
            resolve(rows[0].id);
        }
        } catch (error) {
        console.error(error);
        resolve(null);
        }
    });
}


module.exports = {
    register,
    login,
    getUserIdFromEmail
}