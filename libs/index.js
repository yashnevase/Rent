let cuQueryBuild = require('./dbQueryStr')
let execute = require('./dbRequest')
let auth = require('./auth')
let docNo = require('./docNo')
let queue = require('./queue')

let eventID = () =>{
    return `select id as eventId from dbo.Events order by id desc`
}

module.exports = {
    ...cuQueryBuild,...execute,...auth,...docNo,...queue, eventID, 
}