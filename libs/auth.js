const jwt = require('jsonwebtoken');
const privateKey = process.env.pKey || 'xyzabcdefghijklmnopqrsuvw12345678';
const auth = {};

// Sign the token with user data and expiration time
auth.sign = (user) => {
    return new Promise((resolve, reject) => {
        let hours = !isNaN(process.env.tokenexpireIn) ? Number(process.env.tokenexpireIn) : 24;
        let expIn = hours * 60 * 60 * 1000; 
        jwt.sign({ exp: Math.floor(Date.now() + expIn), ...user }, privateKey, function (err, token) {
            if (!err) resolve(token);
            else reject(err);
        });
    });
};

// Check if the passwords match and if the status is true (1)
auth.status = (UserPass = '', InputPass = '', statusOf = 0) => {
    return UserPass.trim().toLowerCase() === InputPass.trim().toLowerCase() && Number(statusOf);
};

// Middleware to verify token and add user info to the request
auth.verify = (token) => {
    return new Promise((resolve, reject) => {
        if (!token) {
            return reject({ message: 'No token provided' });  // Handle case where no token is provided
        }

        // Verify the token using jwt.verify
        jwt.verify(token, privateKey, (err, decoded) => {
            if (err) {
                return reject({ message: 'Failed to authenticate token' });  // Handle token verification failure
            } else {
                resolve(decoded);  // Token is valid, return the decoded data
            }
        });
    });
};



// Asynchronous version of token verification
auth.verifyASY = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, privateKey, function (err, decoded) {
            if (err) {
                reject(err); // Reject the promise if verification fails
            } else {
                resolve(decoded); // Resolve the promise with decoded data if verification is successful
            }
        });
    });
};

// Utility to decode the JWT and get user info
auth.getCompanyIdFromToken = (token) => {
    try {
        let base64Url = token.split('.')[1]; // Get the base64-encoded payload from the token
        let base64 = base64Url.replace('-', '+').replace('_', '/');
        let decodedData = JSON.parse(Buffer.from(base64, 'base64').toString('binary'));
        return decodedData; // Return the decoded user data
    } catch (error) {
        return error; // If an error occurs during decoding, return the error
    }
};


// NEW

auth.generateTokens = (user) => {
    return new Promise((resolve, reject) => {
        const accessToken = jwt.sign(
            { ...user, type: 'access' },
            privateKey,
            { expiresIn: '15m' } // Short-lived access token
        );

        const refreshToken = jwt.sign(
            { userId: user.user_id, type: 'refresh' },
            privateKey,
            { expiresIn: '365d' } // Long-lived refresh token
        );

        resolve({ accessToken, refreshToken });
    });
};



module.exports = auth;


// const jwt = require('jsonwebtoken');
// const privateKey = process.env.pKey || 'xyzabcdefghijklmnopqrsuvw12345678'; // Private key for JWT
// const auth = {};

// // Sign the token
// auth.sign = (user) => {
//     return new Promise((resolve, reject) => {
//         let hours = !isNaN(process.env.tokenexpireIn) ? Number(process.env.tokenexpireIn) : 24;
//         let expIn = hours * 60 * 60 * 1000;
//         jwt.sign({ exp: Math.floor(Date.now() + expIn), ...user }, privateKey, function (err, token) {
//             if (!err) resolve(token);
//             else reject(err);
//         });
//     });
// };

// // Middleware to verify token and add user info to the request
// auth.verify = (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

//     if (!token) {
//         return res.status(401).send({ message: 'No token provided' });
//     }

//     // Verify the token
//     jwt.verify(token, privateKey, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({ message: 'Failed to authenticate token' });
//         }

//         // Attach the decoded user data to req.user
//         req.user = decoded;
//         next(); // Proceed to the next middleware or route handler
//     });
// };

// // Utility to decode the JWT and get user info
// auth.getCompanyIdFromToken = (token) => {
//     try {
//         let base64Url = token.split('.')[1];
//         let base64 = base64Url.replace('-', '+').replace('_', '/');
//         let decodedData = JSON.parse(Buffer.from(base64, 'base64').toString('binary'));
//         return decodedData;
//     } catch (error) {
//         return error;
//     }
// };

// module.exports = auth;
