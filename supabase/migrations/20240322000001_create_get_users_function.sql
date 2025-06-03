-- Create a function to get all users
CREATE OR REPLACE FUNCTION get_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT
) SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    p.username
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users() TO authenticated;

-- Create a simple user_directory table
CREATE TABLE IF NOT EXISTS user_directory (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT
);

-- (Optional) Insert initial users
INSERT INTO user_directory (id, email, username) VALUES
  ('10929f56-24a0-4a1e-85f5-095fd1b14f97', 'adityakdas7@gmail.com', 'adityakdas7@gmail.com'),
  ('21eaf7ae-b094-4a07-b449-c575a3a49c9e', 'ajayb@prometheanenergy.com', 'ajayb@prometheanenergy.com'),
  ('4b247765-1bc2-4ec4-94d4-f20d5ba37b3b', 'ashwinkp+voicelog@prometheanenergy.com', 'ashwinkp+voicelog@prometheanenergy.com'),
  ('e684ad23-3602-4d11-9c56-5abf19bcb0da', 'ashwinkp@prometheanenergy.com', 'ashwinkp@prometheanenergy.com'); 