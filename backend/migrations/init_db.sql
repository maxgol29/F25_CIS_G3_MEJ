CREATE TABLE IF NOT EXISTS "Permission" (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Role" (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS "Address" (
    id SERIAL PRIMARY KEY,
    "street" VARCHAR(255) NOT NULL,
    "building_number" VARCHAR(50),
    "apartment_number" VARCHAR(50),
    "zip_code" VARCHAR(20) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL,
    "latitude" DECIMAL(10, 8),
    "longitude" DECIMAL(11, 8),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Promo_Type" (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "description" TEXT,
    "discount_percentage" FLOAT NOT NULL CHECK ("discount_percentage" > 0 AND "discount_percentage" <= 100),
    "discount_fixed_amount" FLOAT,
    "applies_to_category" VARCHAR(100),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    roleID INTEGER REFERENCES "Role"(id) ON DELETE SET NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "phone" VARCHAR(20),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "is_email_verified" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Payment_Method" (
    id SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
    "type" VARCHAR(50) NOT NULL CHECK ("type" IN ('credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay')),
    "last_four_digits" VARCHAR(4),
    "token" VARCHAR(255) NOT NULL, 
    "cardholder_name" VARCHAR(100),
    "expiration_month" INTEGER CHECK ("expiration_month" >= 1 AND "expiration_month" <= 12),
    "expiration_year" INTEGER,
    "billing_address_id" INTEGER REFERENCES "Address"(id) ON DELETE SET NULL,
    "is_default" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Business" (
    id SERIAL PRIMARY KEY,
    ownerID INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
    addressID INTEGER REFERENCES "Address"(id) ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100),
    "description" TEXT,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "google_place_id" VARCHAR(255) UNIQUE,
    "opening_hours" JSONB, 
    "rating" FLOAT,
    "total_reviews" INTEGER DEFAULT 0,
    "is_verified" BOOLEAN DEFAULT FALSE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Review" (
    id SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
    businessID INTEGER REFERENCES "Business"(id) ON DELETE CASCADE NOT NULL,
    "rating" FLOAT CHECK ("rating" >= 1 AND "rating" <= 5),
    "review_text" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userID, businessID)
);


CREATE TABLE IF NOT EXISTS "Promo_Code" (
    id SERIAL PRIMARY KEY,
    typeID INTEGER REFERENCES "Promo_Type"(id) ON DELETE CASCADE NOT NULL,
    businessID INTEGER REFERENCES "Business"(id) ON DELETE CASCADE NOT NULL,
    "code" VARCHAR(50) NOT NULL UNIQUE,
    "description" TEXT,
    "expiration_date" TIMESTAMP,
    "max_uses" INTEGER,
    "current_uses" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User_Address" (
    userID INTEGER REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
    addressID INTEGER REFERENCES "Address"(id) ON DELETE CASCADE NOT NULL,
    "address_type" VARCHAR(50) CHECK ("address_type" IN ('home', 'work', 'billing', 'shipping')),
    PRIMARY KEY (userID, addressID)
);



CREATE TABLE IF NOT EXISTS "Item" (
    id SERIAL PRIMARY KEY,
    businessID INTEGER REFERENCES "Business"(id) ON DELETE CASCADE NOT NULL,
    "dish_name" TEXT NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "price" FLOAT NOT NULL CHECK ("price" > 0),
    "discount_percentage" FLOAT DEFAULT 0 CHECK ("discount_percentage" >= 0 AND "discount_percentage" <= 100),
    "image_url" TEXT,
    "ingredients" JSONB, 
    "cooking_method" VARCHAR(100),
    "portion_size" VARCHAR(100),
    "available_quantity" INTEGER DEFAULT 0,
    "is_available" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Promo_Code_Item" (
    promoID INTEGER REFERENCES "Promo_Code"(id) ON DELETE CASCADE NOT NULL,
    itemID INTEGER REFERENCES "Item"(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (promoID, itemID)
);

CREATE TABLE IF NOT EXISTS "Order" (
    id SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
    businessID INTEGER REFERENCES "Business"(id) ON DELETE CASCADE NOT NULL,
    promoID INTEGER REFERENCES "Promo_Code"(id) ON DELETE SET NULL,
    paymentMethodID INTEGER REFERENCES "Payment_Method"(id) ON DELETE SET NULL,
    "status" VARCHAR(50) DEFAULT 'pending' CHECK ("status" IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    "subtotal" FLOAT NOT NULL CHECK ("subtotal" > 0),
    "discount_amount" FLOAT DEFAULT 0,
    "tax_amount" FLOAT DEFAULT 0,
    "processing_fee" FLOAT DEFAULT 0,
    "total_amount" FLOAT NOT NULL CHECK ("total_amount" > 0),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Promo_Code_Usage" (
    id SERIAL PRIMARY KEY,
    promoID INTEGER REFERENCES "Promo_Code"(id) ON DELETE CASCADE NOT NULL,
    userID INTEGER REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
    orderID INTEGER REFERENCES "Order"(id) ON DELETE CASCADE NOT NULL,
    "discount_amount" FLOAT NOT NULL,
    "used_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS "User_Auth" (
    id SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES "User"(id) ON DELETE CASCADE NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL, 
    "last_login" TIMESTAMP,
    "password_changed_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Session" (
    id SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
    "token" VARCHAR(500) NOT NULL UNIQUE,
    "refresh_token" VARCHAR(500),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "expires_at" TIMESTAMP NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "logged_out_at" TIMESTAMP
);




