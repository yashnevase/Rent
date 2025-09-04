const lib = require('../libs/index');
let service = {};

// Insert into property
service.insertProperty = async (req, res, next) => {
    try {
        const {
            property_name = '',
            property_details = '',
            created_by = null,
        } = req.body;

        // Handle multiple image uploads
        let property_images = [];
        console.log('Files received:', req.files);
        console.log('Property images files:', req.files && req.files['property_images']);
        
        if (req.files && req.files.length > 0) {
            property_images = req.files.map(file => {
                console.log('Processing file:', file.originalname, file.filename);
                return `${process.env.URL}uploads/${file.filename}`;
            });
        }
        
        console.log('Final property_images array:', property_images);

        // Get current datetime
        const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Insert query with created_at
        const queryStr = `
            INSERT INTO property
            (property_name, property_details, property_images, is_deleted, created_by, created_at) 
            VALUES 
            ('${property_name}', '${property_details}', '${JSON.stringify(property_images)}', 0, ${created_by}, '${currentDateTime}')
        `;

        await lib.queryExecute(queryStr);

        res.status(200).send({ result: req.body, message: 'Property Added Successfully!' });
    } catch (error) {
        console.error('Error in insertProperty:', error);
        res.status(500).send({ message: error.message });
    }
};

service.propertyList = async (req, res, next) => {
    try {
        let pageSet = '';
        const searchKey = req.query.searchKey || '';
        const createdBy = req.query.createdBy || req.query.userId; // Support both createdBy and userId params
        let searchCondition = 'is_deleted = 0';
        const searchableColumns = ['property_name', 'property_details'];

        // Add filter for created_by if provided
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
            SELECT * FROM property
            WHERE ${searchCondition}
            ORDER BY property_id DESC
            ${pageSet}
        `;

        const countQuery = `
            SELECT COUNT(*) AS totalCount FROM property WHERE ${searchCondition}
        `;

        const [result, totalCountResult] = await Promise.all([
            lib.queryExecute(queryStr),
            lib.queryExecute(countQuery)
        ]);

        const totalCount = totalCountResult[0].totalCount;

        const response = result.map(item => {
            // Parse property_images JSON if it exists
            let property_images = [];
            if (item.property_images) {
                try {
                    property_images = JSON.parse(item.property_images);
                } catch (e) {
                    console.warn('Invalid JSON in property_images:', item.property_images);
                }
            }

            return {
                ...item,
                property_images,
                totalCount
            };
        });

        res.status(200).send(response);
    } catch (error) {
        console.error('Error in propertyList:', error);
        res.status(500).send({ message: error.message });
    }
};

// Update or soft-delete property
service.updateDeleteProperty = async (req, res, next) => {
    try {
        const { property_id, changedUpdatedValue, ...body } = req.body;

        if (changedUpdatedValue === 'edit') {
            // Handle multiple image uploads for edit
            let property_images = body.property_images;
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => 
                    `${process.env.URL}uploads/${file.filename}`
                );
                
                // If there are existing images, merge them with new ones
                if (property_images && typeof property_images === 'string') {
                    try {
                        const existingImages = JSON.parse(property_images);
                        property_images = JSON.stringify([...existingImages, ...newImages]);
                    } catch (e) {
                        property_images = JSON.stringify(newImages);
                    }
                } else {
                    property_images = JSON.stringify(newImages);
                }
            }

            let updateFields = [];
            
            if (body.property_name) updateFields.push(`property_name = '${body.property_name}'`);
            if (body.property_details) updateFields.push(`property_details = '${body.property_details}'`);
            if (property_images) updateFields.push(`property_images = '${property_images}'`);

            if (updateFields.length === 0) {
                return res.status(400).send({ message: 'No fields to update' });
            }

            const queryStr = `
                UPDATE property SET 
                ${updateFields.join(', ')}
                WHERE property_id = ${property_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'Property Updated Successfully!' });

        } else if (changedUpdatedValue === 'delete') {
            const queryStr = `
                UPDATE property SET 
                is_deleted = 1
                WHERE property_id = ${property_id}
            `;

            await lib.queryExecute(queryStr);
            res.status(200).send({ message: 'Property Deleted Successfully!' });
        } else {
            res.status(400).send({ error: 'Invalid changedUpdatedValue' });
        }

    } catch (error) {
        console.error('Error in updateDeleteProperty:', error);
        res.status(500).send({ message: error.message });
    }
};


// AVAILABLE PROPERTY 
service.listAvailableProperty = async (req, res, next) => {
    try {
        const createdBy = req.query.userId;
        const queryStr = `
            SELECT property_id, property_name FROM property
            WHERE is_deleted = 0 AND occupied = 0 AND created_by =${createdBy}
            ORDER BY property_name ASC
        `;
        const result = await lib.queryExecute(queryStr);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error in listAvailableProperty:', error);
        res.status(500).send({ message: error.message });
    }
};




module.exports = service; 