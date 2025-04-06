# init-mongo.sh
#!/bin/bash
echo "Waiting for MongoDB to start..."
sleep 15

echo "Initializing replica set..."
docker exec -it he-quan-tri-csdl-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "rs.initiate({
  _id: 'rs0',
  members: [{ _id: 0, host: 'localhost:27017' }]
})"

echo "Checking replica set status..."
sleep 5
docker exec -it he-quan-tri-csdl-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "rs.status()"

echo "Replica set initialization completed"