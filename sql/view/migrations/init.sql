CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  base_url TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many relationship for users tagged in photos
CREATE TABLE tagged_users (
  photo_id INTEGER REFERENCES photos(id),
  user_id INTEGER REFERENCES users(id),
  PRIMARY KEY (photo_id, user_id)
);