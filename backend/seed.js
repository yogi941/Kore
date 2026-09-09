const mongoose = require('mongoose');
const Canteen = require('./models/Canteen');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');
const Order = require('./models/Order');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kct-canteen';

const canteensData = [
  {
    name: 'Cafe Coffee Day (CCD)',
    location: 'Campus Plaza, Near Central Library',
    description: 'Premium coffee, cold frappes, pastries, garlic bread & gourmet sandwiches.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    isOpen: true,
    operatingHours: {
      breakfast: { open: '00:00', close: '23:59' },
      lunch: { open: '00:00', close: '23:59' },
      evening: { open: '00:00', close: '23:59' },
    },
    pickupSlots: [
      { label: 'Immediate Pickup (10 mins)', time: 'Fast preparation order', maxOrders: 100 },
      { label: 'Morning Break (10:30 AM)', time: 'Flexible pre-order', maxOrders: 100 },
      { label: 'Lunch Break (12:30 PM)', time: 'Flexible pre-order', maxOrders: 100 },
    ],
  },
  {
    name: 'Main Core - Food Counter',
    location: 'Main Core Complex, Counter 1',
    description: 'Main campus dining hall serving South Indian breakfast, authentic meals, biryanis & hot tea/coffee.',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80',
    isOpen: true,
    operatingHours: {
      breakfast: { open: '00:00', close: '23:59' },
      lunch: { open: '00:00', close: '23:59' },
      evening: { open: '00:00', close: '23:59' },
    },
    pickupSlots: [
      { label: 'Immediate Pickup (10 mins)', time: 'Fast preparation order', maxOrders: 100 },
      { label: 'Morning Break (10:30 AM)', time: 'Flexible pre-order', maxOrders: 100 },
      { label: 'Lunch Break (12:30 PM)', time: 'Flexible pre-order', maxOrders: 100 },
    ],
  },
  {
    name: 'Main Core - Burger Shop',
    location: 'Main Core Complex, Counter 2',
    description: 'Gourmet veg & non-veg burgers, cheesy wraps, peri peri fries & thick milkshakes.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    isOpen: true,
    operatingHours: {
      breakfast: { open: '00:00', close: '23:59' },
      lunch: { open: '00:00', close: '23:59' },
      evening: { open: '00:00', close: '23:59' },
    },
    pickupSlots: [
      { label: 'Immediate Pickup (10 mins)', time: 'Fast preparation order', maxOrders: 100 },
      { label: 'Lunch Break (12:45 PM)', time: 'Flexible pre-order', maxOrders: 100 },
      { label: 'Evening Snack (4:30 PM)', time: 'Flexible pre-order', maxOrders: 100 },
    ],
  },
  {
    name: 'Main Core - Fast Food & Chaat Corner',
    location: 'Main Core Complex, Counter 3 (Pani Puri Stall)',
    description: 'Mouth-watering Pani Puri, Sev Puri, Bhel Puri, Samosa Chaat, Pav Bhaji & Chinese Fried Rice/Noodles.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    isOpen: true,
    operatingHours: {
      breakfast: { open: '00:00', close: '23:59' },
      lunch: { open: '00:00', close: '23:59' },
      evening: { open: '00:00', close: '23:59' },
    },
    pickupSlots: [
      { label: 'Immediate Pickup (10 mins)', time: 'Fast preparation order', maxOrders: 100 },
      { label: 'Lunch Break (1:00 PM)', time: 'Flexible pre-order', maxOrders: 100 },
      { label: 'Evening Chaat Break (4:45 PM)', time: 'Flexible pre-order', maxOrders: 100 },
    ],
  },
];

const menuItemsData = {
  'Cafe Coffee Day (CCD)': [
    { name: 'Classic Cappuccino', description: 'Rich dark espresso topped with fluffy steamed milk foam', price: 90, category: 'beverages', preparationTime: 4, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80' },
    { name: 'Iced Hazelnut Frappe', description: 'Chilled double espresso blended with ice cream and hazelnut syrup', price: 120, category: 'beverages', preparationTime: 5, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80' },
    { name: 'Cheese Garlic Bread (4 Pcs)', description: 'Toasted baguette lathered with garlic butter and melted mozzarella', price: 85, category: 'snacks', preparationTime: 7, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&auto=format&fit=crop&q=80' },
    { name: 'Paneer Tikka Sandwich', description: 'Grilled multi-grain sandwich with spiced paneer tikka and mint mayo', price: 110, category: 'snacks', preparationTime: 8, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80' },
    { name: 'Blueberry Muffin', description: 'Freshly baked soft muffin studded with sweet blueberries', price: 75, category: 'snacks', preparationTime: 2, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&auto=format&fit=crop&q=80' },
  ],
  'Main Core - Food Counter': [
    { name: 'Ghee Roast Masala Dosa', description: 'Crispy golden rice crepe roasted in pure ghee, served with potato masala, sambar & chutneys', price: 65, category: 'breakfast', preparationTime: 6, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80' },
    { name: 'Idli Vada Combo (2 Idli + 1 Vada)', description: 'Steamed rice cakes and crispy medu vada served with piping hot sambar & coconut chutney', price: 50, category: 'breakfast', preparationTime: 4, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80' },
    { name: 'Poori Masala (3 Pcs)', description: 'Puffy deep-fried wheat breads served with spiced potato curry', price: 45, category: 'breakfast', preparationTime: 5, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80' },
    { name: 'South Indian Special Meals', description: 'Wholesome thali with Rice, Sambar, Rasam, Kara Kuzhambu, Poriyal, Appalam & Sweet', price: 95, category: 'lunch', preparationTime: 7, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop&q=80' },
    { name: 'Chicken Dum Biryani', description: 'Fragrant basmati rice slow-cooked with tender chicken and aromatic spices', price: 140, category: 'lunch', preparationTime: 10, isVeg: false, isAvailable: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80' },
    { name: 'Special Paneer Biryani', description: 'Basmati rice layers cooked with spiced cottage cheese cubes & fried onions', price: 115, category: 'lunch', preparationTime: 8, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=400&auto=format&fit=crop&q=80' },
    { name: 'Hot Ginger Tea & Samosa Combo', description: 'Cardamom ginger milk tea served with 1 hot potato samosa', price: 30, category: 'snacks', preparationTime: 3, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80' },
    { name: 'Traditional Filter Coffee', description: 'Hot South Indian brass filter coffee brewed with chicory', price: 20, category: 'beverages', preparationTime: 2, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80' },
  ],
  'Main Core - Burger Shop': [
    { name: 'Crispy Aloo Tikki Burger', description: 'Golden potato patty with lettuce, tomatoes, creamy mayonnaise & seeded bun', price: 75, category: 'snacks', preparationTime: 7, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80' },
    { name: 'Spicy Paneer Supreme Burger', description: 'Crumbed paneer patty coated in spicy marinade with cheese slice and harissa mayo', price: 115, category: 'snacks', preparationTime: 8, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80' },
    { name: 'Classic Crispy Chicken Burger', description: 'Crispy fried chicken breast fillet with tangy pickles and special burger sauce', price: 135, category: 'snacks', preparationTime: 10, isVeg: false, isAvailable: true, image: 'https://images.unsplash.com/photo-1615297928064-24977384d0da?w=400&auto=format&fit=crop&q=80' },
    { name: 'Peri Peri French Fries', description: 'Crispy potato fries tossed in fiery African peri-peri spice mix', price: 85, category: 'snacks', preparationTime: 6, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80' },
    { name: 'Cheesy Chicken Wrap', description: 'Grilled chicken strips with melted cheddar, lettuce & mayo wrapped in soft tortilla', price: 125, category: 'snacks', preparationTime: 9, isVeg: false, isAvailable: true, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop&q=80' },
    { name: 'Belgian Chocolate Thick Shake', description: 'Ultra-rich dark chocolate ice cream milkshake topped with chocolate chips', price: 95, category: 'beverages', preparationTime: 5, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80' },
  ],
  'Main Core - Fast Food & Chaat Corner': [
    { name: 'Classic Pani Puri (8 Pcs)', description: 'Crispy hollow puris filled with spiced potato-sprouts & tangy sweet mint water', price: 40, category: 'snacks', preparationTime: 3, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80' },
    { name: 'Loaded Sev Puri (6 Pcs)', description: 'Flat crispy puris topped with diced potatoes, onions, chutneys & fine nylon sev', price: 50, category: 'snacks', preparationTime: 4, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80' },
    { name: 'Spiced Bhel Puri', description: 'Puffed rice mixed with onions, tomatoes, sweet & spicy chutneys and coriander', price: 45, category: 'snacks', preparationTime: 3, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80' },
    { name: 'Hot Samosa Ragda Chaat', description: 'Crushed samosas topped with warm yellow pea curry, sweet yogurt & chutneys', price: 60, category: 'snacks', preparationTime: 5, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80' },
    { name: 'Butter Pav Bhaji (2 Pav)', description: 'Spiced mashed vegetable curry cooked in butter served with toasted buttered pavs', price: 85, category: 'snacks', preparationTime: 7, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&auto=format&fit=crop&q=80' },
    { name: 'Schezwan Veg Fried Rice', description: 'Rice wok-tossed with fresh vegetables and hot red Schezwan sauce', price: 95, category: 'lunch', preparationTime: 9, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80' },
    { name: 'Hakka Veg Noodles', description: 'Stir-fried noodles with bell peppers, cabbage, carrots, soy sauce & green chili', price: 90, category: 'lunch', preparationTime: 8, isVeg: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80' },
  ],
};

const adminsData = [
  { name: 'CCD Manager', email: 'admin1@gmail.com', password: 'admin1', role: 'canteen_admin', canteenName: 'Cafe Coffee Day (CCD)' },
  { name: 'Main Core Food Admin', email: 'admin2@gmail.com', password: 'admin2', role: 'canteen_admin', canteenName: 'Main Core - Food Counter' },
  { name: 'Burger Shop Manager', email: 'admin3@gmail.com', password: 'admin3', role: 'canteen_admin', canteenName: 'Main Core - Burger Shop' },
  { name: 'Chaat Corner Admin', email: 'admin4@gmail.com', password: 'admin4', role: 'canteen_admin', canteenName: 'Main Core - Fast Food & Chaat Corner' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas for seeding...');

    // Clear existing records
    await Canteen.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    console.log('🧹 Cleared old canteens, menu items, users, and orders.');

    // Seed Canteens and Menu Items
    const canteenMap = {};
    const createdMenuItemsMap = {};

    for (const cData of canteensData) {
      const canteen = await Canteen.create(cData);
      canteenMap[canteen.name] = canteen._id;
      createdMenuItemsMap[canteen.name] = [];
      console.log(`🏬 Seeded canteen: ${canteen.name}`);

      const items = menuItemsData[canteen.name] || [];
      if (items.length > 0) {
        const preparedItems = items.map((item) => ({ ...item, canteen: canteen._id }));
        const inserted = await MenuItem.insertMany(preparedItems);
        createdMenuItemsMap[canteen.name] = inserted;
        console.log(`  └─ Seeded ${items.length} menu items for ${canteen.name}`);
      }
    }

    // Seed Admins
    for (const admin of adminsData) {
      const canteenId = canteenMap[admin.canteenName];
      const newUser = await User.create({
        name: admin.name,
        email: admin.email,
        password: admin.password,
        role: admin.role,
        canteen: canteenId,
      });

      await Canteen.findByIdAndUpdate(canteenId, { admin: newUser._id });
      console.log(`👤 Seeded admin user: ${admin.email} / ${admin.password} -> ${admin.canteenName}`);
    }

    // Seed Default Student User
    const studentUser = await User.create({
      name: 'Default Student',
      email: 'student@gmail.com',
      password: 'student1',
      role: 'student',
      rollNumber: '7377221CS101',
      phone: '9876543210',
    });
    console.log('🎓 Seeded student user: student@gmail.com / student1');

    // Seed Historical Orders for ML Forecasting & Analytics Charts
    console.log('📈 Seeding historical orders for ML analytics...');
    const sampleStatuses = ['completed', 'completed', 'completed', 'ready', 'accepted', 'cancelled'];
    const now = new Date();

    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const orderDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      
      for (const [cName, itemsList] of Object.entries(createdMenuItemsMap)) {
        if (!itemsList || itemsList.length === 0) continue;
        const selectedItem = itemsList[Math.floor(Math.random() * itemsList.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        const totalAmt = selectedItem.price * qty;
        const status = sampleStatuses[Math.floor(Math.random() * sampleStatuses.length)];

        await Order.create({
          student: studentUser._id,
          canteen: canteenMap[cName],
          items: [
            {
              menuItem: selectedItem._id,
              name: selectedItem.name,
              price: selectedItem.price,
              quantity: qty,
              addedBy: studentUser._id,
              addedByName: studentUser.name,
            },
          ],
          totalAmount: totalAmt,
          status,
          paymentStatus: status === 'cancelled' ? 'pending' : 'paid',
          createdAt: orderDate,
          updatedAt: orderDate,
        });

        await MenuItem.findByIdAndUpdate(selectedItem._id, { $inc: { totalOrdered: qty } });
        await Canteen.findByIdAndUpdate(canteenMap[cName], { $inc: { totalOrders: 1 } });
      }
    }

    console.log('🎉 Database seeding completed successfully with campus canteens & menus!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
