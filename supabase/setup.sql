-- إعداد قاعدة بيانات موقع عبدالله
-- إذا كنت ستستخدم بريدًا آخر للمدير، غيّر البريد في السياسات أدناه قبل التشغيل.

create table if not exists public.cv_content (
  id text primary key default 'main' check (id = 'main'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.cv_content enable row level security;

-- كل الزوار يمكنهم قراءة المحتوى فقط.
drop policy if exists "Public can read CV" on public.cv_content;
create policy "Public can read CV"
on public.cv_content for select
to anon, authenticated
using (true);

-- بريد المدير فقط يمكنه إنشاء المحتوى أو تحديثه.
drop policy if exists "Admin can insert CV" on public.cv_content;
create policy "Admin can insert CV"
on public.cv_content for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'abdallahai369@gmail.com');

drop policy if exists "Admin can update CV" on public.cv_content;
create policy "Admin can update CV"
on public.cv_content for update
to authenticated
using ((auth.jwt() ->> 'email') = 'abdallahai369@gmail.com')
with check ((auth.jwt() ->> 'email') = 'abdallahai369@gmail.com');

grant select on table public.cv_content to anon, authenticated;
grant insert, update on table public.cv_content to authenticated;

-- لا تضف صلاحية DELETE ولا تستخدم مفتاح service_role داخل الموقع.
