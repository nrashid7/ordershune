-- Demo seed data for OrderShune
-- After creating a user in Supabase Auth with email demo@ordershune.test,
-- replace DEMO_USER_ID below with that user's UUID and run this migration.

-- Fixed demo UUID for documentation (update after signup if needed)
-- DEMO_USER_ID: 00000000-0000-4000-8000-000000000001

do $$
declare
  demo_user_id uuid := '00000000-0000-4000-8000-000000000001';
begin
  if exists (select 1 from auth.users where id = demo_user_id) then
    insert into public.profiles (
      id, full_name, shop_name, phone, default_pickup_address,
      preferred_courier, default_payment_method, product_category
    ) values (
      demo_user_id,
      'Rahim Uddin',
      'Rahim Fashion House',
      '8801712345678',
      'Shop 12, Bashundhara City, Dhaka',
      'pathao',
      'cod',
      'Fashion & Apparel'
    ) on conflict (id) do update set
      full_name = excluded.full_name,
      shop_name = excluded.shop_name,
      phone = excluded.phone,
      default_pickup_address = excluded.default_pickup_address,
      preferred_courier = excluded.preferred_courier,
      default_payment_method = excluded.default_payment_method,
      product_category = excluded.product_category;

    delete from public.orders where user_id = demo_user_id;

    insert into public.orders (
      user_id, customer_name, customer_phone, customer_address, delivery_area,
      product_name, quantity, variant, price, cod_amount, payment_status,
      delivery_note, raw_input, input_type, extracted_json, missing_fields,
      confidence_score, status
    ) values
    (
      demo_user_id, 'Sadia Rahman', '01798765432', 'House 45, Road 7, Mirpur-10', 'Mirpur',
      'Cotton Kurti', 2, 'Size M, Blue', 1200, 1200, 'cod',
      'Call before delivery', 'Sadia apu, 2 ta blue kurti size M. Mirpur 10. 01798765432. COD 1200',
      'text',
      '{"customer_name":"Sadia Rahman","customer_phone":"01798765432","payment_status":"cod"}'::jsonb,
      '{}', 0.92, 'ready_for_courier'
    ),
    (
      demo_user_id, 'Karim Ahmed', '01811223344', 'Flat 3B, Uttara Sector 7', 'Uttara',
      'Leather Wallet', 1, 'Brown', 850, 850, 'cod',
      null,
      'Screenshot OCR: Karim bhai wallet brown 850 taka uttara sector 7 01811223344',
      'image_ocr_text',
      '{"customer_name":"Karim Ahmed","input_type":"image_ocr_text"}'::jsonb,
      '{}', 0.88, 'ready_for_courier'
    ),
    (
      demo_user_id, 'Nusrat Jahan', '01922334455', 'Zigatola, Dhaka', 'Zigatola',
      'Silk Saree', 1, 'Red', 2500, 2500, 'cod',
      null,
      'Voice transcript: Nusrat apu red saree zigatola 01922334455 COD 2500',
      'audio_transcript',
      '{"customer_name":"Nusrat Jahan","input_type":"audio_transcript"}'::jsonb,
      '{}', 0.85, 'pending'
    ),
    (
      demo_user_id, null, null, null, null,
      'T-shirt', 1, null, null, null, 'unknown',
      null,
      '2 ta t-shirt lagbe kal delivery',
      'text',
      '{"product_name":"T-shirt","quantity":2,"payment_status":"unknown"}'::jsonb,
      array['customer_name','customer_phone','customer_address','price','cod_amount'],
      0.55, 'missing_info'
    ),
    (
      demo_user_id, 'Tanvir Hasan', '01677889900', 'Motijheel, Dhaka', 'Motijheel',
      'Formal Shirt', 3, 'Size L, White', 2100, 2100, 'cod',
      'Office delivery before 5pm',
      'Tanvir 3 white shirt L motijheel 01677889900 COD 2100',
      'text',
      '{"customer_name":"Tanvir Hasan","payment_status":"cod"}'::jsonb,
      '{}', 0.94, 'courier_booked'
    );

    insert into public.courier_integrations (
      user_id, courier_name, api_key, pickup_address, is_active
    ) values
      (demo_user_id, 'pathao', 'demo-pathao-key', 'Shop 12, Bashundhara City, Dhaka', true),
      (demo_user_id, 'redx', null, 'Shop 12, Bashundhara City, Dhaka', false),
      (demo_user_id, 'steadfast', null, 'Shop 12, Bashundhara City, Dhaka', false),
      (demo_user_id, 'delivery_tiger', null, 'Shop 12, Bashundhara City, Dhaka', false)
    on conflict (user_id, courier_name) do nothing;

    insert into public.whatsapp_sessions (
      user_id, whatsapp_phone, state
    ) values (
      demo_user_id, '8801712345678', 'idle'
    ) on conflict (whatsapp_phone) do nothing;
  end if;
end $$;
