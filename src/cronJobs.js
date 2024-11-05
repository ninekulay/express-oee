const cron = require('node-cron');
const { createPartitionMachineStatus } = require('./partition-database'); // Adjust for require syntax if not using ES6 modules
const LogModel = require('./apiLogs');

// // Schedule the job to run every week (Sunday at midnight)
// cron.schedule('0 0 * * 0', () => {
//   console.log('Cron createPartitionMachineStatus running at:', new Date().toString());
//   createPartitionMachineStatus();
// });

// */5 * * * * - Every 5min
// 1 0 * * * - Every day at midnight 1 min
// cron.schedule('*/15 * * * *', () => {
//   console.log('Cron createPartitionMachineStatus running at:', new Date().toString());
//   createPartitionMachineStatus();
// });

// Cleanup job to delete logs older than 7 days
cron.schedule('0 0 * * *', async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  await LogModel.deleteMany({ timestamp: { $lt: sevenDaysAgo } });
  console.log('Old logs deleted');
});

module.exports = {
  cron
};
