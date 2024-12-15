-- Add icon column to topics table
ALTER TABLE topics
ADD COLUMN icon text NOT NULL DEFAULT 'Folder';

-- Update existing topics to have the default icon
UPDATE topics
SET icon = 'Folder'
WHERE icon IS NULL;
