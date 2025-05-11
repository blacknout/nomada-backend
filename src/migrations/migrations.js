const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const migrator = new Umzug({
  migrations: { glob: 'migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const runMigrations = async () => {
  if (process.env.AUTO_MIGRATE === 'true') {
    console.log('Running migrations...');
    await migrator.up();
    console.log('Migrations completed.');
  }
};

module.exports = { runMigrations };
