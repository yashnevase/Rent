const lib = require('../libs/index');
let service = {};

// Insert into owner
service.insertOwner = async (req, res, next) => {
    try {
        const {
            owner_name = '',
            owner_details = '',
        } = req.body;

        // Handle image upload
        const owner_image = req.files && req.files['owner_image']
            ? `${process.env.URL}uploads/${req.files['owner_image'][0].filename}`
            : null;

        // Insert query
        const queryStr = `
            INSERT INTO owner
            (owner_name, owner_details, owner_image, is_deleted) 
            VALUES 
            ('${owner_name}', '${owner_details}', ${owner_image ? `'${owner_image}'` : 'NULL'}, 0)
        `;

        await lib.queryExecute(queryStr);

        res.status(200).send({ result: req.body, message: 'Owner Added Successfully!' });
    } catch (error) {
        console.error('Error in insertOwner:', error);
        res.status(500).send({ message: error.message });
    }
};

service.ownerList = async (req, res, next) => {
    try {
        let pageSet = '';
        const searchKey = req.query.searchKey || '';
        let searchCondition = 'is_deleted = 0';
        const searchableColumns = ['owner_name', 'owner_details'];

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
            SELECT * FROM owner
            WHERE ${searchCondition}
            ORDER BY owner_id ASC
            ${pageSet}
        `;

        const countQuery = `
            SELECT COUNT(*) AS totalCount FROM owner WHERE is_deleted = 0
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
        console.error('Error in ownerList:', error);
        res.status(500).send({ message: error.message });
    }
};

// Update or soft-delete owner
service.updateDeleteOwner = async (req, res, next) => {
    try {
        const { owner_id, changedUpdatedValue, ...body } = req.body;

        if (changedUpdatedValue === 'edit') {
            // Handle image upload for edit
            const owner_image = req.files && req.files['owner_image']
                ? `${process.env.URL}uploads/${req.files['owner_image'][0].filename}`
                : body.owner_image;

            let updateFields = [];
            
            if (body.owner_name) updateFields.push(`owner_name = '${body.owner_name}'`);
            if (body.owner_details) updateFields.push(`owner_details = '${body.owner_details}'`);
            if (owner_image) updateFields.push(`owner_image = '${owner_image}'`);

            if (updateFields.length === 0) {
                return res.status(400).send({ message: 'No fields to update' });
            }

            const queryStr = `
                UPDATE owner SET 
                ${updateFields.join(', ')}
                WHERE owner_id = ${owner_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'Owner Updated Successfully!' });

        } else if (changedUpdatedValue === 'delete') {
            const queryStr = `
                UPDATE owner SET 
                is_deleted = 1
                WHERE owner_id = ${owner_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'Owner Deleted Successfully!' });
        } else {
            res.status(400).send({ error: 'Invalid changedUpdatedValue' });
        }

    } catch (error) {
        console.error('Error in updateDeleteOwner:', error);
        res.status(500).send({ message: error.message });
    }
};

module.exports = service; 