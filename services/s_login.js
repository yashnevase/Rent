const auth = require('../libs/auth');
const lib = require('../libs/index');
let service = {};

const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Owner Login - Only allows users with role 'owner'
service.loginowner = (req, res, next) => {
    try {
        const { userName, loginPassword } = req.body;

        if (!userName || userName === "") throw "User name cannot be empty";
        if (!loginPassword || loginPassword === "") throw "Login Password cannot be empty";

        const queryStr = `SELECT users_id, user_name, password, role, role_id, full_name 
                          FROM users 
                          WHERE user_name = '${userName}' 
                          AND role = 'owner'`;

        lib.queryExecute(queryStr)
            .then(async result => {
                if (result.length === 0) {
                    return res.status(200).send({
                        result: null,
                        message: "Owner not found"
                    });
                }

                const user = result[0];
                const isPasswordValid = await bcrypt.compare(loginPassword, user.password);

                if (isPasswordValid) {
                    let authToken = await lib.sign(user);
                    return res.status(200).send({
                        result: { 
                            authToken, 
                            userInfo: {
                                user_id: user.users_id,
                                user_name: user.user_name,
                                role: user.role,
                                role_id: user.role_id,
                                full_name: user.full_name
                            } 
                        },
                        message: "Owner login successful"
                    });
                } else {
                    return res.status(200).send({
                        result: null,
                        message: "Invalid password"
                    });
                }
            })
            .catch(e => {
                res.status(500).send({
                    result: null,
                    message: e.message
                });
            });
    } catch (error) {
        res.status(500).send({
            result: null,
            message: error
        });
    }
};

// Tenant Login - Only allows users with role 'tenant'
service.logintenant = (req, res, next) => {
    try {
        const { userName, loginPassword } = req.body;

        if (!userName || userName === "") throw "User name cannot be empty";
        if (!loginPassword || loginPassword === "") throw "Login Password cannot be empty";

        const queryStr = `SELECT users_id, user_name, password, role, role_id, full_name 
                          FROM users 
                          WHERE user_name = '${userName}' 
                          AND role = 'tenant'`;

        lib.queryExecute(queryStr)
            .then(async result => {
                if (result.length === 0) {
                    return res.status(200).send({
                        result: null,
                        message: "Tenant not found"
                    });
                }

                const user = result[0];
                const isPasswordValid = await bcrypt.compare(loginPassword, user.password);

                if (isPasswordValid) {
                    let authToken = await lib.sign(user);
                    return res.status(200).send({
                        result: { 
                            authToken, 
                            userInfo: {
                                user_id: user.users_id,
                                user_name: user.user_name,
                                role: user.role,
                                role_id: user.role_id,
                                full_name: user.full_name
                            } 
                        },
                        message: "Tenant login successful"
                    });
                } else {
                    return res.status(200).send({
                        result: null,
                        message: "Invalid password"
                    });
                }
            })
            .catch(e => {
                res.status(500).send({
                    result: null,
                    message: e.message
                });
            });
    } catch (error) {
        res.status(500).send({
            result: null,
            message: error
        });
    }
};

// Owner Signup
service.signupowner = async (req, res) => {
    try {
        const { userName, fullName, password } = req.body;
        
        if (!userName || !fullName || !password) {
            throw "All fields are required";
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Step 1: Create owner record
        const ownerQuery = `INSERT INTO owner (owner_name, owner_details, is_deleted) 
                            VALUES ('${fullName}', '', 0)`;
        
        const ownerResult = await lib.queryExecute(ownerQuery);
        const ownerId = ownerResult.insertId;

        // Step 2: Create user record
        const userQuery = `INSERT INTO users (user_name, full_name, password, role, role_id) 
                           VALUES ('${userName}', '${fullName}', '${hashedPassword}', 'owner', ${ownerId})`;
        
        await lib.queryExecute(userQuery);

        res.status(200).send({
            result: { ownerId },
            message: "Owner account created successfully"
        });
    } catch (error) {
        res.status(500).send({
            result: null,
            message: error.message || error
        });
    }
};

// Tenant Signup
service.signuptenant = async (req, res) => {
    try {
        const { userName, fullName, password } = req.body;
        
        if (!userName || !fullName || !password) {
            throw "All fields are required";
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Step 1: Create tenant record
        const tenantQuery = `INSERT INTO tenent (tenent_name, tenent_details, is_deleted) 
                             VALUES ('${fullName}', '', 0)`;
        
        const tenantResult = await lib.queryExecute(tenantQuery);
        const tenantId = tenantResult.insertId;

        // Step 2: Create user record
        const userQuery = `INSERT INTO users (user_name, full_name, password, role, role_id) 
                           VALUES ('${userName}', '${fullName}', '${hashedPassword}', 'tenant', ${tenantId})`;
        
        await lib.queryExecute(userQuery);

        res.status(200).send({
            result: { tenantId },
            message: "Tenant account created successfully"
        });
    } catch (error) {
        res.status(500).send({
            result: null,
            message: error.message || error
        });
    }
};

// Logout (placeholder)
service.logout = (req, res, next) => {
    try {
        // Implement logout logic here
        res.status(200).send({ message: "Logout successful" });
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports = service;