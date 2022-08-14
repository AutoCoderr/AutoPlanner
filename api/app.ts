import express from "express";
import cors from "cors";
import account from "./routes/account";
import isAuth from "./middleWare/isAuth";
import todo from "./routes/todo";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/account", account);

app.use(isAuth);
app.use("/todos", todo);

export default app;