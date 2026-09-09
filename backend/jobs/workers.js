const { Worker } = require('bullmq');
const { redisClient } = require('../config/redis');
const Order = require('../models/Order');

function initWorkers() {
  if (!redisClient) return;

  try {
    const worker = new Worker(
      'KoreBackgroundJobs',
      async (job) => {
        console.log(`[BullMQ Worker] Processing job: ${job.name} (ID: ${job.id})`);

        if (job.name === 'cancel_unpaid_order') {
          const { orderId } = job.data;
          const order = await Order.findById(orderId);
          if (order && order.paymentStatus === 'pending' && order.status === 'pending') {
            order.status = 'cancelled';
            order.cancelledAt = new Date();
            order.statusHistory.push({ status: 'cancelled' });
            await order.save();
            console.log(`[BullMQ Worker] Order #${order.orderNumber} auto-cancelled.`);
          }
        }
      },
      { connection: redisClient }
    );

    worker.on('failed', (job, err) => {
      console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err.message);
    });
  } catch (e) {
    console.warn('⚠️ BullMQ Worker setup skipped.');
  }
}

module.exports = { initWorkers };
