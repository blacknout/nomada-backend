import app from "./app";
import sequelize from "./config/sequelize";

const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false }).then(() => {
  console.log("Database connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
