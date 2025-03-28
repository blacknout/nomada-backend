import app from "./app";
import sequelize from "./config/sequelize";

const PORT = process.env.PORT || 9000;

sequelize.sync({ alter: true }).then(() => {
  console.log("Database connected and schema updated");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
