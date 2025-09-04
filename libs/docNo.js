let q = require('./queue')
const lib = require('./dbRequest')
let docNo = (tableName,colName,docName)=>{
    let str = `(SELECT '${docName}' + Convert(varchar(50),sum(case when InvNo like '%${docName}%' then 1 else 0 end)+1)  from ${tableName} im)`
    return str
}



module.exports = {docNo}