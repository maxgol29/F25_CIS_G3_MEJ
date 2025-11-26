#!/bin/bash
set -e

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f backend/migrations/init_db.sql

echo "Tables created successfully"