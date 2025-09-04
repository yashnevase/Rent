let queue = require('queue')

let QueueIndent = queue()
let QueuePO = queue()
let QueueGRN = queue()
let QueueDSR = queue()
let QueueInvoice = queue()
let QueueDNote = queue()



QueueIndent.concurrency = 1
QueueIndent.autostart = true
QueueIndent.timeout = 5000
QueueIndent.start(function (err) {
    if (err) throw err
})


QueuePO.concurrency = 1
QueuePO.autostart = true
QueuePO.timeout = 5000
QueuePO.start(function (err) {
    if (err) throw err
})

QueueGRN.concurrency = 1
QueueGRN.autostart = true
QueueGRN.timeout = 5000
QueueGRN.start(function (err) {
    if (err) throw err
})

QueueDSR.concurrency = 1
QueueDSR.autostart = true
QueueDSR.timeout = 5000
QueueDSR.start(function (err) {
    if (err) throw err
})

QueueInvoice.concurrency = 1
QueueInvoice.autostart = true
QueueInvoice.timeout = 5000
QueueInvoice.start(function (err) {
    if (err) throw err
})

QueueDNote.concurrency = 1
QueueDNote.autostart = true
QueueDNote.timeout = 5000
QueueDNote.start(function (err) {
    if (err) throw err
})

module.exports = {QueueDNote,QueueDSR,QueueGRN,QueueIndent,QueueInvoice,QueuePO}
