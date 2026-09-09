const cron = require('node-cron');
const { Op } = require('sequelize');
const { Club } = require('../models');

const initCronJobs = () => {
  // Runs every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running cron job: Closing expired club registrations...');
    try {
      const today = new Date();
      const updatedCount = await Club.update(
        { registration_status: 'closed' },
        {
          where: {
            registration_status: 'open',
            registration_end: { [Op.lt]: today }
          }
        }
      );
      console.log(`Cron job completed. Closed ${updatedCount[0]} expired registrations.`);
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
};

module.exports = { initCronJobs };
