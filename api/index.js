const express = require('express');
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// --- IMPORTANT: Your MongoDB connection setup ---
// You will need to have your MongoDB connection established here.
// This is a placeholder. Replace with your actual connection logic.
// Example:
// const { MongoClient } = require('mongodb');
// const uri = process.env.MONGODB_URI; // Ensure MONGODB_URI is set in your Vercel environment variables
// let db; // Declare a variable to hold your database instance

// async function connectToDatabase() {
//   if (db) return db; // Return existing connection if available
//   const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//   await client.connect();
//   db = client.db('your_database_name'); // Replace 'your_database_name' with your actual database name
//   return db;
// }

// --- Your existing API endpoints would be here --- 
// You will need to copy your existing endpoints from your current api/index.js here.
// For example:
// app.get('/api/generated-reports', async (req, res) => { /* ... */ });
// app.get('/api/projects', async (req, res) => { /* ... */ });
// app.get('/api/users', async (req, res) => { /* ... */ });
// app.post('/api/physicalmarketing/uploads', async (req, res) => { /* ... */ });
// app.post('/api/socialmedia/uploads', async (req, res) => { /* ... */ });
// app.post('/api/submit-monthly-report', async (req, res) => { /* ... */ });


// --- NEW ENDPOINT: /api/project-spend ---
app.get('/api/project-spend', async (req, res) => {
  const projectName = req.query.project_name;

  if (!projectName) {
    return res.status(400).json({ message: 'project_name query parameter is required' });
  }

  try {
    // --- Connect to your database (if not already connected) ---
    // const database = await connectToDatabase();

    // --- Fetching and Aggregating Spend Data ---
    // This is the most crucial part. You need to query your database
    // for all records that represent "spend" for the given projectName.
    //
    // I'll assume you have collections like 'physicalMarketingEntries' and 'socialMediaEntries'
    // and that each entry has a 'cost' or 'amount' field and a 'date' field.

    let allSpendEntries = [];

    // Example: Fetch from physical marketing entries
    // const physicalEntries = await database.collection('physicalMarketingEntries').find({ projectName: projectName }).toArray();
    // allSpendEntries = allSpendEntries.concat(physicalEntries.map(entry => ({
    //   date: entry.date, // Assuming 'date' is a Date object or ISO string
    //   amount: entry.cost // Assuming 'cost' is the spend amount
    // })));

    // Example: Fetch from social media entries
    // const socialMediaEntries = await database.collection('socialMediaEntries').find({ projectName: projectName }).toArray();
    // allSpendEntries = allSpendEntries.concat(socialMediaEntries.map(entry => ({
    //   date: entry.date,
    //   amount: entry.cost
    // })));

    // --- Placeholder Data for Testing (REMOVE THIS ONCE REAL LOGIC IS IMPLEMENTED) ---
    // If you want to test the frontend chart immediately, you can use this placeholder data.
    // Make sure to replace it with actual database queries later.
    if (projectName === 'Default') {
      allSpendEntries = [
        { date: '2023-01-05', amount: 150.75 },
        { date: '2023-01-20', amount: 200.00 },
        { date: '2023-02-10', amount: 100.50 },
        { date: '2023-02-28', amount: 300.00 },
        { date: '2023-03-15', amount: 50.25 },
        { date: '2023-03-20', amount: 400.00 },
        { date: '2023-04-01', amount: 200.00 },
        { date: '2023-04-10', amount: 100.00 },
        { date: '2023-05-01', amount: 50.00 },
      ];
    } else {
      allSpendEntries = []; // No data for other projects by default
    }
    // --- END Placeholder Data ---


    // Aggregate spend by month
    const monthlyTotals = allSpendEntries.reduce((acc, item) => {
      const date = new Date(item.date);
      // Format monthYear as YYYY-MM (e.g., "2023-01")
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[monthYear] = (acc[monthYear] || 0) + item.amount;
      return acc;
    }, {});

    // Convert to array and sort
    const formattedSpendData = Object.keys(monthlyTotals).map(monthYear => ({
      month: monthYear,
      spend: monthlyTotals[monthYear],
    })).sort((a, b) => new Date(a.month) - new Date(b.month));

    res.status(200).json({ spend: formattedSpendData });

  } catch (error) {
    console.error('Error in /api/project-spend:', error);
    res.status(500).json({ message: 'Internal server error while fetching project spend' });
  }
});

// --- For Vercel, you typically export the app instance ---
module.exports = app;
