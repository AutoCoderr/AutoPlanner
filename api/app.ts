import express from "express";
import cors from "cors";
import account from "./routes/account";
import isAuth from "./middleWare/isAuth";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/account", account);

app.get("/test", isAuth, (req, res) => res.send("Vous êtes connecté!"))

export default app;