const Country = require('../models/Country');
const mongoose = require('mongoose');

const countryData = [
  { countryCode: 'USA', name: 'United States', region: 'North America', incomeLevel: 'High income', coordinates: { latitude: 39.8283, longitude: -98.5795 }, population: 331000000, area: 9833517 },
  { countryCode: 'CHN', name: 'China', region: 'East Asia & Pacific', incomeLevel: 'Upper middle income', coordinates: { latitude: 35.8617, longitude: 104.1954 }, population: 1439323776, area: 9596961 },
  { countryCode: 'JPN', name: 'Japan', region: 'East Asia & Pacific', incomeLevel: 'High income', coordinates: { latitude: 36.2048, longitude: 138.2529 }, population: 126476461, area: 377930 },
  { countryCode: 'DEU', name: 'Germany', region: 'Europe & Central Asia', incomeLevel: 'High income', coordinates: { latitude: 51.1657, longitude: 10.4515 }, population: 83783942, area: 357114 },
  { countryCode: 'GBR', name: 'United Kingdom', region: 'Europe & Central Asia', incomeLevel: 'High income', coordinates: { latitude: 55.3781, longitude: -3.4360 }, population: 67886011, area: 242495 },
  { countryCode: 'FRA', name: 'France', region: 'Europe & Central Asia', incomeLevel: 'High income', coordinates: { latitude: 46.2276, longitude: 2.2137 }, population: 65273511, area: 643801 },
  { countryCode: 'IND', name: 'India', region: 'South Asia', incomeLevel: 'Lower middle income', coordinates: { latitude: 20.5937, longitude: 78.9629 }, population: 1380004385, area: 3287263 },
  { countryCode: 'BRA', name: 'Brazil', region: 'Latin America & Caribbean', incomeLevel: 'Upper middle income', coordinates: { latitude: -14.2350, longitude: -51.9253 }, population: 212559417, area: 8514877 },
  { countryCode: 'RUS', name: 'Russia', region: 'Europe & Central Asia', incomeLevel: 'Upper middle income', coordinates: { latitude: 61.5240, longitude: 105.3188 }, population: 145934462, area: 17098242 },
  { countryCode: 'CAN', name: 'Canada', region: 'North America', incomeLevel: 'High income', coordinates: { latitude: 56.1304, longitude: -106.3468 }, population: 37742154, area: 9984670 }
];

const seedCountries = async () => {
  try {
    await Country.deleteMany({});
    console.log('Existing countries cleared');
    
    const countries = await Country.insertMany(countryData);
    console.log(`${countries.length} countries seeded successfully`);
    
    return countries;
  } catch (error) {
    console.error('Country seeding error:', error);
    throw error;
  }
};

module.exports = { seedCountries, countryData };
