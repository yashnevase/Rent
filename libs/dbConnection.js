const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Initialize MySQL connection pool
let pool;

let init = async () => {
    try {
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'sqlConfig.json'), 'utf8'));

        // Create the MySQL connection pool
        pool = await mysql.createPool(config);
        console.log('MySQL connection pool established');

        return pool;
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        process.exit(1); // Exit the process if the connection fails
    }
};

// Function to initialize the connection pool
let initConnection = async () => {
    try {
        if (!pool) {
            pool = await init(); // Initialize the pool if it doesn't exist
        }
        return pool; // Return the pool
    } catch (error) {
        console.error('Error initializing connection:', error);
        throw error;
    }
};

module.exports = { init, initConnection }; // Export the init and initConnection functions






















// const mssql = require('mssql')
// const fs = require('fs')
// const path = require('path')


// let init = () =>{
//     try {
//         let cnfig = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config','sqlConfig.json'),'utf8'))
//         return new mssql.ConnectionPool(cnfig).connect().then(pool => pool)
//                     .catch(e =>{
//                         throw e
//                         process.exit(1)
//                     })
//     } catch (error) {
//         throw error
//     }
// }

// module.exports = init

