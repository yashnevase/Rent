const lib = require('../libs/index');
let service = {};

// Insert into tenant
service.insertTenant = async (req, res, next) => {
    try {
        const {
            tenent_name = '',
            tenent_details = '',
            email_id = '',
            created_by = null
        } = req.body;

        // Handle image upload
        const tenent_image = req.files && req.files['tenent_image']
            ? `${process.env.URL}uploads/${req.files['tenent_image'][0].filename}`
            : null;

        // Insert query
        const queryStr = `
            INSERT INTO tenent
            (tenent_name, tenent_details, tenent_image, email_id, created_by, created_at, is_deleted) 
            VALUES 
            ('${tenent_name}', '${tenent_details}', ${tenent_image ? `'${tenent_image}'` : 'NULL'}, '${email_id}', ${created_by}, NOW(), 0)
        `;

        await lib.queryExecute(queryStr);

        res.status(200).send({ result: req.body, message: 'Tenant Added Successfully!' });
    } catch (error) {
        console.error('Error in insertTenant:', error);
        res.status(500).send({ message: error.message });
    }
};

service.tenantList = async (req, res, next) => {
    try {
        let pageSet = '';
        const searchKey = req.query.searchKey || '';
        const createdBy = req.query.createdBy || req.query.userId;
        let searchCondition = 'is_deleted = 0';
        const searchableColumns = ['tenent_name', 'tenent_details', 'email_id'];

        if (createdBy) {
            searchCondition += ` AND created_by = ${createdBy}`;
        }

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
            SELECT * FROM tenent
            WHERE ${searchCondition}
            ORDER BY tenent_id DESC
            ${pageSet}
        `;

        const countQuery = `
            SELECT COUNT(*) AS totalCount FROM tenent WHERE ${searchCondition}
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
        console.error('Error in tenantList:', error);
        res.status(500).send({ message: error.message });
    }
};

// Update or soft-delete tenant
service.updateDeleteTenant = async (req, res, next) => {
    try {
        const { tenent_id, changedUpdatedValue, ...body } = req.body;

        if (changedUpdatedValue === 'edit') {
            // Handle image upload for edit
            const tenent_image = req.files && req.files['tenent_image']
                ? `${process.env.URL}uploads/${req.files['tenent_image'][0].filename}`
                : body.tenent_image;

            let updateFields = [];
            
            if (body.tenent_name) updateFields.push(`tenent_name = '${body.tenent_name}'`);
            if (body.tenent_details) updateFields.push(`tenent_details = '${body.tenent_details}'`);
            if (body.email_id) updateFields.push(`email_id = '${body.email_id}'`);
            if (tenent_image) updateFields.push(`tenent_image = '${tenent_image}'`);

            if (updateFields.length === 0) {
                return res.status(400).send({ message: 'No fields to update' });
            }

            const queryStr = `
                UPDATE tenent SET 
                ${updateFields.join(', ')}
                WHERE tenent_id = ${tenent_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'Tenant Updated Successfully!' });

        } else if (changedUpdatedValue === 'delete') {
            const queryStr = `
                UPDATE tenent SET 
                is_deleted = 1
                WHERE tenent_id = ${tenent_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'Tenant Deleted Successfully!' });
        } else {
            res.status(400).send({ error: 'Invalid changedUpdatedValue' });
        }

    } catch (error) {
        console.error('Error in updateDeleteTenant:', error);
        res.status(500).send({ message: error.message });
    }
};

// List available tenants (occupied = 0)
service.listAvailableTenants = async (req, res, next) => {
    try {
        const queryStr = `
            SELECT tenent_id, tenent_name FROM tenent
            WHERE is_deleted = 0 AND occupied = 0
            ORDER BY tenent_name ASC
        `;
        const result = await lib.queryExecute(queryStr);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error in listAvailableTenants:', error);
        res.status(500).send({ message: error.message });
    }
};



module.exports = service; 