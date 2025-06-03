-- Add email column to profiles table
ALTER TABLE profiles
ADD COLUMN email TEXT;

-- Update existing profiles with email from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Make email column NOT NULL after updating existing records
ALTER TABLE profiles
ALTER COLUMN email SET NOT NULL;

-- Create a trigger to automatically update email when auth.users email changes
CREATE OR REPLACE FUNCTION update_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_email(); 