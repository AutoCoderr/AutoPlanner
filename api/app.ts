import express from "express";
import cors from "cors";
import account from "./routes/account";
import isAuth from "./middleWare/isAuth";
import todo from "./routes/todo";
import folder from "./routes/folder";
import model from "./routes/model";
import getFolderMiddleWare from "./middleWare/getFolderMiddleWare";
import getSpecifiedUserMiddleWare from "./middleWare/getSpecifiedUserMiddleWare";
import specifiedUser from "./routes/specifiedUser";
import accessAllMiddleWare from "./middleWare/accessAllMiddleWare";
import all from "./routes/all";
import node from "./routes/node";
import response from "./routes/response";
import step from "./routes/step";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/account", account);

app.use(isAuth());
app.use("/todos", todo);
app.use("/folders", folder);
app.use("/models", model);
app.use("/nodes", node);
app.use("/responses", response);
app.use("/steps", step);

app.use("/users/:specifiedUser_id", getSpecifiedUserMiddleWare(), specifiedUser);
app.use("/all", accessAllMiddleWare(), all);

const folderMiddleWare = getFolderMiddleWare();
app.use("/folders/:folder_id/folders", folderMiddleWare, folder);
app.use("/folders/:folder_id/todos", folderMiddleWare, todo);

export default app;