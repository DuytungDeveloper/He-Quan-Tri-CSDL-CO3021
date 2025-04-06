#!/bin/bash

# Set script to exit on error
set -e

echo "============================================"
echo "Starting MongoDB Docker setup with transactions"
echo "============================================"

# Create Docker directory if it doesn't exist
cd Dockers

echo "Starting Docker containers..."
docker compose up -d

echo "Waiting for MongoDB to initialize..."
sleep 15

echo "Setting up MongoDB replica set..."
./init-mongo.sh

echo "MongoDB setup completed successfully!"

# Move to PrepareDatabase directory
cd ../PrepareDatabase

echo "============================================"
echo "Setting up data and indexes in MongoDB"
echo "============================================"

yarn

yarn dev

echo "Data and indexes setup completed successfully!"


echo "============================================"
echo "Install dependencies for Web"
echo "============================================"
cd ../Web

yarn

echo "Web dependencies installed successfully!"
echo "============================================"
echo "Everything is ready!"
echo "============================================"