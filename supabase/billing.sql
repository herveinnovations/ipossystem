-- Plans, free trial and payment (MVP).
-- * Every shop gets a free trial; existing shops get 14 days from when this runs.
-- * Owners pay by mobile money or bank, then submit the reference in iPOS (Billing page).
-- * The creator approves the payment in the Creator console, which extends "paid until".
-- * When the trial/plan has ended (plus 3 days' grace), new sales are refused by the
--   database itself. Shops can still sign in, see and download all their data.
-- Tables have row-level security on and no policies: they are only reached through the
-- functions below, which check who is asking.

create table public.subscriptions(
  company_id uuid primary key references public.companies(id) on delete cascade,
  plan text not null default 'standard',
  trial_ends_at timestamptz,
  paid_until timestamptz,
  suspended boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
revoke all on public.subscriptions from anon, authenticated;

create table public.payment_claims(
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  submitted_by uuid not null default auth.uid(),
  method text not null check (method in ('MTN Money', 'Airtel Money', 'Zamtel Kwacha', 'Bank transfer')),
  reference text not null check (length(trim(reference)) between 3 and 80),
  payer_phone text check (payer_phone is null or length(payer_phone) <= 30),
  amount numeric(12,2) not null check (amount > 0 and amount < 1000000),
  months integer not null check (months between 1 and 24),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index payment_claims_company on public.payment_claims(company_id, created_at desc);
alter table public.payment_claims enable row level security;
revoke all on public.payment_claims from anon, authenticated;

-- Grace period after the end date before sales are refused.
create function private.plan_grace() returns interval language sql immutable as $$ select interval '3 days' $$;

-- When the shop's access ends (trial or paid, whichever is later). Null = no limit set.
create function private.plan_end(cid uuid) returns timestamptz
language sql stable security definer set search_path = '' as $$
  select greatest(s.trial_ends_at, s.paid_until) from public.subscriptions s where s.company_id = cid
$$;

-- Can this shop record a sale made at time "at"?
create function private.plan_allows_sale(cid uuid, at timestamptz) returns boolean
language sql stable security definer set search_path = '' as $$
  select case
    when s.company_id is null then true                       -- no record yet: never block
    when s.suspended then false
    when greatest(s.trial_ends_at, s.paid_until) is null then true
    -- allowed while the plan (plus grace) is running, or for an offline sale that was
    -- made before it ended and is only syncing now
    else now() < greatest(s.trial_ends_at, s.paid_until) + private.plan_grace()
      or (at <= now() and at < greatest(s.trial_ends_at, s.paid_until) + private.plan_grace())
  end
  from (select cid as c) x left join public.subscriptions s on s.company_id = x.c
$$;

-- New shops start a 14-day free trial.
create function private.start_trial() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.subscriptions(company_id, trial_ends_at) values (new.id, now() + interval '14 days')
  on conflict (company_id) do nothing;
  return new;
end $$;
create trigger companies_start_trial after insert on public.companies
for each row execute function private.start_trial();

-- Refuse new sales once the plan has ended. Offline sales made before the end still sync.
create function private.guard_sale_plan() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not private.plan_allows_sale(new.company_id, new.created_at) then
    raise exception 'IPOS_PLAN_ENDED: This shop''s iPOS plan has ended. The owner can renew it under Billing.'
      using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger sales_plan_guard before insert on public.sales
for each row execute function private.guard_sale_plan();

-- Existing shops: 14-day launch trial from today.
insert into public.subscriptions(company_id, trial_ends_at)
select c.id, now() + interval '14 days' from public.companies c
on conflict (company_id) do nothing;

-- ------------------------------------------------------------- shop side
create function private.my_subscription(p_company_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare r text := private.member_role(p_company_id); s public.subscriptions; ends timestamptz;
begin
  if r is null then raise exception 'Not allowed'; end if;
  select * into s from public.subscriptions where company_id = p_company_id;
  ends := greatest(s.trial_ends_at, s.paid_until);
  return jsonb_build_object(
    'plan', coalesce(s.plan, 'standard'),
    'state', case when s.company_id is null then 'active'
                  when s.suspended then 'suspended'
                  when ends is null then 'active'
                  when now() < ends then case when s.paid_until is not null and s.paid_until >= coalesce(s.trial_ends_at, s.paid_until) then 'paid' else 'trial' end
                  when now() < ends + private.plan_grace() then 'grace'
                  else 'ended' end,
    'trial_ends_at', s.trial_ends_at,
    'paid_until', s.paid_until,
    'ends_at', ends,
    'grace_ends_at', ends + private.plan_grace(),
    'can_sell', private.plan_allows_sale(p_company_id, now()),
    'claims', case when r = 'director' then coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'method', c.method, 'reference', c.reference, 'amount', c.amount,
        'months', c.months, 'status', c.status, 'review_note', c.review_note, 'created_at', c.created_at) order by c.created_at desc)
      from (select * from public.payment_claims where company_id = p_company_id order by created_at desc limit 20) c), '[]'::jsonb)
      else '[]'::jsonb end
  );
end $$;

create function private.submit_payment_claim(p_company_id uuid, p_method text, p_reference text, p_amount numeric, p_months integer, p_phone text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if private.member_role(p_company_id) is distinct from 'director' then raise exception 'Only the shop owner can submit payments.'; end if;
  if (select count(*) from public.payment_claims where company_id = p_company_id and status = 'pending') >= 3 then
    raise exception 'You already have 3 payments waiting to be confirmed. Please wait for them to be checked.';
  end if;
  if exists (select 1 from public.payment_claims where lower(trim(reference)) = lower(trim(p_reference)) and status <> 'rejected') then
    raise exception 'That payment reference has already been submitted.';
  end if;
  insert into public.payment_claims(company_id, method, reference, amount, months, payer_phone)
  values (p_company_id, p_method, trim(p_reference), p_amount, p_months, nullif(trim(coalesce(p_phone, '')), ''))
  returning id into new_id;
  return new_id;
end $$;

-- ------------------------------------------------------------- creator side
create function private.creator_billing() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.creator_guard();
  return jsonb_build_object(
    'shops', coalesce((select jsonb_agg(x order by x->>'ends_at' nulls first) from (
      select jsonb_build_object('company_id', c.id, 'name', c.name,
        'owner_email', (select u.email from public.company_users cu join auth.users u on u.id = cu.user_id
                        where cu.company_id = c.id and cu.role = 'director' order by u.created_at limit 1),
        'branches', (select count(*) from public.branches b where b.company_id = c.id),
        'trial_ends_at', s.trial_ends_at, 'paid_until', s.paid_until, 'suspended', coalesce(s.suspended, false), 'note', s.note,
        'ends_at', greatest(s.trial_ends_at, s.paid_until), 'can_sell', private.plan_allows_sale(c.id, now())) x
      from public.companies c left join public.subscriptions s on s.company_id = c.id) t), '[]'::jsonb),
    'claims', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'company_id', p.company_id, 'shop', c.name,
        'method', p.method, 'reference', p.reference, 'payer_phone', p.payer_phone, 'amount', p.amount, 'months', p.months,
        'status', p.status, 'review_note', p.review_note, 'created_at', p.created_at,
        'submitted_by', (select email from auth.users where id = p.submitted_by)) order by p.created_at desc)
      from public.payment_claims p join public.companies c on c.id = p.company_id
      where p.status = 'pending' or p.created_at > now() - interval '60 days'), '[]'::jsonb)
  );
end $$;

-- action: 'extend' (add p_months paid months), 'trial' (add p_days trial days), 'suspend', 'resume'
create function private.creator_set_plan(p_company_id uuid, p_action text, p_months integer, p_days integer, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.creator_guard();
  insert into public.subscriptions(company_id) values (p_company_id) on conflict (company_id) do nothing;
  if p_action = 'extend' then
    if coalesce(p_months, 0) not between 1 and 36 then raise exception 'Months must be 1 to 36.'; end if;
    update public.subscriptions set
      paid_until = greatest(now(), coalesce(paid_until, now()), coalesce(trial_ends_at, now())) + make_interval(months => p_months),
      suspended = false, updated_at = now(), note = coalesce(nullif(p_note, ''), note)
    where company_id = p_company_id;
  elsif p_action = 'trial' then
    if coalesce(p_days, 0) not between 1 and 90 then raise exception 'Days must be 1 to 90.'; end if;
    update public.subscriptions set trial_ends_at = greatest(now(), coalesce(trial_ends_at, now())) + make_interval(days => p_days),
      updated_at = now(), note = coalesce(nullif(p_note, ''), note)
    where company_id = p_company_id;
  elsif p_action in ('suspend', 'resume') then
    update public.subscriptions set suspended = (p_action = 'suspend'), updated_at = now(), note = coalesce(nullif(p_note, ''), note)
    where company_id = p_company_id;
  else raise exception 'Unknown action.'; end if;
end $$;

create function private.creator_review_claim(p_id uuid, p_approve boolean, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare c public.payment_claims;
begin
  perform private.creator_guard();
  select * into c from public.payment_claims where id = p_id for update;
  if c.id is null then raise exception 'Payment not found.'; end if;
  if c.status <> 'pending' then raise exception 'This payment was already %.', c.status; end if;
  update public.payment_claims set status = case when p_approve then 'approved' else 'rejected' end,
    review_note = nullif(p_note, ''), reviewed_at = now() where id = p_id;
  if p_approve then perform private.creator_set_plan(c.company_id, 'extend', c.months, null, null); end if;
end $$;

-- ------------------------------------------------------------- API wrappers
create function public.my_subscription(p_company_id uuid) returns jsonb language sql stable set search_path = '' as $$ select private.my_subscription(p_company_id) $$;
create function public.submit_payment_claim(p_company_id uuid, p_method text, p_reference text, p_amount numeric, p_months integer, p_phone text) returns uuid language sql set search_path = '' as $$ select private.submit_payment_claim(p_company_id, p_method, p_reference, p_amount, p_months, p_phone) $$;
create function public.creator_billing() returns jsonb language sql stable set search_path = '' as $$ select private.creator_billing() $$;
create function public.creator_set_plan(p_company_id uuid, p_action text, p_months integer, p_days integer, p_note text) returns void language sql set search_path = '' as $$ select private.creator_set_plan(p_company_id, p_action, p_months, p_days, p_note) $$;
create function public.creator_review_claim(p_id uuid, p_approve boolean, p_note text) returns void language sql set search_path = '' as $$ select private.creator_review_claim(p_id, p_approve, p_note) $$;

do $grants$
declare f text;
begin
  foreach f in array array[
    'private.my_subscription(uuid)', 'private.submit_payment_claim(uuid,text,text,numeric,integer,text)',
    'private.creator_billing()', 'private.creator_set_plan(uuid,text,integer,integer,text)', 'private.creator_review_claim(uuid,boolean,text)',
    'public.my_subscription(uuid)', 'public.submit_payment_claim(uuid,text,text,numeric,integer,text)',
    'public.creator_billing()', 'public.creator_set_plan(uuid,text,integer,integer,text)', 'public.creator_review_claim(uuid,boolean,text)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
  foreach f in array array['private.plan_grace()', 'private.plan_end(uuid)', 'private.plan_allows_sale(uuid,timestamptz)', 'private.start_trial()', 'private.guard_sale_plan()'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
  end loop;
end $grants$;
