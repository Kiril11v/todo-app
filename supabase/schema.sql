-- =============================================================================
-- Todo App: database schema
-- Run this whole file in the Supabase SQL Editor of a new, empty project.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Tables
-- -----------------------------------------------------------------------------

create table if not exists public.tasks (
  id           uuid        primary key default gen_random_uuid(),
  title        text        not null default '',
  created_at   timestamptz not null default now(),
  completed_at timestamptz,
  archived_at  timestamptz,
  deadline     date,
  failed       boolean,
  image_url    text,
  user_id      uuid        default auth.uid()
                           references auth.users (id) on delete cascade
);

comment on table public.tasks is 'user tasks';

create table if not exists public.subtasks (
  id        uuid    primary key default gen_random_uuid(),
  task_id   uuid    not null
                    references public.tasks (id)
                    on update cascade on delete cascade,
  title     text    not null default '',
  completed boolean not null default false
);


-- -----------------------------------------------------------------------------
-- 2. Function: create a task together with its subtasks in one transaction
-- -----------------------------------------------------------------------------

create or replace function public.create_task_with_subtasks(
  p_title     text,
  p_image_url text        default null,
  p_deadline  timestamptz default null,
  p_subtasks  jsonb       default '[]'::jsonb
)
returns jsonb
language plpgsql
as $$
declare
  v_task     public.tasks;
  v_subtasks jsonb;
  v_user_id  uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.tasks (title, image_url, deadline, user_id)
  values (p_title, p_image_url, p_deadline, v_user_id)
  returning * into v_task;

  insert into public.subtasks (task_id, title)
  select v_task.id, trim(x->>'title')
  from jsonb_array_elements(p_subtasks) x
  where x->>'title' is not null
    and trim(x->>'title') <> '';

  select coalesce(jsonb_agg(s), '[]'::jsonb)
  into v_subtasks
  from public.subtasks s
  where s.task_id = v_task.id;

  return jsonb_build_object('task', to_jsonb(v_task), 'subtasks', v_subtasks);
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. Row Level Security: tasks
-- -----------------------------------------------------------------------------

alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
  on public.tasks for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete to authenticated
  using ((select auth.uid()) = user_id);


-- -----------------------------------------------------------------------------
-- 4. Row Level Security: subtasks (access through the parent task)
-- -----------------------------------------------------------------------------

alter table public.subtasks enable row level security;

create policy "Users can view their own subtasks"
  on public.subtasks for select to authenticated
  using (exists (
    select 1 from public.tasks
    where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()
  ));

create policy "Users can insert their own subtasks"
  on public.subtasks for insert to authenticated
  with check (exists (
    select 1 from public.tasks
    where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()
  ));

create policy "Users can update their own subtasks"
  on public.subtasks for update to authenticated
  using (exists (
    select 1 from public.tasks
    where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()
  ));

create policy "Users can delete their own subtasks"
  on public.subtasks for delete to authenticated
  using (exists (
    select 1 from public.tasks
    where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()
  ));


-- -----------------------------------------------------------------------------
-- 5. Storage: bucket for task images and its policies
--    (files are stored in a folder named after the user id)
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('task-images', 'task-images', true)
on conflict (id) do nothing;

create policy "Users can view their own images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'task-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload their own images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'task-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'task-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- -----------------------------------------------------------------------------
-- 6. Permissions
-- -----------------------------------------------------------------------------

grant all on table public.tasks    to authenticated, service_role;
grant all on table public.subtasks to authenticated, service_role;

grant execute on function public.create_task_with_subtasks(text, text, timestamptz, jsonb)
  to authenticated, service_role;