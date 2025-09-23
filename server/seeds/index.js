const mongoose = require('mongoose');
const { seedCountries } = require('./countrySeeder');
const { seedEconomicData } = require('./economicDataSeeder');
const { seedCrisisEvents } = require('./crisisSeeder');
require('dotenv').config();

const runSeeder = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    console.log('🌱 Starting database seeding...\n');

    // Seed in order (countries first, then dependent data)
    console.log('1. Seeding countries...');
    await seedCountries();

    console.log('2. Seeding economic indicators...');
    await seedEconomicData();

    console.log('3. Seeding crisis events...');
    await seedCrisisEvents();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('Your GSECD application now has sample data to work with.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  runSeeder();
}

module.exports = { runSeeder };
