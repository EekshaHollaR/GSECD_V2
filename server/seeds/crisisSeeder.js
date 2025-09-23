const CrisisEvent = require('../models/CrisisEvent');

const sampleCrises = [
  {
    title: '2008 Global Financial Crisis',
    description: 'Major financial crisis triggered by the collapse of Lehman Brothers and subprime mortgage crisis in the United States, affecting global markets.',
    crisisType: 'Financial Crisis',
    severity: 'Critical',
    startDate: new Date('2008-09-15'),
    endDate: new Date('2009-06-30'),
    affectedCountries: [
      { countryCode: 'USA', impactLevel: 'High' },
      { countryCode: 'GBR', impactLevel: 'High' },
      { countryCode: 'DEU', impactLevel: 'Medium' },
      { countryCode: 'FRA', impactLevel: 'Medium' },
      { countryCode: 'JPN', impactLevel: 'Medium' }
    ],
    economicImpact: { gdpImpact: -5.2, unemploymentImpact: 4.8, inflationImpact: -2.1 },
    alertLevel: 'Red',
    isActive: false
  },
  {
    title: 'COVID-19 Pandemic Economic Impact',
    description: 'Global economic disruption caused by COVID-19 pandemic, resulting in widespread lockdowns, supply chain disruptions, and recession.',
    crisisType: 'Pandemic',
    severity: 'Critical',
    startDate: new Date('2020-03-01'),
    endDate: new Date('2022-12-31'),
    affectedCountries: [
      { countryCode: 'USA', impactLevel: 'High' },
      { countryCode: 'CHN', impactLevel: 'High' },
      { countryCode: 'IND', impactLevel: 'High' },
      { countryCode: 'BRA', impactLevel: 'High' },
      { countryCode: 'RUS', impactLevel: 'Medium' }
    ],
    economicImpact: { gdpImpact: -3.8, unemploymentImpact: 6.2, inflationImpact: 3.5 },
    alertLevel: 'Red',
    isActive: false
  },
  {
    title: 'Ukraine-Russia Conflict Economic Sanctions',
    description: 'Economic disruption from sanctions and supply chain issues following the Russia-Ukraine conflict.',
    crisisType: 'Political Instability',
    severity: 'High',
    startDate: new Date('2022-02-24'),
    endDate: null,
    affectedCountries: [
      { countryCode: 'RUS', impactLevel: 'High' },
      { countryCode: 'DEU', impactLevel: 'Medium' },
      { countryCode: 'FRA', impactLevel: 'Medium' },
      { countryCode: 'GBR', impactLevel: 'Low' }
    ],
    economicImpact: { gdpImpact: -2.1, unemploymentImpact: 1.5, inflationImpact: 8.2 },
    alertLevel: 'Orange',
    isActive: true
  },
  {
    title: 'Global Supply Chain Crisis',
    description: 'Ongoing supply chain disruptions affecting global trade and manufacturing, exacerbated by pandemic effects.',
    crisisType: 'Economic Recession',
    severity: 'Medium',
    startDate: new Date('2021-06-01'),
    endDate: null,
    affectedCountries: [
      { countryCode: 'USA', impactLevel: 'Medium' },
      { countryCode: 'CHN', impactLevel: 'Medium' },
      { countryCode: 'DEU', impactLevel: 'Medium' },
      { countryCode: 'JPN', impactLevel: 'Medium' }
    ],
    economicImpact: { gdpImpact: -1.2, unemploymentImpact: 0.8, inflationImpact: 5.1 },
    alertLevel: 'Yellow',
    isActive: true
  }
];

const seedCrisisEvents = async () => {
  try {
    await CrisisEvent.deleteMany({});
    console.log('Existing crisis events cleared');
    
    const crises = await CrisisEvent.insertMany(sampleCrises);
    console.log(`${crises.length} crisis events seeded successfully`);
    
    return crises;
  } catch (error) {
    console.error('Crisis seeding error:', error);
    throw error;
  }
};

module.exports = { seedCrisisEvents, sampleCrises };
