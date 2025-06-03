-- Create user_info table
CREATE TABLE IF NOT EXISTS user_info (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_info_updated_at
  BEFORE UPDATE ON user_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_info (id, email, username)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically create user_info entries
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant access to the user_info table
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user info"
  ON user_info FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO user_info (id, email, username)
VALUES
  ('10929f56-24a0-4a1e-85f5-095fd1b14f97', 'adityakdas7@gmail.com', 'adityakdas7@gmail.com'),
  ('21eaf7ae-b094-4a07-b449-c575a3a49c9e', 'ajayb@prometheanenergy.com', 'ajayb@prometheanenergy.com'),
  ('4b247765-1bc2-4ec4-94d4-f20d5ba37b3b', 'ashwinkp+voicelog@prometheanenergy.com', 'ashwinkp+voicelog@prometheanenergy.com'),  
  ('e684ad23-...', 'ashwinkp@prometheanenergy.com', 'ashwinkp@prometheanenergy.com');