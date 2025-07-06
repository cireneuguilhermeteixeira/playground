-- Users
INSERT INTO users (name, email, password) VALUES
    ('Alice', 'alice@example.com', 'password123'),     -- 1
    ('Bob', 'bob@example.com', 'password123'),         -- 2
    ('Charlie', 'charlie@example.com', 'password123'), -- 3
    ('Dave', 'dave@example.com', 'password123'),       -- 4
    ('Eve', 'eve@example.com', 'password123'),         -- 5
    ('Frank', 'frank@example.com', 'password123'),     -- 6
    ('Grace', 'grace@example.com', 'password123'),     -- 7
    ('Hannah', 'hannah@example.com', 'password123'),   -- 8
    ('Ivy', 'ivy@example.com', 'password123'),         -- 9
    ('Jack', 'jack@example.com', 'password123'),       -- 10
    ('Kevin', 'kevin@example.com', 'password123');     -- 11

-- Photos (users 1, 2, 3... are the owners of these photos)
INSERT INTO photos (base_url, user_id) VALUES
    ('http://example.com/photo1.jpg', 1),
    ('http://example.com/photo2.jpg', 1),
    ('http://example.com/photo3.jpg', 2),
    ('http://example.com/photo5.jpg', 2),
    ('http://example.com/photo6.jpg', 3),
    ('http://example.com/photo7.jpg', 1),
    ('http://example.com/photo8.jpg', 2),
    ('http://example.com/photo9.jpg', 3),
    ('http://example.com/photo10.jpg', 1),
    ('http://example.com/photo11.jpg', 2),
    ('http://example.com/photo13.jpg', 4),
    ('http://example.com/photo14.jpg', 5),
    ('http://example.com/photo15.jpg', 6),
    ('http://example.com/photo16.jpg', 7),
    ('http://example.com/photo17.jpg', 8),
    ('http://example.com/photo18.jpg', 9),
    ('http://example.com/photo19.jpg', 10),
    ('http://example.com/photo20.jpg', 11);

-- Tagged Users (associating users with photos)
INSERT INTO tagged_users (photo_id, user_id) VALUES
    (1, 2),
    (1, 3),
    (2, 4),
    (2, 6),
    (2, 7),
    (3, 4),
    (3, 5),
    (3, 6),
    (5, 1),
    (5, 2),
    (5, 3),
    (5, 4),
    (6, 7),
    (6, 8),
    (6, 9),
    (7, 1),
    (7, 2),
    (7, 3),
    (7, 4),
    (8, 5),
    (8, 6),
    (8, 7),
    (8, 8),
    (9, 9),
    (9, 10),
    (9, 11),
    (3, 1),
    (3, 3),
    (4, 2),
    (4, 6);
