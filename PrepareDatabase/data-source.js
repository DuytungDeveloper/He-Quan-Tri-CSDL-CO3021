import { MongoClient } from "mongodb";
const url = "mongodb://admin:admin123@localhost:27018?ssl=false&replicaSet=rs0&authSource=admin&directConnection=true";
const client = new MongoClient(url);
const dbName = "he-quan-tri-csdl";

export { url, client, dbName };
