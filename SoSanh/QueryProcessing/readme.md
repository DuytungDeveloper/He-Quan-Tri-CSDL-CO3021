https://chatgpt.com/share/680de3a4-be3c-8009-97bf-7f5e2d62df2a
https://g.co/gemini/share/04400fa4a563

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(100), -- Increased length to 100
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100),
  description TEXT,
  price NUMERIC(10, 2),
  stock INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total_price NUMERIC(10, 2),
  order_date TIMESTAMP,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  product_name VARCHAR(255),
  quantity INT,
  price NUMERIC(10, 2)
);



| Concept | PostgreSQL (SQL) | MongoDB (Aggregation/Command)
|----------|:-------------:|------:|
| EXPLAIN | EXPLAIN SELECT * FROM users WHERE email = 'test@test.com'; | db.users.find({email: 'test@test.com'}).explain()
| JOIN | SELECT * FROM orders JOIN users ON orders.user_id = users.id; | $lookup in aggregation:db.orders.aggregate([{ $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } }])
| UNION | SELECT username FROM users UNION SELECT name FROM products; | MongoDB has no direct UNION, you must manually merge arrays in app code
| TRANSACTION | BEGIN; INSERT INTO orders ...; COMMIT; | MongoDB Transactions (session.startTransaction()) but only inside a replica set
| GROUP BY | SELECT category, COUNT(*) FROM products GROUP BY category; | MongoDB aggregation pipeline: db.products.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
| HAVING | SELECT category, COUNT(*) FROM products GROUP BY category HAVING COUNT(*) > 5; | MongoDB after $group, use $match stage
| INDEX | CREATE INDEX idx_email ON users(email); | db.users.createIndex({ email: 1 })
| VIEW | CREATE VIEW active_users AS SELECT * FROM users WHERE active = true; | MongoDB 4.0+: db.createView("active_users", "users", [{ $match: { active: true } }])
| TRIGGER | CREATE TRIGGER after_insert AFTER INSERT ON orders ... | No native triggers. Must be done via Change Streams (watcher)
| PROCEDURE | CREATE PROCEDURE add_order() BEGIN INSERT INTO ... END; | MongoDB does not support stored procedures inside DB. Must be coded in app
| FUNCTION | CREATE FUNCTION calc_discount(price NUMERIC) RETURNS NUMERIC AS $$ BEGIN RETURN price * 0.9; END; $$ LANGUAGE plpgsql; | MongoDB 5.0+: Supports limited server-side functions with $function operator



```
Index Scan using users_email_key on users  (cost=0.42..8.44 rows=1 width=93) (actual time=0.349..0.349 rows=0 loops=1)
  Index Cond: ((email)::text = 'example@test.com'::text)
Planning Time: 0.711 ms
Execution Time: 0.533 ms
```

|Thành phần | Ý nghĩa|
|----------|:-------------|
|Index Scan using users_email_key | PostgreSQL dùng chỉ mục (index) tên là users_email_key để tìm dữ liệu (nhanh hơn Seq Scan).
|on users | Thực hiện quét chỉ mục trên bảng users.
|cost=0.42..8.44 | Chi phí ước lượng để thực hiện bước này. (startup cost = 0.42, total cost = 8.44)
|rows=1 | PostgreSQL ước lượng sẽ có 1 dòng kết quả.
|width=93 | Trung bình mỗi dòng kết quả tốn 93 byte (data size).
|actual time=0.349..0.349 | Thời gian thực tế (ms) để thực hiện bước này (bắt đầu & kết thúc đều 0.349ms).
|rows=0 | Thực tế tìm được 0 dòng (không có user email như yêu cầu).
|loops=1 | Số vòng lặp thực hiện bước này. (ở đây chỉ cần lặp 1 lần).
|Index Cond: (email = 'example@test.com') | Điều kiện tìm kiếm sử dụng index.
|Planning Time: 0.711 ms | Thời gian PostgreSQL lên kế hoạch thực hiện truy vấn (parse, optimize, chọn index...).
|Execution Time: 0.533 ms | Tổng thời gian thực hiện toàn bộ truy vấn, bao gồm tất cả các bước trên.



```
[
  {
    "$clusterTime": {
      "clusterTime": {"$timestamp": {"t": 1745741745, "i": 1}},
      "signature": {
        "hash": {"$binary": {"base64": "KVLGpAO+QtZNq2VsvbG8eCsviLM=", "subType": "00"}},
        "keyId": 7490228629838757894
      }
    },
    "command": {
      "find": "users",
      "filter": {
        "email": "example@test.com"
      },
      "$db": "he-quan-tri-csdl"
    },
    "executionStats": {
      "executionSuccess": true,
      "nReturned": 0,
      "executionTimeMillis": 2133,
      "totalKeysExamined": 0,
      "totalDocsExamined": 1000000,
      "executionStages": {
        "isCached": false,
        "stage": "COLLSCAN",
        "filter": {
          "email": {
            "$eq": "example@test.com"
          }
        },
        "nReturned": 0,
        "executionTimeMillisEstimate": 2069,
        "works": 1000001,
        "advanced": 0,
        "needTime": 1000000,
        "needYield": 0,
        "saveState": 112,
        "restoreState": 112,
        "isEOF": 1,
        "direction": "forward",
        "docsExamined": 1000000
      }
    },
    "explainVersion": "1",
    "ok": 1,
    "operationTime": {"$timestamp": {"t": 1745741745, "i": 1}},
    "queryPlanner": {
      "namespace": "he-quan-tri-csdl.users",
      "parsedQuery": {
        "email": {
          "$eq": "example@test.com"
        }
      },
      "indexFilterSet": false,
      "queryHash": "ED28E3D2",
      "planCacheShapeHash": "ED28E3D2",
      "planCacheKey": "30FCCA9A",
      "optimizationTimeMillis": 0,
      "maxIndexedOrSolutionsReached": false,
      "maxIndexedAndSolutionsReached": false,
      "maxScansToExplodeReached": false,
      "prunedSimilarIndexes": false,
      "winningPlan": {
        "isCached": false,
        "stage": "COLLSCAN",
        "filter": {
          "email": {
            "$eq": "example@test.com"
          }
        },
        "direction": "forward"
      },
      "rejectedPlans": []
    },
    "queryShapeHash": "03A1CC2067506EA57B842A9387D9AD7366303C817751EF278380CBE999B8A41B",
    "serverInfo": {
      "host": "55e4be3015d4",
      "port": 27017,
      "version": "8.0.5",
      "gitVersion": "cb9e2e5e552ee39dea1e39d7859336456d0c9820"
    },
    "serverParameters": {
      "internalQueryFacetBufferSizeBytes": 104857600,
      "internalQueryFacetMaxOutputDocSizeBytes": 104857600,
      "internalLookupStageIntermediateDocumentMaxSizeBytes": 104857600,
      "internalDocumentSourceGroupMaxMemoryBytes": 104857600,
      "internalQueryMaxBlockingSortMemoryUsageBytes": 104857600,
      "internalQueryProhibitBlockingMergeOnMongoS": 0,
      "internalQueryMaxAddToSetBytes": 104857600,
      "internalDocumentSourceSetWindowFieldsMaxMemoryBytes": 104857600,
      "internalQueryFrameworkControl": "trySbeRestricted",
      "internalQueryPlannerIgnoreIndexWithCollationForRegex": 1
    }
  }
]
```

Kết quả khá dài, nhưng có mấy điểm cực kỳ quan trọng:


Thành phần | Ý nghĩa tổng quát
|----------|:-------------|
executionStats | Thống kê thực tế về việc thực thi truy vấn (rất quan trọng).
queryPlanner | Kế hoạch thực thi truy vấn: dùng index hay không, quét bảng như thế nào.
winningPlan | Kế hoạch được chọn để chạy truy vấn.
stage: "COLLSCAN" | Collection Scan: MongoDB quét toàn bộ collection để tìm dữ liệu (chậm).
totalDocsExamined: 1000000 | MongoDB đã phải đọc 1 triệu documents để tìm.
totalKeysExamined: 0 | MongoDB không dùng index nào cả.
executionTimeMillis: 2133 | Thời gian thực hiện truy vấn mất khoảng 2.133 giây.
nReturned: 0 | Truy vấn không trả lại dòng nào (email không tồn tại).

🎯 Giải thích chi tiết từng phần
1. executionStats

Thuộc tính | Ý nghĩa
|----------|:-------------|
executionSuccess: true | Truy vấn thực thi thành công.
nReturned: 0 | Không tìm thấy document nào phù hợp.
executionTimeMillis: 2133 | Truy vấn mất 2133ms (~2.1 giây).
totalKeysExamined: 0 | Không sử dụng index.
totalDocsExamined: 1000000 | Phải quét 1 triệu documents để kiểm tra từng cái.
executionStages.stage: "COLLSCAN" | Đang thực hiện Collection Scan, không có index hỗ trợ.

MongoDB đang cực kỳ không tối ưu ở đây vì bạn chưa có index trên email nên nó phải quét toàn bộ collection.

Nếu có index trên email, MongoDB sẽ chuyển sang dùng IXSCAN (Index Scan), nhanh hơn hàng trăm lần.


2. queryPlanner

Thuộc tính | Ý nghĩa
|----------|:-------------|
namespace | Tên database và collection (he-quan-tri-csdl.users).
parsedQuery | Điều kiện lọc (filter): tìm email = 'example@test.com'.
indexFilterSet | Không có filter ép buộc chọn index.
winningPlan.stage | Kế hoạch chọn là COLLSCAN (scan toàn bộ collection).
rejectedPlans | Không có kế hoạch nào khác (không có index nên cũng không reject gì).

🧠 So sánh với PostgreSQL lúc nãy:

PostgreSQL (có Index) | MongoDB (chưa có Index)
|----------|:-------------|
Dùng Index Scan cực nhanh | Dùng Collection Scan cực chậm
Execution Time: ~0.5ms | Execution Time: ~2133ms (~4000 lần chậm hơn)
Docs/Rows examined: 0 hoặc 1 dòng | Docs examined: 1 triệu documents