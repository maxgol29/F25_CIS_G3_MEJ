CREATE TABLE IF NOT EXISTS item (
    image_url TEXT,
    dish_name TEXT NOT NULL,
    food_type TEXT,
    ingredients JSONB,
    portion_size JSONB,
    nutritional_profile JSONB,
    cooking_method TEXT
);

CREATE TABLE IF NOT EXISTS review (
    review_text TEXT NOT NULL,
    label TEXT NOT NULL
);