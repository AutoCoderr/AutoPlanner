import app from "./app";
import migrate from "./libs/migrate";

migrate().then(async () => {
    console.log("Database synchronized");
})

app.listen(process.env.PORT ?? 3000, () => {
    console.log("Server started");
});