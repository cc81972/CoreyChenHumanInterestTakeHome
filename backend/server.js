const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, this would be a database)
let userContribution = {
  type: 'percentage', // 'percentage' or 'dollar'
  rate: 5, // percentage or dollar amount
};

// Mock user data
const mockUserData = {
  age: 30,
  salary: 75000,
  paychecksPerYear: 26, // bi-weekly
  currentYTD: 4500, // Year-to-date contributions
};

// GET current contribution settings
app.get('/api/contribution', (req, res) => {
  res.json({
    ...userContribution,
    userData: mockUserData,
  });
});

// POST update contribution settings
app.post('/api/contribution', (req, res) => {
  const { type, rate } = req.body;

  if (!type || (type !== 'percentage' && type !== 'dollar')) {
    return res.status(400).json({ error: 'Invalid contribution type' });
  }

  if (typeof rate !== 'number' || rate < 0) {
    return res.status(400).json({ error: 'Invalid contribution rate' });
  }

  // Validate percentage (0-100) or dollar amount (reasonable max)
  if (type === 'percentage' && rate > 100) {
    return res.status(400).json({ error: 'Percentage cannot exceed 100%' });
  }

  if (type === 'dollar' && rate > mockUserData.salary) {
    return res.status(400).json({ error: 'Dollar amount cannot exceed annual salary' });
  }

  userContribution = { type, rate };

  res.json({
    success: true,
    contribution: userContribution,
  });
});

// GET retirement projection
app.get('/api/projection', (req, res) => {
  const { type, rate, age } = req.query;

  const contributionType = type || userContribution.type;
  const contributionRate = parseFloat(rate) || userContribution.rate;
  const currentAge = parseInt(age) || mockUserData.age;
  const retirementAge = 65;
  const yearsToRetirement = retirementAge - currentAge;

  if (yearsToRetirement <= 0) {
    return res.json({ projectedSavings: 0, yearsToRetirement: 0 });
  }

  const annualReturn = 0.07; // 7% average annual return
  const paycheckAmount = mockUserData.salary / mockUserData.paychecksPerYear;

  let perPaycheckContribution;
  if (contributionType === 'percentage') {
    perPaycheckContribution = paycheckAmount * (contributionRate / 100);
  } else {
    perPaycheckContribution = contributionRate;
  }

  const annualContribution = perPaycheckContribution * mockUserData.paychecksPerYear;

  // Calculate future value using compound interest formula
  let projectedSavings = 0;
  if (annualReturn > 0) {
    projectedSavings = annualContribution * ((Math.pow(1 + annualReturn, yearsToRetirement) - 1) / annualReturn);
  } else {
    projectedSavings = annualContribution * yearsToRetirement;
  }

  res.json({
    projectedSavings: Math.round(projectedSavings),
    yearsToRetirement,
    annualContribution: Math.round(annualContribution),
    perPaycheckContribution: Math.round(perPaycheckContribution),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

