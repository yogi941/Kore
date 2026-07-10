const mongoose = require('mongoose');
const Canteen = require('./models/Canteen');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/kct-canteen';

const canteensData = [
  {
    name: 'East Core Canteen',
    location: 'East Block, Ground Floor',
    description: 'Serving hot breakfast and delicious South Indian food.',
    image: '/images/east_core.png',
    isOpen: true,
    operatingHours: {
      breakfast: { open: '08:00', close: '10:30' },
      lunch: { open: '12:00', close: '14:30' },
    },
    pickupSlots: [
      { label: 'Morning Break (10:30 AM)', time: 'Pre-order window: 8:30 AM – 10:15 AM', maxOrders: 50 },
      { label: 'Lunch Break (12:30 PM)', time: 'Pre-order window: 11:00 AM – 12:15 PM', maxOrders: 50 },
    ],
  },
  {
    name: 'Main Core Canteen',
    location: 'Main Block, Near Admin Office',
    description: 'Multi-cuisine options with special daily lunches.',
    image: '/images/main_core.png',
    isOpen: true,
    operatingHours: {
      breakfast: { open: '08:00', close: '10:30' },
      lunch: { open: '12:00', close: '14:30' },
    },
    pickupSlots: [
      { label: 'Morning Break (10:30 AM)', time: 'Pre-order window: 8:30 AM – 10:15 AM', maxOrders: 50 },
      { label: 'Lunch Break (12:30 PM)', time: 'Pre-order window: 11:00 AM – 12:15 PM', maxOrders: 50 },
    ],
  },
  {
    name: 'Munch Box',
    location: 'Near Sports Complex',
    description: 'Fast food, shakes, and quick bites for active students.',
    image: '/images/munch_box.png',
    isOpen: true,
    operatingHours: {
      breakfast: { open: '08:00', close: '10:30' },
      lunch: { open: '12:00', close: '14:30' },
    },
    pickupSlots: [
      { label: 'Morning Break (10:30 AM)', time: 'Pre-order window: 8:30 AM – 10:15 AM', maxOrders: 50 },
      { label: 'Lunch Break (12:30 PM)', time: 'Pre-order window: 11:00 AM – 12:15 PM', maxOrders: 50 },
    ],
  },
  {
    name: 'KCT Cafeteria (South Core)',
    location: 'South Block, Near Library',
    description: 'Juices, snacks, and wholesome meals.',
    image: '/images/south_core.png',
    isOpen: true,
    operatingHours: {
      breakfast: { open: '08:00', close: '10:30' },
      lunch: { open: '12:00', close: '14:30' },
    },
    pickupSlots: [
      { label: 'Morning Break (10:30 AM)', time: 'Pre-order window: 8:30 AM – 10:15 AM', maxOrders: 50 },
      { label: 'Lunch Break (12:30 PM)', time: 'Pre-order window: 11:00 AM – 12:15 PM', maxOrders: 50 },
    ],
  },
];

const menuItemsData = {
  'East Core Canteen': [
    { name: 'Plain Dosa', description: 'Crispy rice batter crepe served with sambar and coconut chutney', price: 40, category: 'breakfast', isVeg: true, isAvailable: true },
    { name: 'Idli (2 Pcs)', description: 'Steamed rice cakes served with sambar and tomato chutney', price: 20, category: 'breakfast', isVeg: true, isAvailable: true },
    { name: 'Veg Biryani', description: 'Fragrant basmati rice cooked with mixed vegetables and spices', price: 80, category: 'lunch', isVeg: true, isAvailable: true },
    { name: 'Filter Coffee', description: 'Traditional South Indian hot filter coffee', price: 15, category: 'beverages', isVeg: true, isAvailable: true },
  ],
  'Main Core Canteen': [
    { name: 'Poori Masala (3 Pcs)', description: 'Fluffy fried wheat bread served with potato masala', price: 35, category: 'breakfast', isVeg: true, isAvailable: true },
    { name: 'Chicken Biryani', description: 'Delicious Biryani made with succulent pieces of chicken and spices', price: 120, category: 'lunch', isVeg: false, isAvailable: true },
    { name: 'Samosa (2 Pcs)', description: 'Crispy fried pastries filled with spiced potato and peas', price: 15, category: 'snacks', isVeg: true, isAvailable: true },
    { name: 'Hot Masala Tea', description: 'Spiced hot milk tea brewed with cardamom and ginger', price: 10, category: 'beverages', isVeg: true, isAvailable: true },
  ],
  'Munch Box': [
    { name: 'Veg Cheese Sandwich', description: 'Grilled sandwich with fresh vegetables and melted cheese', price: 50, category: 'snacks', isVeg: true, isAvailable: true },
    { name: 'Aloo Tikki Burger', description: 'Crispy potato patty burger with lettuce, tomato, and mayo', price: 70, category: 'snacks', isVeg: true, isAvailable: true },
    { name: 'French Fries', description: 'Crispy golden potato fingers lightly salted', price: 60, category: 'snacks', isVeg: true, isAvailable: true },
    { name: 'Oreo Milkshake', description: 'Rich chocolate milkshake blended with crushed Oreo cookies', price: 60, category: 'beverages', isVeg: true, isAvailable: true },
  ],
  'KCT Cafeteria (South Core)': [
    { name: 'Veg Fried Rice', description: 'Rice stir-fried with diced vegetables, soy sauce, and green onions', price: 90, category: 'lunch', isVeg: true, isAvailable: true },
    { name: 'Schezwan Noodles', description: 'Spicy stir-fried noodles cooked in hot Schezwan sauce', price: 90, category: 'lunch', isVeg: true, isAvailable: true },
    { name: 'Paneer Roll', description: 'Spiced paneer filling wrapped in flatbread with mint chutney', price: 45, category: 'snacks', isVeg: true, isAvailable: true },
    { name: 'Fresh Lemon Juice', description: 'Chilled sweet and tangy fresh lime juice', price: 20, category: 'beverages', isVeg: true, isAvailable: true },
  ],
};

const adminsData = [
  { name: 'East Core Admin', email: 'admin1@gmail.com', password: 'admin1', role: 'canteen_admin', canteenName: 'East Core Canteen' },
  { name: 'Main Core Admin', email: 'admin2@gmail.com', password: 'admin2', role: 'canteen_admin', canteenName: 'Main Core Canteen' },
  { name: 'Munch Box Admin', email: 'admin3@gmail.com', password: 'admin3', role: 'canteen_admin', canteenName: 'Munch Box' },
  { name: 'South Core Admin', email: 'admin4@gmail.com', password: 'admin4', role: 'canteen_admin', canteenName: 'KCT Cafeteria (South Core)' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear old data
    await Canteen.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing canteens, users, and menu items.');

    // Seed canteens and menu items
    const canteenMap = {};
    for (const cData of canteensData) {
      const canteen = await Canteen.create(cData);
      canteenMap[canteen.name] = canteen._id;
      console.log(`Seeded canteen: ${canteen.name}`);

      const items = menuItemsData[canteen.name] || [];
      if (items.length > 0) {
        const preparedItems = items.map(item => ({ ...item, canteen: canteen._id }));
        await MenuItem.insertMany(preparedItems);
        console.log(`Seeded ${items.length} menu items for ${canteen.name}`);
      }
    }

    // Seed admins and link to their canteens
    for (const admin of adminsData) {
      const canteenId = canteenMap[admin.canteenName];
      const newUser = await User.create({
        name: admin.name,
        email: admin.email,
        password: admin.password,
        role: admin.role,
        canteen: canteenId
      });
      
      // Update canteen with admin reference
      await Canteen.findByIdAndUpdate(canteenId, { admin: newUser._id });
      console.log(`Seeded admin user: ${admin.email} linked to ${admin.canteenName}`);
    }

    // Seed a default student
    await User.create({
      name: 'Default Student',
      email: 'student@gmail.com',
      password: 'student1',
      role: 'student'
    });
    console.log('Seeded student user: student@gmail.com / student1');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
