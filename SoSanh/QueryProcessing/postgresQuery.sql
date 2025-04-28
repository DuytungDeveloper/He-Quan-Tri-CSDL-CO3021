-- 📜 1. EXPLAIN (Query Plan)
EXPLAIN ANALYZE
SELECT * FROM users
WHERE email = 'example@test.com';
Index Scan using users_email_key on users  (cost=0.42..8.44 rows=1 width=93) (actual time=0.349..0.349 rows=0 loops=1)
  Index Cond: ((email)::text = 'example@test.com'::text)
Planning Time: 0.711 ms
Execution Time: 0.533 ms


-- 📜 2. JOIN (Combine users and their orders)
SELECT orders.id, users.username, orders.total_price
FROM orders
JOIN users ON orders.user_id = users.id;


-- 📜 3. UNION (combine names from users and products)
SELECT username AS name FROM users
UNION
SELECT name FROM products;


-- 📜 4. TRANSACTION (Atomic multiple queries)
BEGIN;

INSERT INTO orders (user_id, total_price, order_date, status)
VALUES (1, 99.99, NOW(), 'pending');

INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
VALUES (currval('orders_id_seq'), 101, 'Flute Bamboo', 2, 49.99);

COMMIT;


-- 📜 5. GROUP BY (count products by category)
SELECT category, COUNT(*) AS total_products
FROM products
GROUP BY category;

-- 📜 6. HAVING (Filter groups)
SELECT category, COUNT(*) AS total_products
FROM products
GROUP BY category
HAVING COUNT(*) > 5;


-- 📜 7. INDEX (create index on email)
CREATE INDEX idx_users_email ON users(email);


-- 📜 8. VIEW (Create a saved query)
CREATE VIEW active_users AS
SELECT id, username, email
FROM users
WHERE email IS NOT NULL;


-- 📜 9. TRIGGER (Auto action after insert)
-- First, create a function
CREATE OR REPLACE FUNCTION log_order_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_logs (order_id, log_time)
  VALUES (NEW.id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Then create a trigger
CREATE TRIGGER after_order_insert
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_insert();


-- 📜 10. PROCEDURE (reusable operation)
CREATE OR REPLACE PROCEDURE create_order(
    IN p_user_id INT,
    IN p_total_price NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO orders(user_id, total_price, order_date, status)
    VALUES (p_user_id, p_total_price, NOW(), 'pending');
END;
$$;

-- Call procedure
CALL create_order(1, 199.99);


-- 📜 11. FUNCTION (return a value)	
CREATE OR REPLACE FUNCTION get_user_email(p_user_id INT)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM users WHERE id = p_user_id;
    RETURN user_email;
END;
$$ LANGUAGE plpgsql;

-- Usage
SELECT get_user_email(1);

