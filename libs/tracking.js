// backend/libs/tracking.js
const lib = require('./index');

// Get the latest cycle_id for a cylinder
async function getCurrentCycleId(cyl_id) {
  const result = await lib.queryExecute(`
    SELECT cycle_id FROM tracking_history
    WHERE cyl_id = ${cyl_id}
    ORDER BY track_id DESC
    LIMIT 1
  `);
  return result.length > 0 ? result[0].cycle_id : null;
}

// Generate a new cycle_id (global auto-increment)
async function generateNewCycleId() {
  const result = await lib.queryExecute(`SELECT MAX(cycle_id) AS max_id FROM tracking_history`);
  return (result[0].max_id || 0) + 1;
}

function sqlValue(val) {
  if (val === null || typeof val === 'undefined') return 'NULL';
  if (typeof val === 'number') return val;
  return `'${val}'`;
}

// Main function to add a tracking record
async function addTrackingHistory({
  cyl_id,
  trans_name,
  trans_date = new Date().toISOString().slice(0, 19).replace('T', ' '),
  from_location,
  to_location,
  from_customer_id,
  to_customer_id,
  from_supplier_id,
  to_supplier_id,
  from_depot_id,
  to_depot_id,
  from_vehicle_id,
  to_vehicle_id,
  status,
  note,
  cycle_id // pass null to start a new cycle
}) {
  // If cycle_id is null, generate a new one
  if (!cycle_id) {
    cycle_id = await generateNewCycleId();
  }

  const query = `
    INSERT INTO tracking_history (
      cycle_id, trans_name, trans_date, cyl_id,
      from_location, to_location,
      from_customer_id, to_customer_id,
      from_supplier_id, to_supplier_id,
      from_depot_id, to_depot_id,
      from_vehicle_id, to_vehicle_id,
      status, note
    ) VALUES (
      ${cycle_id}, ${sqlValue(trans_name)}, ${sqlValue(trans_date)}, ${cyl_id},
      ${sqlValue(from_location)}, ${sqlValue(to_location)},
      ${from_customer_id || 'NULL'}, ${to_customer_id || 'NULL'},
      ${from_supplier_id || 'NULL'}, ${to_supplier_id || 'NULL'},
      ${from_depot_id || 'NULL'}, ${to_depot_id || 'NULL'},
      ${from_vehicle_id || 'NULL'}, ${to_vehicle_id || 'NULL'},
      ${sqlValue(status)}, ${sqlValue(note)}
    )
  `;
  await lib.queryExecute(query);
  return cycle_id;
}

module.exports = {
  addTrackingHistory,
  getCurrentCycleId,
  generateNewCycleId
};