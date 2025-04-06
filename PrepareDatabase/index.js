import { faker } from "@faker-js/faker";
import { client, dbName } from "./data-source.js";
import { optimizeProductTable } from "./models.js";

async function insertProducts(db) {
  const products = db.collection("products");

  const listProductName = faker.helpers.uniqueArray(
    () =>
      `${faker.commerce.productName()} ${faker.number.int({
        min: 10,
        max: 100_000_000_000,
      })}`,

    5_000_000
  );
  const listCategory = faker.helpers.uniqueArray(faker.commerce.department, 20);

  const productsToInsert = Array.from(listProductName, (v, index) => ({
    name: v,
    category:
      listCategory[faker.number.int({ min: 0, max: listCategory.length - 1 })],
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price({ min: 1, max: 1000 })),
    stock: faker.number.int({ min: 0, max: 100 }),
    created_at: new Date(),
  }));

  const { insertedCount } = await products.insertMany(productsToInsert);
  console.log(`Inserted ${insertedCount} products.`);
}

async function insertUsers(db) {
  const users = db.collection("users");

  const listUserName = faker.helpers.uniqueArray(
    faker.internet.username,
    1_000_000
  );
  const listEmail = faker.helpers.uniqueArray(faker.internet.email, 1_000_000);
  const listPhone = faker.helpers.uniqueArray(faker.phone.number, 1_000_000);

  const usersToInsert = Array.from(listUserName, (v, index) => ({
    username: v,
    email: listEmail[index],
    password: faker.internet.password({
      length: 6,
      alpha: true,
      numeric: false,
      special: false,
    }),
    address: faker.location.streetAddress(),
    phone: listPhone[index],
    created_at: new Date(),
  }));

  const { insertedCount } = await users.insertMany(usersToInsert);
  console.log(`Inserted ${insertedCount} users.`);
}

async function insertOrders(db) {
  const orders = db.collection("orders");

  const listUserIds = await db
    .collection("users")
    .find()
    .map((user) => user._id)
    .toArray();

  const listProductIds = await db
    .collection("products")
    .find()
    .map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
    }))
    .toArray();

  const ordersToInsert = Array.from({ length: 1_000_000 }, () => {
    const orderItems = Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      () => {
        const pro =
          listProductIds[
            faker.number.int({ min: 0, max: listProductIds.length - 1 })
          ];
        return {
          productId: pro.id,
          productName: pro.name,
          quantity: faker.number.int({ min: 1, max: 100 }),
          price: pro.price,
        };
      }
    );

    return {
      userId:
        listUserIds[faker.number.int({ min: 0, max: listUserIds.length - 1 })],
      orderItems: orderItems,
      totalPrice: orderItems.reduce(
        (acc, cur) => acc + cur.price * cur.quantity,
        0
      ),
      orderDate: faker.date.between({ from: "2024-01-01", to: "2025-02-01" }),
      status: faker.helpers.arrayElement([
        "pending",
        "canceled",
        "confirmed",
        "shipped",
        "completed",
      ]),
      created_at: new Date(),
    };
  });

  const { insertedCount } = await orders.insertMany(ordersToInsert);
  console.log(`Inserted ${insertedCount} orders.`);
}

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  await insertProducts(db); // Done 5_000_000 product
  await insertUsers(db); // Done 1_000_000 user
  await insertOrders(db);
  console.log("Tạo CSDL xong");
  // mongodump --host localhost --port 27017 --username admin --password admin123 --authenticationDatabase admin --db he-quan-tri-csdl --out /backup/he-quan-tri-csdl-2025-02-23
  // sudo docker cp de7297e2da84ec18507dbd81610cc78b685583bd3a59403e207ce9cc258b9cc3:/backup /Users/daoduytung/Datas/Private/BACHKHOA/He-Quan-Tri-CSDL-CO3021/Dockers/backups
  await optimize();
  console.log("Tạo Index xong");
  return "done.";
}
async function optimize() {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  await optimizeProductTable(db);
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => {
    console.log("Setup xong MongoDB");
    client.close();
  });

// optimize()
//   .then(() => {
//     console.log("DONE");
//   })
//   .catch(console.error)
//   .finally(() => client.close());
