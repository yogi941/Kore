const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

/**
 * Recommends personalized menu items for a student based on:
 * 1. Frequent order categories
 * 2. Time-of-day contextual relevance
 * 3. Bestsellers / popular campus items fallback
 */
async function getStudentRecommendations(userId, canteenId = null, limit = 6) {
  try {
    const currentHour = new Date().getHours();
    let preferredCategory = 'lunch';

    if (currentHour >= 7 && currentHour < 11) preferredCategory = 'breakfast';
    else if (currentHour >= 11 && currentHour < 15) preferredCategory = 'lunch';
    else if (currentHour >= 15 && currentHour < 19) preferredCategory = 'snacks';
    else preferredCategory = 'dinner';

    // 1. Fetch user's order history if available
    let userCategoryCounts = {};
    if (userId) {
      const userOrders = await Order.find({ student: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('items.menuItem');

      userOrders.forEach((ord) => {
        (ord.items || []).forEach((it) => {
          const cat = it.menuItem?.category || 'lunch';
          userCategoryCounts[cat] = (userCategoryCounts[cat] || 0) + 1;
        });
      });
    }

    // Find top user category
    let userFavoriteCat = Object.keys(userCategoryCounts).reduce(
      (a, b) => (userCategoryCounts[a] > userCategoryCounts[b] ? a : b),
      preferredCategory
    );

    const query = { isAvailable: true };
    if (canteenId) query.canteen = canteenId;

    // Fetch candidate items
    const candidateItems = await MenuItem.find(query).populate('canteen', 'name location');

    // Score candidates
    const scoredItems = candidateItems.map((item) => {
      let score = item.totalOrdered || 0;
      let reason = 'Trending Bestseller';

      if (item.category === userFavoriteCat) {
        score += 50;
        reason = `Based on your favorite ${item.category}`;
      } else if (item.category === preferredCategory) {
        score += 30;
        reason = `Popular for ${preferredCategory.toUpperCase()}`;
      }

      return {
        ...item.toObject(),
        recommendationScore: score,
        recommendationReason: reason,
      };
    });

    // Sort descending by score
    scoredItems.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scoredItems.slice(0, limit);
  } catch (err) {
    console.error('Recommendation engine error:', err.message);
    const fallbackItems = await MenuItem.find({ isAvailable: true }).limit(limit).populate('canteen', 'name');
    return fallbackItems.map((item) => ({
      ...item.toObject(),
      recommendationReason: 'Campus Favorite',
    }));
  }
}

module.exports = {
  getStudentRecommendations,
};
