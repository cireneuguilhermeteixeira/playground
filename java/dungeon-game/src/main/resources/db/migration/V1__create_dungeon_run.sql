create table if not exists dungeon_run (
  id uuid primary key,
  game jsonb not null,
  answer integer not null,
  duration_ms bigint not null,
  created_at timestamptz not null default now()
);
