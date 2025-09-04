// Dependencies NODE_Module
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    dotenv = require('dotenv').config(),
    path = require('path'),
    cookieParser = require('cookie-parser');

const fileUpload = require('express-fileupload');

let lib = require("./libs/index");
let loginCheck = require("./services/s_login");
let port = process.env.PORT || 5000;
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        const fileExt = path.extname(filePath).toLowerCase();
        const viewableExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
        if (viewableExtensions.includes(fileExt)) {
            res.setHeader('Content-Disposition', 'inline');
        }
    }
}));
app.use(cors())
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Headers", "authToken", "Content-Type");
//     next();
// });
app.use('/fileAttachment', express.static('fileAttachment'));
app.use(express.json());
app.use(bodyParser.json({ limit: '80mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'web')));
app.use(express.static(path.join(__dirname, './web/build')));
app.use(/^(?!\/)/i, (req, res) => res.sendFile(path.join(__dirname, "./web/build", 'index.html')))
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ........mastrerrouter......//

const login = require('./routes/r_login')
const userRoutes = require('./routes/r_user_master');
const dashboardRoutes = require('./routes/r_dashboard');
const deliveryentry = require('./routes/r_delivery_entry.js')
const tenant = require('./routes/r_tenant.js')
const owner = require('./routes/r_owner.js')
const property = require('./routes/r_property.js')
const agreement = require('./routes/r_agreement.js')
const payment = require('./routes/r_payment.js')

// const testEmailRoute = require('./routes/r_test_email');
// app.use(testEmailRoute);

app.use('/api/login', login)
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/deliveryentry', deliveryentry)
app.use('/api/tenant', tenant)
app.use('/api/owner', owner)
app.use('/api/property', property)
app.use('/api/agreement', agreement)
app.use('/api/payment', payment)

app.get('/', (req, res) => {    
    res.send("hello");
});

app.listen(port, () => {
    console.log(`SERVER ${port} is running.....`)
})

// Import and run the scheduler tasks
const { runExpirationTask, startScheduledTask, runPaymentReminderTask } = require('./cron/scheduler');

// Run tasks once on startup
runExpirationTask();
runPaymentReminderTask();

// Start the daily scheduled tasks
startScheduledTask();

module.exports = app;