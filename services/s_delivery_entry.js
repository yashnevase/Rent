const lib = require('../libs/index');
const path = require('path');
const fs = require('fs');
let service = {};
require('dotenv').config();
 const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getCurrentDateTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const getCurrentTime = () => new Date().toTimeString().split(' ')[0];
const dayjs = require('dayjs');
const { addTrackingHistory, getCurrentCycleId } = require('../libs/tracking');





service.insertdeliveryEntry = async (req, res) => {
  try {
    console.log("Received body:", req.body);

    let body;
    if (typeof req.body.deliveryData === 'string') {
      body = JSON.parse(req.body.deliveryData);
    } else if (req.body.deliveryData) {
      body = req.body.deliveryData;
    } else {
      body = req.body;
    }

    console.log("Parsed body:", body);

    const {
      entry_date = getCurrentDate(),
      driver_id = null,
      from_vehicle_id = null,
      to_customer_id = null,
      table_details = [],
      created_by = '',
      challanNo = '',
 
    } = body;

    const created_at = getCurrentDateTime();
    const delivery_time = getCurrentTime();

    // Generate financial year
    let fin_year;
    
    if (!fin_year) {
      const dateToUse = new Date(entry_date);
      const year = dateToUse.getFullYear();
      const month = dateToUse.getMonth() + 1; // getMonth() is zero-based

      // Financial year starts in April
      fin_year = month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }

    if (!fin_year) {
      const dateObj = dayjs(entry_date);
      const year = dateObj.year();
      const month = dateObj.month();
      fin_year = (month < 3) ? `${year - 1}-${year}` : `${year}-${year + 1}`;
    }

    const finYearParts = fin_year.split('-');
    const shortFinYear = `${finYearParts[0].slice(-2)}-${finYearParts[1].slice(-2)}`;

    // File Upload Receipt
    const upload_receipts = req.files && req.files.length > 0
      ? JSON.stringify(req.files.map(file => `${process.env.URL}uploads/${file.filename}`))
      : JSON.stringify([]);

    // ✅ Generate Entry No: DL/YY-YY/0001 (removed short_code logic)
    const getLastEntryQuery = `
      SELECT entry_no 
      FROM delivery_entry 
      WHERE is_deleted = 0 
        AND entry_no LIKE 'DL/${shortFinYear}/%' 
      ORDER BY CAST(SUBSTRING_INDEX(entry_no, '/', -1) AS UNSIGNED) DESC 
      LIMIT 1;
    `;

    const lastResult = await lib.queryExecute(getLastEntryQuery);
    let sequenceNumber = 1;
    if (lastResult.length > 0) {
      const lastEntryNo = lastResult[0].entry_no;
      const parts = lastEntryNo.split('/');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          sequenceNumber = lastSeq + 1;
        }
      }
    }

    const formattedSeq = sequenceNumber.toString().padStart(4, '0');
    const entry_no = `DL/${shortFinYear}/${formattedSeq}`;
    console.log("Generated Entry No:", entry_no);

    // Insert into delivery_entry
    const insertQuery = `
      INSERT INTO delivery_entry (
        entry_no, entry_date, driver_id, from_vehicle_id,
        to_customer_id, table_details, upload_receipt,
        created_by, created_at, delivery_time,
        fin_year, is_deleted, challanNo
      ) VALUES (
        '${entry_no}', '${entry_date}', ${driver_id ?? 'NULL'}, ${from_vehicle_id ?? 'NULL'},
        ${to_customer_id ?? 'NULL'}, '${JSON.stringify(table_details)}', '${upload_receipts}',
        '${created_by}', '${created_at}', '${delivery_time}',
        '${fin_year}', 0 , '${challanNo}'
      );
    `;

    console.log("Insert Query:", insertQuery);
    await lib.queryExecute(insertQuery);

    // Update each cylinder in cylinder_master
    const parsedDetails = typeof table_details === 'string'
      ? JSON.parse(table_details)
      : table_details;

    for (const item of parsedDetails) {
      if (!item.cyl_id) {
        console.warn('Skipping invalid cyl_id in table_details:', item);
        continue;
      }

      const updateCylinderQuery = `
        UPDATE cylinder_master SET
          current_location = 'Customer',
          current_customer_id = ${to_customer_id ?? 'NULL'},
          current_vehicle_id = NULL,
          current_plant_id = NULL,
          current_depot_id = NULL
        WHERE cyl_id = ${item.cyl_id};
      `;

      console.log(`Updating cylinder_master for cyl_id ${item.cyl_id}`);
      await lib.queryExecute(updateCylinderQuery);

      // Fetch current status and note from cylinder_master
      const [cylData] = await lib.queryExecute(`SELECT status, note FROM cylinder_master WHERE cyl_id = ${item.cyl_id} LIMIT 1`);
      const currentStatus = cylData ? cylData.status : null;
      const currentNote = cylData ? cylData.note : null;
      let lastCycleId = await getCurrentCycleId(item.cyl_id);
      await addTrackingHistory({
        cyl_id: item.cyl_id,
        trans_name: 'delivery_entry',
        trans_id: entry_no,
        from_location: 'Depot', // adjust as needed
        to_location: 'Customer',
        to_customer_id: to_customer_id,
        status: currentStatus,
        note: currentNote,
        cycle_id: lastCycleId,
        user_id: created_by
      });
    }

    res.status(200).send({
      message: 'Delivery Entry added successfully!',
      entry_no
    });

  } catch (error) {
    console.error("Error inserting delivery entry:", error);
    if (!res.headersSent) {
      res.status(500).send({ message: error.message });
    }
  }
};



service.deliveryentryList = async (req, res, next) => {
    try {
        const { searchKey = '', page = 0, size = 10 } = req.query;
        let condition = 'de.is_deleted = 0';

        const allColumns = [
            'de.supplier_name', 'de.delivery_address', 'de.rfq_no', 'de.invoice_no', 'de.challan_no', 'de.lr_no',
            'de.transporter', 'de.vehicle_no', 'de.driver_name', 'de.grn_details', 'de.certificate_no',
            'de.short_code', 'de.fin_year', 'de.depot_id', 'cm.cust_name'
        ];

        if (searchKey) {
            const searchConditions = allColumns
                .map(col => `${col} LIKE '%${searchKey}%'`)
                .join(' OR ');
            condition += ` AND (${searchConditions})`;
        }

        // const pagination = size > 0 ? `LIMIT ${size} OFFSET ${page * size}` : '';
        const pagination = '';  // Disable pagination


        // Get total count
        const [countResult] = await lib.queryExecute(`
            SELECT COUNT(*) AS totalCount 
            FROM delivery_entry de
            LEFT JOIN customer_master cm ON de.to_customer_id = cm.cust_id
            WHERE de.is_deleted = 0
        `);

        // Main query with customer name join
        const result = await lib.queryExecute(`
            SELECT 
                de.*, 
                cm.cust_name AS customer_name 
            FROM delivery_entry de
            LEFT JOIN customer_master cm ON de.to_customer_id = cm.cust_id
            WHERE ${condition}
            ORDER BY de.entry_id ASC
            ${pagination}
        `);

        const response = result.map(entry => {
            // Count cylinders from JSON field (if exists)
            let cylinderCount = 0;
            try {
                const details = JSON.parse(entry.table_details || '[]');
                cylinderCount = Array.isArray(details) ? details.length : 0;
            } catch (err) {
                console.warn(`Invalid JSON in table_details for entry_id ${entry.entry_id}`);
            }

            // Format created_at time
            let createdTimeFormatted = null;
            if (entry.created_at) {
                const date = new Date(entry.created_at);
                const hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const formattedHours = hours % 12 || 12;
                createdTimeFormatted = `${formattedHours}:${minutes} ${ampm}`;
            }

            return {
                ...entry,
                customer_name: entry.customer_name || null,
                totalCount: countResult.totalCount,
                cylinderCount,
                created_time: createdTimeFormatted
            };
        });

        res.status(200).send(response);

    } catch (error) {
        console.error('Error in delivery_entry List:', error);
        res.status(500).send({ message: error.message });
    }
};


service.updateDeleteDeliveryEntry = async (req, res, next) => {
    try {
        const changedUpdatedValue = req.body.changedUpdatedValue || 'edit';

        const entry_id = req.body.entry_id;

        const upload_receipt = req.files && req.files['upload_receipt']
            ? `${process.env.URL}uploads/${req.files['upload_receipt'][0].filename}`
            : req.body.upload_receipt;

      

        if (changedUpdatedValue === 'edit') {
            const deliveryData = JSON.parse(req.body.deliveryData);

            const {
          entry_id='',
                entry_date = '',
                driver_name = '',
                from_tempo = '',
                to_customer = '',
                table_details = ''
            } = deliveryData;

            const modified_by = req.user?.user_id
            const modified_at = dayjs().format('YYYY-MM-DD HH:mm:ss');

            const queryStr = `
                UPDATE delivery_entry SET 
                    entry_date = '${entry_date}',
                    driver_name = '${driver_name}',
                    from_tempo = '${from_tempo}',
                    to_customer = '${to_customer}',
                    upload_receipt = '${upload_receipt}',
                    table_details = '${table_details}',
                    modified_by = '${modified_by}',
                    modified_at = '${modified_at}'
                WHERE entry_id = '${entry_id}'
            `;

            console.log("Update Query:", queryStr);
            await lib.queryExecute(queryStr);

            res.status(200).send({ message: 'delivery_entry Updated Successfully!' });

        } else if (changedUpdatedValue === 'delete') {
            const queryStr = `
                UPDATE delivery_entry SET 
                    is_deleted = 1
                WHERE entry_id = '${entry_id}'
            `;

            console.log("Delete Query:", queryStr);
            await lib.queryExecute(queryStr);

            res.status(200).send({ message: 'delivery_entry Deleted Successfully!' });
        } else {
            res.status(400).send({ error: 'Invalid changedUpdatedValue' });
        }

    } catch (error) {
        console.error('Error updating delivery_entry:', error);
        res.status(500).send({ error: error.message || error });
    }
};




////////// GET CUSTOM CHALLAN NO


service.deliveryChallanNo = async (req, res, next) => {
  try {
    const {
      driver_id,
      // vehicle_id,
      // to_customer_id
    } = req.query;

    const filters = ['dc.is_deleted = 0'];

    if (driver_id) filters.push(`dc.driver_id = ${parseInt(driver_id)}`);
    // if (vehicle_id) filters.push(`dc.vehicle_id = ${parseInt(vehicle_id)}`);
    // if (to_customer_id) filters.push(`dc.to_customer_id = ${parseInt(to_customer_id)}`);

    const whereClause = filters.join(' AND ');

    const queryStr = `
      SELECT 
        dc.*, 
        cust.cust_name AS customer_name,
        supp.supplier_name AS supplier_name,
        dr.driver_name AS driver_name,
        prod.prod_code AS product_code,
        depot.depot_name AS depot_name,
        depot.depot_address AS other_depot_address,
        depot.contact_no AS depot_contact_no
      FROM delivery_challan dc
      LEFT JOIN customer_master cust ON dc.to_customer_id = cust.cust_id
      LEFT JOIN supplier_master supp ON dc.to_supplier_id = supp.supplier_id
      LEFT JOIN driver_master dr ON dc.driver_id = dr.driver_id
      LEFT JOIN product_master prod ON dc.product_id = prod.prod_id
      LEFT JOIN depot_master depot ON dc.to_depot_id = depot.depot_id
      WHERE ${whereClause}
      ORDER BY dc.entry_id ASC
    `;

    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM delivery_challan dc
      WHERE ${whereClause}
    `;

    const totalCountResult = await lib.queryExecute(countQuery);
    const totalCount = totalCountResult[0].totalCount;

    const result = await lib.queryExecute(queryStr);

    const response = result.map(item => ({
      ...item,
      totalCount
    }));

    res.status(200).send(response);
  } catch (error) {
    console.error('Error in deliveryentryList:', error);
    res.status(500).send({ message: error.message });
  }
};






module.exports = service;





