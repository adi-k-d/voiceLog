-- Add assigned_to and assigned_by columns to notes table
ALTER TABLE notes
ADD COLUMN assigned_to TEXT,
ADD COLUMN assigned_by TEXT; 