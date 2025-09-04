const cron = require('node-cron');
const agreementService = require('../services/s_agreement');
const paymentService = require('../services/s_payment');
const { sendEmail } = require('../libs/email');

// Task to expire agreements
const runExpirationTask = async () => {
    console.log('Running task to expire agreements...');
    try {
        await agreementService.expireAgreements();
        console.log('Agreement expiration task completed successfully.');
    } catch (error) {
        console.error('Error running agreement expiration task:', error);
    }
};

// Task to send payment reminders
const runPaymentReminderTask = async () => {
    console.log('Running task to send payment reminders...');
    try {
        const upcomingDues = await paymentService.getUpcomingDues();
        for (const due of upcomingDues) {
            // Create a Razorpay payment link for each due payment
            const paymentLink = await paymentService.createPaymentLink(due);
            
            const subject = 'Upcoming Rent Payment Reminder';
            const html = `<p>Dear ${due.tenent_name},</p>
                        <p>This is a reminder that your rent payment of ₹${due.amount_paid} is due on ${new Date(due.due_date).toLocaleDateString()}.</p>
                        <p>Please use the link below to complete your payment.</p>
                        <a href="${paymentLink.short_url}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Pay Now</a>
                        <p>If the button doesn't work, copy and paste this link into your browser: ${paymentLink.short_url}</p>
                        <p>Thank you,</p>
                        <p>Rent Management</p>`;
            
            await sendEmail(due.email, subject, html);
        }
        console.log('Payment reminder task completed successfully.');
    } catch (error) {
        console.error('Error running payment reminder task:', error);
    }
};

// Schedule tasks
const startScheduledTask = () => {
    // Schedule agreement expiration task daily at midnight
    cron.schedule('0 0 * * *', runExpirationTask, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    console.log('Scheduler for expiring agreements has been started.');

    // Schedule payment reminder task daily at 9 AM
    cron.schedule('0 9 * * *', runPaymentReminderTask, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    console.log('Scheduler for payment reminders has been started.');
};

module.exports = {
    runExpirationTask,
    runPaymentReminderTask,
    startScheduledTask
};
