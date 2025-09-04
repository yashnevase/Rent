const lib = require('../libs/index');
let service = {};

// Insert into agreement
service.insertAgreement = async (req, res, next) => {
    try {
        const {
            agreement_no = '',
            property_id = null,
            tenent_id = null,
            start_date = '',
            end_date = '',
            rent_amount = 0,
            deposit_amount = 0,
            created_by = null, // This will also be the owner_id
        } = req.body;

        const owner_id = created_by;

        // Handle image upload
        const agreement_image = req.files && req.files['agreement_image']
            ? `${process.env.URL}uploads/${req.files['agreement_image'][0].filename}`
            : null;

        // Get current datetime
        const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Insert agreement query
        const insertAgreementQuery = `
            INSERT INTO agreement
            (agreement_no, property_id, owner_id, tenent_id, agreement_image, 
             start_date, end_date, rent_amount, deposit_amount, status, is_deleted, created_by, created_at) 
            VALUES 
            ('${agreement_no}', ${property_id}, ${owner_id}, ${tenent_id}, 
             ${agreement_image ? `'${agreement_image}'` : 'NULL'}, '${start_date}', '${end_date}', 
             ${rent_amount}, ${deposit_amount}, 0, 0, ${created_by}, '${currentDateTime}')
        `;

        await lib.queryExecute(insertAgreementQuery);

        // Update tenant's occupied status to 1
        const updateTenantQuery = `
            UPDATE tenent SET occupied = 1 WHERE tenent_id = ${tenent_id}
        `;
        await lib.queryExecute(updateTenantQuery);

        // Update property's occupied status to 1
        const updatePropertyQuery = `
                UPDATE property SET occupied = 1 WHERE property_id = ${property_id}
            `;
        await lib.queryExecute(updatePropertyQuery);



        res.status(200).send({ message: 'Agreement Added Successfully!' });

    } catch (error) {
        console.error('Error in insertAgreement:', error);
        res.status(500).send({ message: error.message });
    }
};

service.agreementList = async (req, res, next) => {
    try {
        let pageSet = '';
        const searchKey = req.query.searchKey || '';
        const createdBy = req.query.createdBy || req.query.userId;
        let searchCondition = 'a.is_deleted = 0';

        if (createdBy) {
            searchCondition += ` AND a.created_by = ${createdBy}`;
        }
        const searchableColumns = ['a.agreement_no', 'p.property_name', 'o.owner_name', 't.tenent_name'];

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
            SELECT 
                a.*,
                p.property_name,
                o.owner_name,
                t.tenent_name
            FROM agreement a
            LEFT JOIN property p ON a.property_id = p.property_id
            LEFT JOIN owner o ON a.owner_id = o.owner_id
            LEFT JOIN tenent t ON a.tenent_id = t.tenent_id
            WHERE ${searchCondition}
            ORDER BY a.agreement_id ASC
            ${pageSet}
        `;

        const countQuery = `
            SELECT COUNT(*) AS totalCount 
            FROM agreement a
            LEFT JOIN property p ON a.property_id = p.property_id
            LEFT JOIN owner o ON a.owner_id = o.owner_id
            LEFT JOIN tenent t ON a.tenent_id = t.tenent_id
            WHERE ${searchCondition}
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
        console.error('Error in agreementList:', error);
        res.status(500).send({ message: error.message });
    }
};

// Update or soft-delete agreement
service.updateDeleteAgreement = async (req, res, next) => {
    try {
        const { agreement_id, changedUpdatedValue, ...body } = req.body;

        if (changedUpdatedValue === 'edit') {
            // Handle image upload for edit
            const agreement_image = req.files && req.files['agreement_image']
                ? `${process.env.URL}uploads/${req.files['agreement_image'][0].filename}`
                : body.agreement_image;

            let updateFields = [];

            if (body.agreement_no) updateFields.push(`agreement_no = '${body.agreement_no}'`);
            if (body.property_id) updateFields.push(`property_id = ${body.property_id}`);
            if (body.owner_id) updateFields.push(`owner_id = ${body.owner_id}`);
            if (body.tenent_id) updateFields.push(`tenent_id = ${body.tenent_id}`);
            if (body.start_date) updateFields.push(`start_date = '${body.start_date}'`);
            if (body.end_date) updateFields.push(`end_date = '${body.end_date}'`);
            if (body.rent_amount) updateFields.push(`rent_amount = ${body.rent_amount}`);
            if (body.deposit_amount) updateFields.push(`deposit_amount = ${body.deposit_amount}`);
            if (body.status !== undefined) updateFields.push(`status = ${body.status}`);
            if (agreement_image) updateFields.push(`agreement_image = '${agreement_image}'`);

            if (updateFields.length === 0) {
                return res.status(400).send({ message: 'No fields to update' });
            }

            const queryStr = `
                UPDATE agreement SET 
                ${updateFields.join(', ')}
                WHERE agreement_id = ${agreement_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'Agreement Updated Successfully!' });

        } else if (changedUpdatedValue === 'delete') {
            const queryStr = `
                UPDATE agreement SET 
                is_deleted = 1
                WHERE agreement_id = ${agreement_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'Agreement Deleted Successfully!' });
        } else {
            res.status(400).send({ error: 'Invalid changedUpdatedValue' });
        }

    } catch (error) {
        console.error('Error in updateDeleteAgreement:', error);
        res.status(500).send({ message: error.message });
    }
};







// chevk expiry

service.expireAgreements = async () => {
    try {
        const currentDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

        const getExpiredAgreements = `
            SELECT agreement_id, property_id, tenent_id 
            FROM agreement 
            WHERE status = 0 AND end_date < '${currentDate}' AND is_deleted = 0
        `;

        const expiredAgreements = await lib.queryExecute(getExpiredAgreements);

        for (const agmt of expiredAgreements) {
            const updateAgreement = `
                UPDATE agreement 
                SET status = 1 
                WHERE agreement_id = ${agmt.agreement_id}
            `;

            const updateProperty = `
                UPDATE property 
                SET occupied = 0 
                WHERE property_id = ${agmt.property_id}
            `;

            const updateTenant = `
                UPDATE tenent 
                SET occupied = 0 
                WHERE tenent_id = ${agmt.tenent_id}
            `;

            await lib.queryExecute(updateAgreement);
            await lib.queryExecute(updateProperty);
            await lib.queryExecute(updateTenant);
        }

        console.log('Expired agreements processed.');
    } catch (error) {
        console.error('Error in expireAgreements:', error);
    }
};




// List agreements by property ID
service.listAgreementsByProperty = async (req, res, next) => {
    try {
        const { property_id } = req.params;

        const query = `
            SELECT * FROM agreement 
            WHERE property_id = ${property_id} AND is_deleted = 0
            ORDER BY start_date DESC
        `;

        const agreements = await lib.queryExecute(query);
        res.status(200).send(agreements);
    } catch (error) {
        console.error('Error in listAgreementsByProperty:', error);
        res.status(500).send({ message: error.message });
    }
};

module.exports = service; 