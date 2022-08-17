import express from "express";
import cors from "cors";
import account from "./routes/account";
import isAuth from "./middleWare/isAuth";
import todo from "./routes/todo";
import folder from "./routes/folder";
import getFolderMiddleWare from "./middleWare/getFolderMiddleWare";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/account", account);

app.use(isAuth);
app.use("/todos", todo);
app.use("/folders", folder);

const folderMiddleWare = getFolderMiddleWare();
app.use("/folders/:folder_id/folders", folderMiddleWare, folder);
app.use("/folders/:folder_id/todos", folderMiddleWare, todo);

export default app;