
import sequelize from "./src/config/sequelize";

beforeAll(async () => {
  await sequelize.sync({ force: true }); 
});

afterAll(async () => {
  await sequelize.close();
});


jest.setTimeout(10000);

