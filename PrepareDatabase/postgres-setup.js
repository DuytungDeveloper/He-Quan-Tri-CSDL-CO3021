import { faker } from "@faker-js/faker";
import { Client } from "pg";

const client = new Client({
  user: process.env.POSTGRES_USER || "admin",
  host: "localhost",
  database: process.env.POSTGRES_DB || "he_quan_tri_csdl",
  password: process.env.POSTGRES_PASSWORD || "admin123",
  port: 5432,
});

async function createTables() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      address TEXT,
      phone VARCHAR(100), -- Increased length to 100
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100),
      description TEXT,
      price NUMERIC(10, 2),
      stock INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      total_price NUMERIC(10, 2),
      order_date TIMESTAMP,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INT REFERENCES orders(id),
      product_id INT REFERENCES products(id),
      product_name VARCHAR(255),
      quantity INT,
      price NUMERIC(10, 2)
    );
  `;

  await client.query(createUsersTable);
  await client.query(createProductsTable);
  await client.query(createOrdersTable);
  await client.query(createOrderItemsTable);
  console.log("Tables created successfully.");
}

async function insertUsers() {
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
  }));

  const query = `
    INSERT INTO users (username, email, password, address, phone)
    VALUES ($1, $2, $3, $4, $5)
  `;

  for (const user of usersToInsert) {
    await client.query(query, [
      user.username,
      user.email,
      user.password,
      user.address,
      user.phone,
    ]);
  }
  console.log("Inserted users successfully.");
}

async function insertProducts() {
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
    category: listCategory[faker.number.int({ min: 0, max: listCategory.length - 1 })],
    description: faker.commerce.productDescription(),
    price: faker.commerce.price({ min: 1, max: 1000 }),
    stock: faker.number.int({ min: 0, max: 100 }),
  }));

  const query = `
    INSERT INTO products (name, category, description, price, stock)
    VALUES ($1, $2, $3, $4, $5)
  `;

  for (const product of productsToInsert) {
    await client.query(query, [
      product.name,
      product.category,
      product.description,
      product.price,
      product.stock,
    ]);
  }
  console.log("Inserted products successfully.");
}

async function insertOrders() {
  const { rows: users } = await client.query("SELECT id FROM users");
  const { rows: products } = await client.query(
    "SELECT id, name, price FROM products"
  );

  const ordersToInsert = Array.from({ length: 1_000_000 }, () => {
    const orderItems = Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      () => {
        const product =
          products[faker.number.int({ min: 0, max: products.length - 1 })];
        return {
          productId: product.id,
          productName: product.name,
          quantity: faker.number.int({ min: 1, max: 100 }),
          price: product.price,
        };
      }
    );

    return {
      userId: users[faker.number.int({ min: 0, max: users.length - 1 })].id,
      orderItems,
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
    };
  });

  const orderQuery = `
    INSERT INTO orders (user_id, total_price, order_date, status)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  const orderItemQuery = `
    INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
    VALUES ($1, $2, $3, $4, $5)
  `;

  for (const order of ordersToInsert) {
    const { rows } = await client.query(orderQuery, [
      order.userId,
      order.totalPrice,
      order.orderDate,
      order.status,
    ]);
    const orderId = rows[0].id;

    for (const item of order.orderItems) {
      await client.query(orderItemQuery, [
        orderId,
        item.productId,
        item.productName,
        item.quantity,
        item.price,
      ]);
    }
  }
  console.log("Inserted orders successfully.");
}

async function main() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully.");

    await createTables();
    await insertUsers();
    await insertProducts();
    await insertOrders();

    console.log("Database setup completed.");
  } catch (error) {
    console.error("Error setting up the database:", error);
  } finally {
    await client.end();
    console.log("Disconnected from PostgreSQL.");
  }
}

main();
