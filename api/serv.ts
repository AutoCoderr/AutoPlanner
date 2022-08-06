import app from "./app";
import DB from "./DB";

console.log(typeof DB);

app.listen(process.env.PORT ?? 3000, () => {
    console.log("Server started");
});