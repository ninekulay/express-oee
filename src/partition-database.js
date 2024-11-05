const { pool } = require('./db-settings');
const { DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME } = process.env;
const { Sequelize } = require('sequelize');
const config = require('../config/config');
const sequelize = new Sequelize(config.production.database, config.production.username, config.production.password, {
  host: config.production.host,
  dialect: 'mysql'
});

const checkPartitions = async (tableName) => {
  try {
    const [rows] = await pool.query(`
      SELECT PARTITION_NAME
      FROM information_schema.PARTITIONS
      WHERE TABLE_SCHEMA = '${DATABASE_NAME}'
      AND TABLE_NAME = '${tableName}'
      order by PARTITION_NAME desc
      limit 1;
    `);
    return rows[0].PARTITION_NAME;
  } catch (error) {
    console.log('Error checking partitions:');
    return null
  }
};

const createPartitionMachineStatus = async () => {
  // Get current date and calculate the current year and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based month index

  // // Format the partition name for the current month
  const partitionName = `p${currentYear}${('0' + currentMonth).slice(-2)}`;

  // Calculate the next month's year and month
  const nextMonthDate = new Date(currentDate);
  nextMonthDate.setMonth(currentDate.getMonth() + 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth() + 1;
  
  const nextPartition = `${nextYear}${('0' + nextMonth).slice(-2)}`;

  const checkDup = await checkPartitions('machine_statuses');
  console.log('Check duplicate partition:', checkDup, partitionName)

  if (checkDup !== null && partitionName !== checkDup) {
    try {
      // Add the partition for the current month
      await pool.query(`
        ALTER TABLE machine_statuses
        ADD PARTITION (PARTITION ${partitionName} VALUES LESS THAN (${nextPartition}));
      `);
    
      console.log(`Partition ${partitionName} created.`);
    } catch (error) {
      console.error('Error creating partition:', error);
    }
  } else if (partitionName !== checkDup) {
    try {
    //   // ALTER TABLE machine_statuses
    //   await pool.query(`
    //     ALTER TABLE machine_statuses
    //     DROP PRIMARY KEY;
    // `);
    
    // await pool.query(`
    //     ALTER TABLE machine_statuses
    //     ADD PRIMARY KEY (id, created_at);
    // `);
      await pool.query(`
     ALTER TABLE machine_statuses
        PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
            PARTITION ${partitionName} VALUES LESS THAN (${nextPartition})
        )`);

      console.log(`Partition ${partitionName} created.`);
    } catch (error) {
      console.error('Error creating partition:', error);
    }
  }
};


module.exports = {
    createPartitionMachineStatus
}