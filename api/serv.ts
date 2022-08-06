import app from "./app";
import migrate from "./libs/migrate";
import Folder from "./models/Folder";

migrate().then(async () => {
    console.log("Database synchronized");

    const parent = await Folder.create({
        name: "Je suis le parent"
    });

    const child1 = await Folder.create({
        name: "Enfant 1"
    }) //@ts-ignore
    child1.parent_id = parent.id;
    await child1.save();

    const child2 = await Folder.create({
        name: "Enfant 2"
    }) //@ts-ignore
    child2.parent_id = parent.id;
    await child2.save();

    const child3 = await Folder.create({
        name: "Enfant 3"
    })//@ts-ignore
    await parent.addChild(child3);

    const parent_get2 = await Folder.findOne({
        where: {//@ts-ignore
            id: parent.id
        },
        include: {
            model: Folder,
            as: "children"
        }
    });

    console.log("enfants : ")//@ts-ignore
    console.log(parent_get2.children)

    const child1_get2 = await Folder.findOne({
        where: { //@ts-ignore
            id: child1.id
        },
        include: {
            model: Folder,
            as: "parent"
        }
    });
    console.log("parent =>");//@ts-ignore
    console.log(child1_get2.parent)
})

app.listen(process.env.PORT ?? 3000, () => {
    console.log("Server started");
});