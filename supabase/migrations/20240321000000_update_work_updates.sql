-- Rename work_update column to work_updates and change type to JSONB
ALTER TABLE notes
RENAME COLUMN work_update TO work_updates;

-- Convert existing work_update data to JSONB format
UPDATE notes
SET work_updates = CASE 
    WHEN work_updates IS NOT NULL AND work_updates != '' THEN
        jsonb_build_array(
            jsonb_build_object(
                'text', work_updates,
                'timestamp', created_at,
                'userEmail', useremail
            )
        )
    ELSE '[]'::jsonb
END;

-- Change column type to JSONB
ALTER TABLE notes
ALTER COLUMN work_updates TYPE jsonb USING work_updates::jsonb; 