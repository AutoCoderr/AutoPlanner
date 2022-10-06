import app from "./app";
import migrate from "./libs/migrate";
import detectAndSynchronizeTodoAndFolderParent
    from "./libs/percentSynchronization/detectAndSynchronizeTodoAndFolderParent";
import detectAndSynchronizeSteps
    from "./libs/percentSynchronization/detectAndSynchronizeSteps";
import detectAndSynchronizeStepTodo from "./libs/percentSynchronization/detectAndSynchronizeStepTodo";

migrate().then(() => {
    console.log("Database synchronized");

    detectAndSynchronizeTodoAndFolderParent();
    detectAndSynchronizeSteps();
    detectAndSynchronizeStepTodo()
});

app.listen(process.env.PORT ?? 3000, () => {
    console.log("Server started");
});