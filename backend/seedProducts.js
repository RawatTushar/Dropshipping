const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

const productTemplates = [
  {
    name: 'Wireless Earbuds',
    description: 'Bluetooth 5.3 earbuds with active noise cancellation and compact charging case.',
    brand: 'SoundWave',
    category: 'Electronics',
    basePrice: 79,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Over-Ear Headphones',
    description: 'Comfort-fit premium headphones with deep bass and all-day battery life.',
    brand: 'AudioMax',
    category: 'Electronics',
    basePrice: 149,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Running Shoes',
    description: 'Breathable athletic sneakers designed for comfort and daily performance.',
    brand: 'StrideX',
    category: 'Footwear',
    basePrice: 95,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Travel Backpack',
    description: 'Durable backpack with laptop sleeve, anti-theft pocket, and water resistance.',
    brand: 'PackPro',
    category: 'Accessories',
    basePrice: 69,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Smart Watch',
    description: 'Fitness and sleep tracking smartwatch with notification support and AMOLED display.',
    brand: 'PulseTime',
    category: 'Wearables',
    basePrice: 129,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Insulated Water Bottle',
    description: 'Stainless steel vacuum bottle that keeps drinks cold and leak-free.',
    brand: 'HydroFlow',
    category: 'Lifestyle',
    basePrice: 29,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic productivity mouse with silent clicks and precision tracking.',
    brand: 'ClickCore',
    category: 'Electronics',
    basePrice: 39,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with tactile switches and compact layout.',
    brand: 'TypeForge',
    category: 'Electronics',
    basePrice: 89,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Desk Lamp',
    description: 'Eye-care LED desk lamp with adjustable brightness and color temperature.',
    brand: 'LumaDesk',
    category: 'Home',
    basePrice: 35,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Portable Speaker',
    description: 'Water-resistant Bluetooth speaker with rich sound and long battery life.',
    brand: 'BeatBox',
    category: 'Electronics',
    basePrice: 59,
    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80',
  },
];

const variants = ['Classic', 'Pro', 'Lite', 'Plus', 'Max', 'Ultra', 'Series A', 'Series X', 'Edition', 'Prime', 'Core', 'Neo'];
const totalProducts = 120;

const products = Array.from({ length: totalProducts }, (_, i) => {
  const template = productTemplates[i % productTemplates.length];
  const variant = variants[Math.floor(i / productTemplates.length) % variants.length];
  const serial = String(i + 1).padStart(3, '0');
  const price = Number((template.basePrice + (i % 9) * 7 + Math.floor(i / 10) * 2).toFixed(2));
  const stock = 15 + ((i * 7) % 86);
  const costPrice = Number((price * (0.52 + ((i * 13) % 18) / 100)).toFixed(2));

  return {
    name: `${template.name} ${variant} ${serial}`,
    description: `${template.description} Model ${serial} built for modern ecommerce customers.`,
    price,
    costPrice,
    image: template.image,
    brand: template.brand,
    category: template.category,
    countInStock: stock,
  };
});

const seedProducts = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products successfully.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedProducts();
