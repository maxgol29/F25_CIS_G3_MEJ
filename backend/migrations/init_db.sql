CREATE TABLE IF NOT EXISTS "Item" (
    id SERIAL PRIMARY KEY,
    promoID INTEGER REFERENCES "Promo_Code"(id) ON DELETE SET NULL,
    businessID INTEGER REFERENCES "Business"(id) ON DELETE SET NULL,
    "image_url" TEXT,
    "dish_name" TEXT NOT NULL,
    "food_type" TEXT,
    "ingredients" JSONB,
    "portion_size" JSONB,
    "nutritional_profile" JSONB,
    "cooking_method" TEXT,
    "price" FLOAT
);

CREATE TABLE IF NOT EXISTS "Review" (
    id SERIAL PRIMARY KEY,
    "review_text" TEXT NULL,
    "label" TEXT NULL
);


CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    roleID INTEGER REFERENCES "Role"(id) ON DELETE SET NULL,
    addressID INTEGER REFERENCES "Address"(id) ON DELETE SET NULL,
    paymentID INTEGER REFERENCES "Payment"(id) ON DELETE SET NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "phone" VARCHAR(20),
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Business" (
    id SERIAL PRIMARY KEY,
    reviewID INTEGER REFERENCES "Review"(id) ON DELETE SET NULL,
    ownerID INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100),
    "location" VARCHAR(255),
    "open_hours" VARCHAR(255),
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Address" (
    id SERIAL PRIMARY KEY,
    "street" VARCHAR(255),
    "bd" VARCHAR(50),
    "flat" VARCHAR(50),
    "zip" VARCHAR(20),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS "Role" (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    permissionID INTEGER REFERENCES "Permission"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Permission" (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Promo_Code" (
    id SERIAL PRIMARY KEY,
    typeID INTEGER REFERENCES "PromoType"(id) ON DELETE SET NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT
);



CREATE TABLE IF NOT EXISTS "Payment" (
    id SERIAL PRIMARY KEY,
    "type" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "number" BIGINT NOT NULL,
    "cvv" INTEGER NOT NULL,
    "expiration_date" DATE NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "state" VARCHAR(100),
    "zip" VARCHAR(20),
    "country" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "PromoType" (
    id SERIAL PRIMARY KEY,
    "percentage" FLOAT NOT NULL,
    "item" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL
);



