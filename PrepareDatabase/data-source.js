import { MongoClient } from "mongodb";
// const url = "mongodb://localhost:27017";
const url = "mongodb://admin:admin123@localhost:27017/admin?ssl=false";
const client = new MongoClient(url);
const dbName = "he-quan-tri-csdl";

export { url, client, dbName };
