create or replace function public.apply_country_code_to_contacts(
  code_prefix text,
  filter_user_id uuid
) returns integer
language plpgsql
as $$
declare
  affected integer;
begin
  update dashboard_contacts
  set whatsapp = code_prefix || coalesce(whatsapp, '')
  where user_id = filter_user_id;

  GET DIAGNOSTICS affected = ROW_COUNT;
  return affected;
end;
$$;

