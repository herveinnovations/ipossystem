\set ON_ERROR_STOP 1
-- fixtures (as postgres)
insert into auth.users(id,email,email_confirmed_at) values
 ('00000000-0000-0000-0000-0000000000d1','owner@shop.zm',now()),
 ('00000000-0000-0000-0000-0000000000c1','cashier@shop.zm',now()),
 ('00000000-0000-0000-0000-0000000000e1','stranger@x.zm',now()),
 ('00000000-0000-0000-0000-0000000000f1','dafredmukunah@gmail.com',now());
insert into public.companies(id,name) values ('00000000-0000-0000-0000-00000000aaaa','Test Shop');
insert into public.company_users values ('00000000-0000-0000-0000-00000000aaaa','00000000-0000-0000-0000-0000000000d1','director',true),('00000000-0000-0000-0000-00000000aaaa','00000000-0000-0000-0000-0000000000c1','cashier',true);
create function pg_temp.sale(at timestamptz) returns text language plpgsql as $$
begin
  insert into public.sales(request_id,company_id,cashier_id,cashier_name,receipt_number,created_at,currency,subtotal,tax,discount,total,amount_paid,change,item_count,payment_method)
  values (gen_random_uuid(),'00000000-0000-0000-0000-00000000aaaa','00000000-0000-0000-0000-0000000000c1','C','R'||gen_random_uuid(),at,'ZMW',10,0,0,10,10,0,1,'Cash');
  return 'allowed';
exception when others then return 'blocked: '||left(sqlerrm,40); end $$;
create function pg_temp.as_user(uid text) returns void language plpgsql as $$ begin
  perform set_config('request.jwt.claims', json_build_object('sub',uid,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true); end $$;
create function pg_temp.try(q text) returns text language plpgsql as $$ declare r text; begin execute q into r; return coalesce(r,'ok'); exception when others then return 'ERR: '||left(sqlerrm,70); end $$;

select '1 trial row created: '||(trial_ends_at between now()+interval '29 days' and now()+interval '31 days') from public.subscriptions where company_id='00000000-0000-0000-0000-00000000aaaa';
select '2 sale during trial: '||pg_temp.sale(now());

begin;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000d1');
select '3 owner sees: '||(public.my_subscription('00000000-0000-0000-0000-00000000aaaa')->>'state')||' can_sell='||(public.my_subscription('00000000-0000-0000-0000-00000000aaaa')->>'can_sell');
select '4 owner direct table read: '||pg_temp.try('select count(*)::text from public.subscriptions');
select '5 cashier tries claim: '||pg_temp.try($q$select 'x' from (select 1) z$q$) as skip;
select '5b owner submits claim: '||pg_temp.try($q$select public.submit_payment_claim('00000000-0000-0000-0000-00000000aaaa','MTN Money','MP241101.1234.A1',250,1,'0977000000')::text$q$);
select '6 duplicate reference: '||pg_temp.try($q$select public.submit_payment_claim('00000000-0000-0000-0000-00000000aaaa','MTN Money','mp241101.1234.a1',250,1,null)::text$q$);
select '7 bad method: '||pg_temp.try($q$select public.submit_payment_claim('00000000-0000-0000-0000-00000000aaaa','Cash','REF-777',250,1,null)::text$q$);
select '8 owner calls creator fn: '||pg_temp.try('select public.creator_billing()::text');
commit;

begin; select pg_temp.as_user('00000000-0000-0000-0000-0000000000c1');
select '9 cashier claim: '||pg_temp.try($q$select public.submit_payment_claim('00000000-0000-0000-0000-00000000aaaa','MTN Money','CASHIER-1',250,1,null)::text$q$);
select '10 cashier sees claims: '||(public.my_subscription('00000000-0000-0000-0000-00000000aaaa')->'claims')::text;
commit;
begin; select pg_temp.as_user('00000000-0000-0000-0000-0000000000e1');
select '11 stranger: '||pg_temp.try($q$select public.my_subscription('00000000-0000-0000-0000-00000000aaaa')::text$q$);
commit;
begin; set local role anon;
select '12 anon: '||pg_temp.try($q$select public.my_subscription('00000000-0000-0000-0000-00000000aaaa')::text$q$);
commit;

-- expire
update public.subscriptions set trial_ends_at = now() - interval '1 day' where company_id='00000000-0000-0000-0000-00000000aaaa';
select '13 in grace (ended 1 day ago): '||pg_temp.sale(now());
update public.subscriptions set trial_ends_at = now() - interval '10 days' where company_id='00000000-0000-0000-0000-00000000aaaa';
select '14 ended 10 days ago, new sale: '||pg_temp.sale(now());
select '15 offline sale made 8 days ago (before grace end): '||pg_temp.sale(now() - interval '8 days');
select '16 offline sale made 6 days ago (after grace end): '||pg_temp.sale(now() - interval '6 days');
select '17 future-dated sale: '||pg_temp.sale(now() + interval '1 day');
begin; select pg_temp.as_user('00000000-0000-0000-0000-0000000000d1');
select '18 owner state: '||(public.my_subscription('00000000-0000-0000-0000-00000000aaaa')->>'state');
commit;

-- creator approves
select id as claim_id from public.payment_claims limit 1 \gset
begin; select pg_temp.as_user('00000000-0000-0000-0000-0000000000f1');
select '19 creator sees claims: '||jsonb_array_length(public.creator_billing()->'claims')||' shops: '||jsonb_array_length(public.creator_billing()->'shops');
select '20 approve: '||pg_temp.try(format('select public.creator_review_claim(%L::uuid, true, %L)::text', :'claim_id', 'MTN confirmed'));
select '21 approve again: '||pg_temp.try(format('select public.creator_review_claim(%L::uuid, true, null)::text', :'claim_id'));
commit;
select '22 paid_until ~1 month: '||(paid_until between now()+interval '27 days' and now()+interval '32 days') from public.subscriptions where company_id='00000000-0000-0000-0000-00000000aaaa';
select '23 sale after payment: '||pg_temp.sale(now());
begin; select pg_temp.as_user('00000000-0000-0000-0000-0000000000f1');
select '24 suspend: '||pg_temp.try($q$select public.creator_set_plan('00000000-0000-0000-0000-00000000aaaa','suspend',null,null,'test')::text$q$);
commit;
select '25 sale while suspended: '||pg_temp.sale(now());
begin; select pg_temp.as_user('00000000-0000-0000-0000-0000000000f1');
select '26 resume + extend 2 months: '||pg_temp.try($q$select public.creator_set_plan('00000000-0000-0000-0000-00000000aaaa','resume',null,null,null)::text$q$)||' / '||pg_temp.try($q$select public.creator_set_plan('00000000-0000-0000-0000-00000000aaaa','extend',2,null,null)::text$q$);
select '27 bad months: '||pg_temp.try($q$select public.creator_set_plan('00000000-0000-0000-0000-00000000aaaa','extend',99,null,null)::text$q$);
commit;
select '28 paid_until ~3 months: '||(paid_until between now()+interval '85 days' and now()+interval '95 days')||' '||(paid_until-now())::text from public.subscriptions where company_id='00000000-0000-0000-0000-00000000aaaa';
select '29 sale: '||pg_temp.sale(now());
-- unverified creator email can't use creator fns
update auth.users set email_confirmed_at = null where email='dafredmukunah@gmail.com';
begin; select pg_temp.as_user('00000000-0000-0000-0000-0000000000f1');
select '30 unverified creator: '||pg_temp.try('select public.creator_billing()::text');
commit;
