DO $$
DECLARE
    b RECORD;
    items_to_assign INT;
BEGIN
    FOR b IN SELECT id FROM "Business" LOOP
        items_to_assign := 10 + floor(random() * 41); 
        UPDATE "Item"
        SET businessID = b.id
        WHERE id IN (
            SELECT id 
            FROM "Item"
            WHERE businessID IS NULL 
            ORDER BY random()
            LIMIT items_to_assign
        );

    END LOOP;
END $$;
