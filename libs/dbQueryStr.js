const LogicalExp = new RegExp("\\b(and|or)\\b", 'gim');
const compare = new RegExp("(.*) (eq|like|in|gt|gte|lt|lte|noteq|notin) (.*)", 'gi');

let insertQuery = (body = {}, tblName = '', output = '') => {
    try {
        let keys = [];
        let values = Object.entries(body).reduce((prv, [key, value], index, arr) => {
            if (key !== 'id') {
                if (value || value === 0 || value === false) { // Ensuring all values including 0 and false are considered
                    prv += !isNaN(value) || value.startsWith('(SELECT') ? value : `'${value}'`;
                    keys.push(key);
                    prv += ',';
                }
            }
            return prv;
        }, ``);

        // Remove trailing comma from values and keys
        values = values.substring(0, values.length - 1);
        return `INSERT INTO ${tblName} (${keys.join(',')}) ${output ? 'OUTPUT Inserted.' + output : ''} VALUES(${values})`;
    } catch (error) {
        throw error;
    }
}

let updateQuery = (body = {}, tblName = '', search = '') => {
    try {
        let param = Object.entries(body).reduce((prv, [key, value], index, arr) => {
            if (key !== 'id') {
                if (value !== '' && value !== null && value !== undefined) {
                    prv += `${key}=${!isNaN(value) ? value : `'${value}'`},`;
                }
            }
            return prv;
        }, '');

        
        param = param.substring(0, param.length - 1);
        return `UPDATE ${tblName} SET ${param} WHERE ${search}`;
    } catch (error) {
        throw error;
    }
}

let whereClause = (str = '') => {
    try {
        if (!str) throw `Empty Params`;
        else {
            let spiltValue = str.split(LogicalExp);
            return spiltValue.reduce((final, cond) => {
                let condition = cond.trim();
                if (!condition.match(LogicalExp)) {
                    let [, key, operator, value] = condition.split(compare);
                    let newOp, newvalue;
                    if (operator === 'eq') {
                        newOp = '=';
                        newvalue = value.startsWith('(SELECT') ? value : `'${value}'`;
                    } else if (operator === 'like') {
                        newOp = 'LIKE';
                        if (value.match(new RegExp('%', 'gi'))) {
                            newvalue = `'${value}'`;
                        } else {
                            newvalue = `'%${value}%'`;
                        }
                    } else if (operator === 'in') {
                        newOp = 'IN';
                        newvalue = `(${value.split(',').map(v => `'${v}'`).join(',')})`;
                    } else if (operator === 'gt') {
                        newOp = '>';
                        newvalue = value.startsWith('(SELECT') ? value : `'${value}'`;
                    } else if (operator === 'gte') {
                        newOp = '>=';
                        newvalue = value.startsWith('(SELECT') ? value : `'${value}'`;
                    } else if (operator === 'lt') {
                        newOp = '<';
                        newvalue = value.startsWith('(SELECT') ? value : `'${value}'`;
                    } else if (operator === 'lte') {
                        newOp = '<=';
                        newvalue = value.startsWith('(SELECT') ? value : `'${value}'`;
                    } else if (operator === 'noteq') {
                        newOp = '!=';
                        newvalue = value.startsWith('(SELECT') ? value : `'${value}'`;
                    } else if (operator === 'notin') {
                        newOp = 'NOT IN';
                        newvalue = value.startsWith('(SELECT') ? value : `(${value.split(',').map(v => `'${v}'`).join(',')})`;
                    }

                    final += ` ${key} ${newOp} ${newvalue} `;
                } else {
                    final += condition.toLocaleUpperCase();
                }
                return final;
            }, '');
        }
    } catch (error) {
        throw error;
    }
}

module.exports = { insertQuery, updateQuery, whereClause };










// let LogicalExp = new RegExp("\\b(and|\\or)\\b", 'gim')
// let compare = new RegExp("(.*) (eq|like|in|gt|gte|lt|lte|noteq|notin) (.*)", 'gi')

// let insertQuery = (body = {}, tblName = '', output = '') => {
//     try {
//         let keys = []
//         let values = Object.entries(body).reduce((prv, [key, value], index, arr) => {
//             if (key != 'id') {
//                 if (value ) {
//                     // if (value || value == 0 || value == null) {
//                     prv += !isNaN(value) || value.startsWith('(SELECT') ? value : `'${value}'`
//                     keys.push(key)
//                     prv += ','
//                 }
//             }
//             return prv
//         }, ``)
//         // console.log(`INSERT INTO ${tblName} (${keys.join(',')}) ${output ? 'OUTPUT Inserted.' + output : ''} VALUES(${values.substring(0, values.length - 1)})`)

//         return `INSERT INTO ${tblName} (${keys.join(',')}) ${output ? 'OUTPUT Inserted.' + output : ''} VALUES(${values.substring(0, values.length - 1)})`
//     } catch (error) {
//         throw error
//     }
// }



// let updateQuery = (body = {}, tblName = '', search = '') => {
//     try {
//         let param = Object.entries(body).reduce((prv, [key, value], index, arr) => {
//             if (key != 'id') {
//                 if (value != '' && value == null, value != undefined) {
//                     prv += `${key}='${value}'`
//                     prv += ','
//                 }
//             }
//             return prv
//         }, '')

//         return `UPDATE ${tblName} SET ${param.substring(0, param.length - 1)} WHERE ${search}`
//     } catch (error) {
//         throw error
//     }
// }

// let whereClause = (str = '') => {
//     try {
//         if (!str) throw `Empty Params`
//         else {
//             let spiltValue = str.split(LogicalExp)
//             return spiltValue.reduce((final, cond) => {
//                 let condition = cond.trim()
//                 if (!condition.match(LogicalExp)) {
//                     let [, key, operator, value] = condition.split(compare)
//                     let newOp, newvalue
//                     if (operator == 'eq') {
//                         newOp = '='

//                         newvalue = value.startsWith('(SELECT') ? value : `'${value}'`

//                     } else if (operator == 'like') {
//                         newOp = operator
//                         if (value.match(new RegExp('%', 'gi'))) {
//                             newvalue = `'${value}'`
//                         } else {
//                             newvalue = `'%${value}%'`
//                         }
//                     } else if (operator == 'in') {
//                         newOp = operator
//                         newvalue = `(${value.split(',').map(v => `'${v}'`).join(',')})`
//                     } else if (operator == 'gt') {
//                         newOp = '>'
//                         newvalue = `'${value}'`
//                     } else if (operator == 'gte') {
//                         newOp = '>='
//                         newvalue = `'${value}'`
//                     } else if (operator == 'lt') {
//                         newOp = '<'
//                         newvalue = `'${value}'`
//                     } else if (operator == 'lte') {
//                         newOp = '<='
//                         newvalue = `'${value}'`
//                     } else if (operator == 'noteq') {
//                         newOp = '!='
//                         newvalue = `'${value}'`
//                     } else if (operator == 'notin') {
//                         newOp = 'NOT IN'
//                         newvalue = `${value}`
//                     }


//                     final += ` ${key} ${newOp} ${newvalue} `
//                 } else {
//                     final += condition.toLocaleUpperCase()
//                 }
//                 return final
//             }, '')
//         }
//     } catch (error) {
//         throw error
//     }
// }




// module.exports = { insertQuery, updateQuery, whereClause }
