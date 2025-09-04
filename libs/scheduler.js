const cron = require('node-cron');
const { queryExecute } = require('./dbRequest');
const { createPaymentDueNotification, createAgreementExpiringNotification } = require('../routes/notifications');
const moment = require('moment');

class Scheduler {
  constructor() {
    this.jobs = new Map();
    this.init();
  }

  init() {
    console.log('🚀 Initializing scheduled jobs...');
    
    // Schedule payment due reminders (daily at 9 AM)
    this.schedulePaymentReminders();
    
    // Schedule overdue payment notifications (daily at 10 AM)
    this.scheduleOverdueNotifications();
    
    // Schedule agreement expiry notifications (daily at 11 AM)
    this.scheduleAgreementExpiryNotifications();
    
    // Schedule payment schedule status updates (daily at 12 AM)
    this.schedulePaymentStatusUpdates();
    
    // Schedule system cleanup (weekly on Sunday at 2 AM)
    this.scheduleSystemCleanup();
    
    console.log('✅ Scheduled jobs initialized successfully');
  }

  /**
   * Schedule payment due reminders
   */
  schedulePaymentReminders() {
    const job = cron.schedule('0 9 * * *', async () => {
      try {
        console.log('📅 Running payment due reminders...');
        
        // Get payments due in the next 3 days
        const duePayments = await queryExecute(`
          SELECT 
            ps.id,
            ps.agreement_id,
            ps.due_date,
            ps.amount,
            ps.payment_type,
            a.tenant_id,
            t.name as tenant_name,
            t.email as tenant_email,
            p.title as property_title
          FROM payment_schedules ps
          JOIN agreements a ON ps.agreement_id = a.id
          JOIN users t ON a.tenant_id = t.id
          JOIN properties p ON a.property_id = p.id
          WHERE ps.status = 'pending'
          AND ps.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
          AND a.status = 'active'
        `);

        for (const payment of duePayments) {
          const daysUntilDue = moment(payment.due_date).diff(moment(), 'days');
          
          if (daysUntilDue <= 3) {
            await createPaymentDueNotification(
              payment.agreement_id,
              payment.due_date,
              payment.amount
            );
            
            console.log(`📧 Payment reminder sent for agreement ${payment.agreement_id}`);
          }
        }
        
        console.log(`✅ Payment reminders completed. Sent ${duePayments.length} reminders.`);
      } catch (error) {
        console.error('❌ Error in payment reminders:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    this.jobs.set('paymentReminders', job);
  }

  /**
   * Schedule overdue payment notifications
   */
  scheduleOverdueNotifications() {
    const job = cron.schedule('0 10 * * *', async () => {
      try {
        console.log('📅 Running overdue payment notifications...');
        
        // Get overdue payments
        const overduePayments = await queryExecute(`
          SELECT 
            ps.id,
            ps.agreement_id,
            ps.due_date,
            ps.amount,
            ps.payment_type,
            a.tenant_id,
            a.owner_id,
            t.name as tenant_name,
            t.email as tenant_email,
            o.name as owner_name,
            o.email as owner_email,
            p.title as property_title,
            DATEDIFF(CURDATE(), ps.due_date) as days_overdue
          FROM payment_schedules ps
          JOIN agreements a ON ps.agreement_id = a.id
          JOIN users t ON a.tenant_id = t.id
          JOIN users o ON a.owner_id = o.id
          JOIN properties p ON a.property_id = p.id
          WHERE ps.status = 'pending'
          AND ps.due_date < CURDATE()
          AND a.status = 'active'
        `);

        for (const payment of overduePayments) {
          // Update payment schedule status to overdue
          await queryExecute(
            'UPDATE payment_schedules SET status = "overdue" WHERE id = ?',
            [payment.id]
          );

          // Create notification for tenant
          await queryExecute(`
            INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            payment.tenant_id,
            'Payment Overdue',
            `Your payment of ₹${payment.amount} for ${payment.property_title} is overdue by ${payment.days_overdue} days. Please make the payment immediately to avoid penalties.`,
            'payment_due',
            payment.agreement_id,
            'agreement'
          ]);

          // Create notification for owner
          await queryExecute(`
            INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            payment.owner_id,
            'Tenant Payment Overdue',
            `Payment of ₹${payment.amount} from tenant ${payment.tenant_name} for ${payment.property_title} is overdue by ${payment.days_overdue} days.`,
            'payment_due',
            payment.agreement_id,
            'agreement'
          ]);
          
          console.log(`📧 Overdue notification sent for payment ${payment.id}`);
        }
        
        console.log(`✅ Overdue notifications completed. Processed ${overduePayments.length} overdue payments.`);
      } catch (error) {
        console.error('❌ Error in overdue notifications:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    this.jobs.set('overdueNotifications', job);
  }

  /**
   * Schedule agreement expiry notifications
   */
  scheduleAgreementExpiryNotifications() {
    const job = cron.schedule('0 11 * * *', async () => {
      try {
        console.log('📅 Running agreement expiry notifications...');
        
        // Get agreements expiring in the next 30 days
        const expiringAgreements = await queryExecute(`
          SELECT 
            a.id,
            a.end_date,
            a.tenant_id,
            a.owner_id,
            t.name as tenant_name,
            t.email as tenant_email,
            o.name as owner_name,
            o.email as owner_email,
            p.title as property_title,
            DATEDIFF(a.end_date, CURDATE()) as days_until_expiry
          FROM agreements a
          JOIN users t ON a.tenant_id = t.id
          JOIN users o ON a.owner_id = o.id
          JOIN properties p ON a.property_id = p.id
          WHERE a.status = 'active'
          AND a.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        `);

        for (const agreement of expiringAgreements) {
          // Send notifications at different intervals
          if (agreement.days_until_expiry <= 7 || 
              agreement.days_until_expiry === 15 || 
              agreement.days_until_expiry === 30) {
            
            await createAgreementExpiringNotification(
              agreement.id,
              agreement.end_date
            );
            
            console.log(`📧 Agreement expiry notification sent for agreement ${agreement.id}`);
          }
        }
        
        console.log(`✅ Agreement expiry notifications completed. Processed ${expiringAgreements.length} agreements.`);
      } catch (error) {
        console.error('❌ Error in agreement expiry notifications:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    this.jobs.set('agreementExpiryNotifications', job);
  }

  /**
   * Schedule payment status updates
   */
  schedulePaymentStatusUpdates() {
    const job = cron.schedule('0 0 * * *', async () => {
      try {
        console.log('📅 Running payment status updates...');
        
        // Update overdue payment schedules
        const result = await queryExecute(`
          UPDATE payment_schedules 
          SET status = 'overdue' 
          WHERE status = 'pending' 
          AND due_date < CURDATE()
        `);
        
        console.log(`✅ Payment status updates completed. Updated ${result.affectedRows} payment schedules.`);
      } catch (error) {
        console.error('❌ Error in payment status updates:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    this.jobs.set('paymentStatusUpdates', job);
  }

  /**
   * Schedule system cleanup
   */
  scheduleSystemCleanup() {
    const job = cron.schedule('0 2 * * 0', async () => {
      try {
        console.log('📅 Running system cleanup...');
        
        // Clean up old notifications (older than 90 days)
        const notificationsResult = await queryExecute(`
          DELETE FROM notifications 
          WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
          AND is_read = 1
        `);
        
        // Clean up old payment proofs (older than 1 year)
        const oldPayments = await queryExecute(`
          SELECT payment_proof 
          FROM payments 
          WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
          AND payment_proof IS NOT NULL
        `);
        
        // Delete old files (this would require file system operations)
        // In production, you might want to use cloud storage with lifecycle policies
        
        console.log(`✅ System cleanup completed. Cleaned up ${notificationsResult.affectedRows} old notifications.`);
      } catch (error) {
        console.error('❌ Error in system cleanup:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    this.jobs.set('systemCleanup', job);
  }

  /**
   * Manually trigger payment reminders
   */
  async triggerPaymentReminders() {
    try {
      console.log('🔧 Manually triggering payment reminders...');
      
      const duePayments = await queryExecute(`
        SELECT 
          ps.id,
          ps.agreement_id,
          ps.due_date,
          ps.amount,
          ps.payment_type,
          a.tenant_id,
          t.name as tenant_name,
          t.email as tenant_email,
          p.title as property_title
        FROM payment_schedules ps
        JOIN agreements a ON ps.agreement_id = a.id
        JOIN users t ON a.tenant_id = t.id
        JOIN properties p ON a.property_id = p.id
        WHERE ps.status = 'pending'
        AND ps.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND a.status = 'active'
      `);

      for (const payment of duePayments) {
        await createPaymentDueNotification(
          payment.agreement_id,
          payment.due_date,
          payment.amount
        );
      }
      
      return {
        success: true,
        message: `Payment reminders sent for ${duePayments.length} payments`,
        count: duePayments.length
      };
    } catch (error) {
      console.error('❌ Error in manual payment reminders:', error);
      return {
        success: false,
        message: 'Failed to send payment reminders',
        error: error.message
      };
    }
  }

  /**
   * Manually trigger overdue notifications
   */
  async triggerOverdueNotifications() {
    try {
      console.log('🔧 Manually triggering overdue notifications...');
      
      const overduePayments = await queryExecute(`
        SELECT 
          ps.id,
          ps.agreement_id,
          ps.due_date,
          ps.amount,
          ps.payment_type,
          a.tenant_id,
          a.owner_id,
          t.name as tenant_name,
          o.name as owner_name,
          p.title as property_title,
          DATEDIFF(CURDATE(), ps.due_date) as days_overdue
        FROM payment_schedules ps
        JOIN agreements a ON ps.agreement_id = a.id
        JOIN users t ON a.tenant_id = t.id
        JOIN users o ON a.owner_id = o.id
        JOIN properties p ON a.property_id = p.id
        WHERE ps.status = 'pending'
        AND ps.due_date < CURDATE()
        AND a.status = 'active'
      `);

      for (const payment of overduePayments) {
        // Update status to overdue
        await queryExecute(
          'UPDATE payment_schedules SET status = "overdue" WHERE id = ?',
          [payment.id]
        );

        // Create notifications
        await queryExecute(`
          INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          payment.tenant_id,
          'Payment Overdue',
          `Your payment of ₹${payment.amount} for ${payment.property_title} is overdue by ${payment.days_overdue} days.`,
          'payment_due',
          payment.agreement_id,
          'agreement'
        ]);

        await queryExecute(`
          INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          payment.owner_id,
          'Tenant Payment Overdue',
          `Payment of ₹${payment.amount} from tenant ${payment.tenant_name} for ${payment.property_title} is overdue.`,
          'payment_due',
          payment.agreement_id,
          'agreement'
        ]);
      }
      
      return {
        success: true,
        message: `Overdue notifications sent for ${overduePayments.length} payments`,
        count: overduePayments.length
      };
    } catch (error) {
      console.error('❌ Error in manual overdue notifications:', error);
      return {
        success: false,
        message: 'Failed to send overdue notifications',
        error: error.message
      };
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    console.log('🛑 Stopping all scheduled jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`✅ Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get job status
   */
  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }
}

// Create singleton instance
const scheduler = new Scheduler();

module.exports = scheduler; 