SELECT json_agg(user_row)
FROM (
  SELECT
    user_name,
    email,
    photo_url,
    tagged_people
  FROM user_photos_paginated
  ORDER BY user_name
  LIMIT 10
) AS user_row;
