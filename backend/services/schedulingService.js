/**
 * Intelligent Kitchen Order Scheduling Service
 * Uses Priority Queue + Shortest Processing Time (SPT) + Pickup Deadline Urgency + Starvation Aging
 */

/**
 * Calculates priority score and reason breakdown for a single order
 * @param {Object} order - Order object with items, createdAt, pickupSlot, etc.
 * @param {number} kitchenWorkload - Current count of items currently in 'preparing' state
 * @returns {Object} { priorityScore, priorityLevel, priorityReason, estPrepTime, ageMinutes, urgencyMinutes }
 */
function calculateOrderPriority(order, kitchenWorkload = 0) {
  const now = new Date();
  
  // 1. Calculate Estimated Preparation Time (SPT)
  let estPrepTime = 0;
  if (order.items && order.items.length > 0) {
    estPrepTime = order.items.reduce((sum, item) => {
      const itemPrep = (item.menuItem && item.menuItem.preparationTime) || item.preparationTime || 8;
      return sum + (itemPrep * Math.min(item.quantity, 3));
    }, 0);
  } else {
    estPrepTime = 10;
  }
  
  // Workload adjustment factor
  if (kitchenWorkload > 10) {
    estPrepTime *= 1.2;
  }

  // 2. Shortest Processing Time Score (0 - 100)
  // Faster orders get higher initial priority for fast throughput
  const sptScore = Math.min(100, (1000 / Math.max(2, estPrepTime)));

  // 3. Pickup Deadline & Urgency Score
  let deadlineMinutes = 30; // Default 30 min window if no slot specified
  if (order.pickupSlot && order.pickupSlot.label) {
    const slotLabel = order.pickupSlot.label;
    if (slotLabel.includes('Morning') || slotLabel.includes('Breakfast')) {
      deadlineMinutes = 15;
    } else if (slotLabel.includes('Lunch')) {
      deadlineMinutes = 20;
    }
  }
  
  const createdTime = new Date(order.createdAt || Date.now());
  const ageMinutes = Math.max(0, Math.floor((now - createdTime) / 60000));
  const remainingDeadlineMinutes = Math.max(0, deadlineMinutes - ageMinutes);

  const urgencyScore = remainingDeadlineMinutes <= 5 ? 100 
    : remainingDeadlineMinutes <= 15 ? 75 
    : remainingDeadlineMinutes <= 30 ? 50 
    : 25;

  // 4. Aging Mechanism (Prevents Starvation of long/complex orders)
  // Adds +6 points for every minute waiting in queue
  const agingScore = ageMinutes * 6;

  // 5. Total Combined Priority Score
  // Weighted: 30% SPT, 40% Urgency, 30% Aging Boost
  const rawScore = (sptScore * 0.30) + (urgencyScore * 0.40) + agingScore;
  const priorityScore = Math.round(Math.min(999, rawScore));

  // Determine Level
  let priorityLevel = 'Standard';
  if (priorityScore >= 120 || remainingDeadlineMinutes <= 5) {
    priorityLevel = 'Urgent';
  } else if (priorityScore >= 70 || ageMinutes >= 15) {
    priorityLevel = 'High';
  }

  // Generate clear reason description
  const reasons = [];
  if (estPrepTime <= 6) reasons.push(`Quick prep (${Math.round(estPrepTime)}m)`);
  else if (estPrepTime > 15) reasons.push(`Heavy prep (${Math.round(estPrepTime)}m)`);
  
  if (remainingDeadlineMinutes <= 5) reasons.push('Pickup Imminent!');
  else if (remainingDeadlineMinutes <= 15) reasons.push(`Pickup in ${remainingDeadlineMinutes}m`);

  if (ageMinutes >= 10) reasons.push(`Aged ${ageMinutes}m in queue`);

  const priorityReason = reasons.length > 0 ? reasons.join(' • ') : `Standard order queue rank`;

  return {
    priorityScore,
    priorityLevel,
    priorityReason,
    estPrepTime: Math.round(estPrepTime),
    ageMinutes,
    urgencyMinutes: remainingDeadlineMinutes,
  };
}

/**
 * Priority Queue Sorting for Kitchen Dashboard
 * Sorts pending/accepted orders by priorityScore in descending order (Highest priority first)
 * @param {Array} orders - Array of order documents
 * @param {number} kitchenWorkload - Total items preparing
 * @returns {Array} Orders enriched with scheduling details and sorted by priority
 */
function scheduleKitchenQueue(orders, kitchenWorkload = 0) {
  if (!orders || !Array.isArray(orders)) return [];

  const scheduled = orders.map((order) => {
    const orderObj = order.toObject ? order.toObject() : { ...order };
    const priorityDetails = calculateOrderPriority(orderObj, kitchenWorkload);
    return {
      ...orderObj,
      scheduling: priorityDetails,
    };
  });

  // Sort descending by priority score
  return scheduled.sort((a, b) => b.scheduling.priorityScore - a.scheduling.priorityScore);
}

module.exports = {
  calculateOrderPriority,
  scheduleKitchenQueue,
};
