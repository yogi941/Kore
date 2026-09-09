const { calculateOrderPriority, scheduleKitchenQueue } = require('./schedulingService');

console.log('--- TESTING INTELLIGENT ORDER SCHEDULING SERVICE ---');

const mockOrders = [
  {
    _id: 'order_1',
    orderNumber: 'KCT-001',
    createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago (Aged order!)
    items: [{ menuItem: { preparationTime: 12 }, quantity: 2 }],
    pickupSlot: { label: 'Lunch Break (12:30 PM)' },
  },
  {
    _id: 'order_2',
    orderNumber: 'KCT-002',
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago (Quick SPT order!)
    items: [{ menuItem: { preparationTime: 3 }, quantity: 1 }],
    pickupSlot: { label: 'Lunch Break (12:30 PM)' },
  },
  {
    _id: 'order_3',
    orderNumber: 'KCT-003',
    createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago (Urgent deadline order!)
    items: [{ menuItem: { preparationTime: 8 }, quantity: 1 }],
    pickupSlot: { label: 'Morning Break (10:30 AM)' },
  },
];

const scheduledQueue = scheduleKitchenQueue(mockOrders, 5);

console.log('Scheduled Kitchen Queue Output:');
scheduledQueue.forEach((item, rank) => {
  console.log(`Rank #${rank + 1} | Order: ${item.orderNumber} | Score: ${item.scheduling.priorityScore} | Level: ${item.scheduling.priorityLevel} | Reason: ${item.scheduling.priorityReason}`);
});

console.log('--- TEST FINISHED SUCCESSFULLY ---');
