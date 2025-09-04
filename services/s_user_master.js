const lib = require('../libs/index');
const bcrypt = require('bcryptjs');
let service = {};

// Insert into users
service.insertUserMaster = async (req, res, next) => {
    try {
        const {
            user_name = '',
            role = '',
            role_id = '',
            password = '',
        } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle image upload
        const profile_image = req.files && req.files['profile_image']
            ? `${process.env.URL}uploads/${req.files['profile_image'][0].filename}`
            : null;

        // Insert query
        const queryStr = `
            INSERT INTO users
            (user_name, role, role_id, password, profile_image) 
            VALUES 
            ('${user_name}', '${role}', ${role_id || 'NULL'}, '${hashedPassword}', ${profile_image ? `'${profile_image}'` : 'NULL'})
        `;

        await lib.queryExecute(queryStr);

        res.status(200).send({ result: req.body, message: 'User Added Successfully!' });
    } catch (error) {
        console.error('Error in insertUserMaster:', error);
        res.status(500).send({ message: error.message });
    }
};

service.UserMasterList = async (req, res, next) => {
    try {
        let pageSet = '';
        const searchKey = req.query.searchKey || '';
        let searchCondition = 'is_deleted = 0';
        const searchableColumns = ['user_name', 'role'];

        if (searchKey) {
            const conditions = searchableColumns
                .map(col => `${col} LIKE '%${searchKey}%'`)
                .join(' OR ');
            searchCondition += ` AND (${conditions})`;
        }

        const page = parseInt(req.query.page, 10) || 0;
        const size = parseInt(req.query.size, 10) || 10;

        if (size > 0) {
            pageSet = `LIMIT ${size} OFFSET ${page * size}`;
        }

        const queryStr = `
            SELECT * FROM users
            WHERE ${searchCondition}
            ORDER BY users_id ASC
            ${pageSet}
        `;

        const countQuery = `
            SELECT COUNT(*) AS totalCount FROM users WHERE is_deleted = 0
        `;

        const [result, totalCountResult] = await Promise.all([
            lib.queryExecute(queryStr),
            lib.queryExecute(countQuery)
        ]);

        const totalCount = totalCountResult[0].totalCount;

        const response = result.map(item => ({
            ...item,
            totalCount
        }));

        res.status(200).send(response);
    } catch (error) {
        console.error('Error in UserMasterList:', error);
        res.status(500).send({ message: error.message });
    }
};

// Update or soft-delete users
service.updateDeleteUserMaster = async (req, res, next) => {
    try {
        const { users_id, password, changedUpdatedValue, ...body } = req.body;

        if (changedUpdatedValue === 'edit') {
            // Handle image upload for edit
            const profile_image = req.files && req.files['profile_image']
                ? `${process.env.URL}uploads/${req.files['profile_image'][0].filename}`
                : body.profile_image;

            let updateFields = [];
            
            if (body.user_name) updateFields.push(`user_name = '${body.user_name}'`);
            if (body.role) updateFields.push(`role = '${body.role}'`);
            if (body.role_id) updateFields.push(`role_id = ${body.role_id}`);
            if (profile_image) updateFields.push(`profile_image = '${profile_image}'`);

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateFields.push(`password = '${hashedPassword}'`);
            }

            if (updateFields.length === 0) {
                return res.status(400).send({ message: 'No fields to update' });
            }

            const queryStr = `
                UPDATE users SET 
                ${updateFields.join(', ')}
                WHERE users_id = ${users_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'User Updated Successfully!' });

        } else if (changedUpdatedValue === 'delete') {
            const queryStr = `
                UPDATE users SET 
                is_deleted = 1
                WHERE users_id = ${users_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'User Deleted Successfully!' });
        } else {
            res.status(400).send({ error: 'Invalid changedUpdatedValue' });
        }

    } catch (error) {
        console.error('Error in updateDeleteUserMaster:', error);
        res.status(500).send({ message: error.message });
    }
};

module.exports = service;
