const { initConnection } = require('./dbConnection'); // Import the initConnection function

// Function to execute a general query (SELECT, INSERT, UPDATE, etc.)
let queryExecute = async (str = '', params = []) => {
    try {
        const pool = await initConnection();
        const [rows] = await pool.execute(str, params);  // use execute with params
        return rows;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};



let spExecute = async (spname = '', body = {}) => {
    try {
        const pool = await initConnection(); // Get the pool (will create it if not already created)

        // Prepare the parameterized query for calling the stored procedure
        const params = Object.values(body); // Get the values from the body object
        const query = `CALL ${spname}(${params.map(() => '?').join(',')})`; // Construct the query string with placeholders

        // Execute the query and pass parameters
        const [result] = await pool.execute(query, params);

        return result;  // Return the result of the stored procedure
    } catch (error) {
        console.error('Error executing stored procedure:', error);
        throw error;
    }
};


let queryExecuteDelete = async (str = '') => {
    try {
        const pool = await initConnection(); // Get the pool (will create it if not already created)

        const [result] = await pool.query(str); // Execute the DELETE query
        return { rowsAffected: result.affectedRows }; // Return the affected rows count
    } catch (error) {
        console.error('Error executing delete query:', error);
        throw error;
    }
};

module.exports = { spExecute, queryExecute, queryExecuteDelete };  // Export the functions for use in other modules



























// let connection = require('./dbConnection')
// let pool = connection()

// let initConnection = () => {
//     try {
//         pool = connection()
//         return true
//     } catch (error) {
//         throw error
//     }
// }

// let spInputParam = (req, body) => {
//     try {
//         let param = Object.entries(body)
//         if (param.length >= 0 && req) {
//             param.forEach(keyValue => {
//                 req.input(keyValue[0], keyValue[1])
//             });
//             return req
//         } else {
//             if (param.length >= 0) throw new Error("empty params")
//             else throw new Error('DB RequestError')
//         }
//     } catch (error) {
//         throw error
//     }
// }

// let spExecute = (spname = '', body = {}) => {
//     return new Promise((resolve, reject) => {
//         try {
//             pool.then(p => p.request())
//                 .then(req => spInputParam(req, body))
//                 .then(updatedReq => updatedReq.execute(spname))
//                 .then(result => resolve(result.recordset))
//                 .catch(e => reject(e))
//         } catch (error) {
//             reject(error)
//         }
//     })
// }



// let queryExecute = (str = '') => {
//     return new Promise((resolve, reject) => {
//         try {
//             pool
//                 .then((p) => p.request())
//                 .then((req) => req.query(str))
//                 .then((result) => resolve(result.recordset))
//                 .catch((e) => reject(e));
//         } catch (error) {
//             reject(error);
//         }
//     });
// };

// let queryExecuteDelete = (str = '') => {
//     return new Promise((resolve, reject) => {
//         try {
//             pool.then(p => p.request())
//                 .then(req => req.query(str))
//                 .then(result => resolve({ rowsAffected: result.rowsAffected[0] }))
//                 .catch(e => reject(e))
//         } catch (error) {
//             reject(error)
//         }
//     })
// }

// module.exports = { spExecute, queryExecute, queryExecuteDelete }