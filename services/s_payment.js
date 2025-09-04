const Razorpay = require('razorpay');
const crypto = require('crypto');
// const lib = require('../libs/dbConnection');
const lib = require('../libs/index');
const { sendEmail } = require('../libs/email');

const service = {};

// Initialize Razorpay client
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Generate monthly payment dues for an agreement
service.generateMonthlyDues = async (req, res) => {
    try {
        const { agreement_id } = req.body;
        const agreementQuery = `SELECT * FROM agreement WHERE agreement_id = ${agreement_id}`;
        const [agreement] = await lib.queryExecute(agreementQuery);

        if (!agreement) {
            return res.status(404).send({ message: 'Agreement not found' });
        }

        const { start_date, end_date, rent_amount, tenent_id, owner_id } = agreement;
        let currentDate = new Date(start_date);
        const lastDate = new Date(end_date);

        while (currentDate <= lastDate) {
            const dueDate = currentDate.toISOString().slice(0, 10);
            const insertQuery = `
                INSERT INTO payment (agreement_id, tenent_id, owner_id, amount_paid, due_date, status)
                VALUES (${agreement_id}, ${tenent_id}, ${owner_id}, ${rent_amount}, '${dueDate}', 0)
            `;
            await lib.queryExecute(insertQuery);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        res.status(200).send({ message: 'Monthly dues generated successfully!' });
    } catch (error) {
        console.error('Error in generateMonthlyDues:', error);
        res.status(500).send({ message: error.message });
    }
};

// Get all payment dues for a specific agreement
service.getPaymentsByAgreement = async (req, res) => {
    try {
        const { agreement_id } = req.params;
        const query = `SELECT * FROM payment WHERE agreement_id = ${agreement_id} ORDER BY due_date ASC`;
        const payments = await lib.queryExecute(query);
        res.status(200).send(payments);
    } catch (error) {
        console.error('Error fetching payments by agreement:', error);
        res.status(500).send({ message: error.message });
    }
};

// Create a Razorpay order for payment
service.createOrder = async (req, res) => {
    try {
        const { amount, payment_id } = req.body;
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: 'INR',
            receipt: `receipt_payment_${payment_id}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).send({ message: 'Failed to create order' });
    }
};

// Verify payment and update status
service.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is successful
            const updateQuery = `
                UPDATE payment 
                SET status = 1, 
                    payment_date = NOW(), 
                    method = 'Online', 
                    transaction_id = '${razorpay_payment_id}'
                WHERE payment_id = ${payment_id}
            `;
            await lib.queryExecute(updateQuery);

            // Fetch payment and tenant details for email notification
            const detailsQuery = `
                SELECT 
                    p.amount_paid,
                    p.payment_date,
                    p.transaction_id,
                    t.tenent_name,
                    t.email_id
                FROM payment p
                JOIN tenent t ON p.tenent_id = t.tenent_id
                WHERE p.payment_id = ${payment_id}
            `;
            const [paymentDetails] = await lib.queryExecute(detailsQuery);

            if (paymentDetails) {
                const { tenent_name, email, amount_paid, payment_date, transaction_id } = paymentDetails;
                const subject = 'Payment Confirmation';
                const html = `<p>Dear ${tenent_name},</p>
                            <p>Your payment of ₹${amount_paid} has been successfully processed on ${new Date(payment_date).toLocaleDateString()}.</p>
                            <p>Transaction ID: ${transaction_id}</p>
                            <p>Thank you,</p>
                            <p>Rent Management</p>`;
                await sendEmail(email, subject, html);
            }

            res.status(200).send({ status: 'success', message: 'Payment verified successfully.' });
        } else {
            // Payment verification failed
            const updateQuery = `UPDATE payment SET status = 2 WHERE payment_id = ${payment_id}`;
            await lib.queryExecute(updateQuery);
            res.status(400).send({ status: 'failure', message: 'Payment verification failed.' });
        }
    } catch (error) {
        console.error('Error in payment verification:', error);
        res.status(500).send({ message: error.message });
    }
};

// Get upcoming payment dues for reminders
service.getUpcomingDues = async () => {
    try {
        const query = `
            SELECT 
                p.payment_id,
                p.amount_paid,
                p.due_date,
                t.tenent_name,
                t.email_id
            FROM payment p
            JOIN tenent t ON p.tenent_id = t.tenent_id
            WHERE 
                p.status = 0 AND -- 0 for due
                p.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 5 DAY);
        `;
        const dues = await lib.queryExecute(query);
        return dues;
    } catch (error) {
        console.error('Error fetching upcoming dues:', error);
        throw error;
    }
};

service.getPaymentStats = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).send({ message: 'User ID is required' });
        }

        const query = `
            SELECT 
                SUM(CASE WHEN status = 1 THEN amount_paid ELSE 0 END) as totalPaid,
                SUM(CASE WHEN status = 0 THEN amount_paid ELSE 0 END) as totalDue
            FROM payment 
            WHERE owner_id = ${userId}
        `;

        const [result] = await lib.queryExecute(query);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error in getPaymentStats:', error);
        res.status(500).send({ message: error.message });
    }
};

// Create a Razorpay Payment Link
service.createPaymentLink = async (paymentDetails) => {
    try {
        const { amount_paid, payment_id, tenent_name, email } = paymentDetails;

        const paymentLinkRequest = {
            amount: amount_paid * 100, // Amount in paise
            currency: 'INR',
            accept_partial: false,
            description: `Rent Payment for Payment ID: ${payment_id}`,
            customer: {
                name: tenent_name,
                email: email,
            },
            notify: {
                sms: false,
                email: false // We are sending our own email
            },
            reminder_enable: false,
            notes: {
                payment_id: payment_id,
            },
            callback_url: `${process.env.URL}success.html`,
            callback_method: 'get'
        };

        const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);
        return paymentLink;

    } catch (error) {
        console.error('Error creating Razorpay payment link:', error);
        throw error;
    }
};

// Manually send a payment reminder for a specific due payment
service.sendPaymentReminder = async (req, res) => {
    try {
        const { payment_id } = req.params;

        // Fetch payment and tenant details
        const query = `
            SELECT 
                p.payment_id,
                p.amount_paid,
                p.due_date,
                t.tenent_name,
                t.email_id as email
            FROM payment p
            JOIN tenent t ON p.tenent_id = t.tenent_id
            WHERE p.payment_id = ${payment_id} AND p.status = 0
        `;
        const [due] = await lib.queryExecute(query);

        if (!due) {
            return res.status(404).send({ message: 'Due payment not found or already paid.' });
        }

        // Create a Razorpay payment link
        const paymentLink = await service.createPaymentLink(due);

        const subject = 'Upcoming Rent Payment Reminder';
        const html = `<p>Dear ${due.tenent_name},</p>
                    <p>This is a reminder that your rent payment of ₹${due.amount_paid} is due on ${new Date(due.due_date).toLocaleDateString()}.</p>
                    <p>Please use the link below to complete your payment.</p>
                    <a href="${paymentLink.short_url}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Pay Now</a>
                    <p>If the button doesn't work, copy and paste this link into your browser: ${paymentLink.short_url}</p>
                    <p>Thank you,</p>
                    <p>Rent Management</p>`;

        await sendEmail(due.email, subject, html);

        res.status(200).send({ message: 'Payment reminder sent successfully.' });
    } catch (error) {
        console.error('Error sending payment reminder:', error);
        res.status(500).send({ message: 'Failed to send payment reminder.' });
    }
};

module.exports = service; 