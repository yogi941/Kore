const { Queue } = require('bullmq');
const { redisClient, isRedisConnected } = require('../config/redis');

let orderQueue = null;

// Initialize BullMQ Queue if Redis is available
try {
  if (redisClient) {
    orderQueue = new Queue('KoreBackgroundJobs', {
      connection: redisClient,
    });
  }
} catch (e) {
  console.warn('⚠️ BullMQ Queue init skipped (Redis offline). Jobs will run in fallback timeout mode.');
}

/**
 * Schedule automatic cancellation for unpaid orders after 15 minutes
 * @param {string} orderId 
 * @param {number} delayMs 
 */
async function scheduleUnpaidOrderCancellation(orderId, delayMs = 15 * 60 * 1000) {
  if (orderQueue && isRedisConnected()) {
    await orderQueue.add(
      'cancel_unpaid_order',
      { orderId },
      { delay: delayMs, jobId: `cancel_${orderId}` }
    );
  } else {
    // Graceful in-memory setTimeout fallback for dev environments
    setTimeout(async () => {
      try {
        const Order = require('../models/Order');
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus === 'pending' && order.status === 'pending') {
          order.status = 'cancelled';
          order.cancelledAt = new Date();
          order.statusHistory.push({ status: 'cancelled' });
          await order.save();
          console.log(`[Job Worker - Fallback] Order #${order.orderNumber} auto-cancelled due to payment timeout.`);
        }
      } catch (err) {
        console.error('Error in order cancellation fallback:', err.message);
      }
    }, delayMs);
  }
}

module.exports = {
  orderQueue,
  scheduleUnpaidOrderCancellation,
};
