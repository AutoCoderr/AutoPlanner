import express from "express";
import cors from "cors";
import account from "./routes/account";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/account", account);

export default app;