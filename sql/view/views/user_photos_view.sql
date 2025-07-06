CREATE VIEW user_photos_paginated AS
SELECT
  u.id AS user_id,
  u.name AS user_name,
  u.email,
  p.base_url AS photo_url,
  ARRAY_AGG(json_build_object('user_name', tagged.name, 'email', tagged.email)) AS tagged_people
FROM users u
LEFT JOIN photos p ON p.user_id = u.id
LEFT JOIN tagged_users tu ON tu.photo_id = p.id
LEFT JOIN users tagged ON tagged.id = tu.user_id
GROUP BY u.id, p.id
ORDER BY u.id, p.created_at;