import Sequelize from "sequelize";

const { DB_NAME, DB_USER, DB_PASSWORD, DB_DRIVER, DB_HOST } = process.env;

//@ts-ignore
const connection = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_DRIVER,
    logging: console.log
});

connection.authenticate().then(() => {
    console.log("Database started");
})

export default connection;
