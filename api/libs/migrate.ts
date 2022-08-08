import Sequelize from "../sequelize";
//import Folder from "../models/Folder";
import fs from "fs/promises";

async function migrate() {
    const modelDir = __dirname+"/../models/";

    await fs.readdir(modelDir)
        .then(files => files.filter(file => file.endsWith(".js")))
        .then(files => files.map(file => require(modelDir+file)));

    return Sequelize.sync();
    //return Folder.sync();
}

export default migrate;