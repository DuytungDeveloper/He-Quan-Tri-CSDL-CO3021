// 📜 1. EXPLAIN (Query Plan)
db.users.find({ email: 'example@test.com' }).explain("executionStats")

// 📜 2. JOIN (Combine users and their orders)
db.orders.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user_info"
      }
    },
    {
      $unwind: "$user_info"
    },
    {
      $project: {
        order_id: "$_id",
        username: "$user_info.username",
        total_price: 1
      }
    }
  ])

// 📜 3. UNION (combine names from users and products)
const userNames = db.users.find({}, { username: 1, _id: 0 }).toArray();
const productNames = db.products.find({}, { name: 1, _id: 0 }).toArray();
const unionNames = [...userNames, ...productNames];

// 📜 4. TRANSACTION (Atomic multiple queries)
const session = db.getMongo().startSession();
session.startTransaction();

try {
  const ordersColl = session.getDatabase("your_db").orders;
  const orderItemsColl = session.getDatabase("your_db").order_items;

  const orderResult = ordersColl.insertOne({
    userId: ObjectId("USER_ID"),
    totalPrice: 99.99,
    orderDate: new Date(),
    status: "pending",
    created_at: new Date()
  }, { session });

  orderItemsColl.insertOne({
    orderId: orderResult.insertedId,
    productId: ObjectId("PRODUCT_ID"),
    productName: "Flute Bamboo",
    quantity: 2,
    price: 49.99
  }, { session });

  session.commitTransaction();
} catch (error) {
  session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}

// 📜 5. GROUP BY (count products by category)
db.products.aggregate([
    {
      $group: {
        _id: "$category",
        total_products: { $sum: 1 }
      }
    }
  ])

// 📜 6. HAVING (Filter groups)
db.products.aggregate([
    {
      $group: {
        _id: "$category",
        total_products: { $sum: 1 }
      }
    },
    {
      $match: {
        total_products: { $gt: 5 }
      }
    }
  ])

// 📜 7. INDEX (create index on email)
db.users.createIndex({ email: 1 })

// 📜 8. VIEW (Create a saved query)
db.createView(
    "active_users",
    "users",
    [
      { $match: { email: { $ne: null } } },
      { $project: { username: 1, email: 1 } }
    ]
  )
  
// 📜 9. TRIGGER (Auto action after insert)
const changeStream = db.orders.watch();

changeStream.on("change", (change) => {
  if (change.operationType === "insert") {
    db.order_logs.insertOne({
      orderId: change.fullDocument._id,
      log_time: new Date()
    });
  }
});

// 📜 10. PROCEDURE (reusable operation)
// MongoDB does not support stored procedures.
// You must define procedures in your application code.
// Example (Node.js):
async function createOrder(userId, totalPrice) {
    await db.orders.insertOne({
      userId: userId,
      totalPrice: totalPrice,
      orderDate: new Date(),
      status: "pending",
      created_at: new Date()
    });
  }
  
// 📜 11. FUNCTION (return a value)
// MongoDB 5.0+ supports $function inside aggregation:
db.users.aggregate([
    {
      $addFields: {
        masked_email: {
          $function: {
            body: function(email) {
              return email.split("@")[0] + "@***.com";
            },
            args: ["$email"],
            lang: "js"
          }
        }
      }
    }
  ])
  