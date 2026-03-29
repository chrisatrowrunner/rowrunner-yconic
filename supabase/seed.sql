-- RowRunner: Seed Data
-- Rhode Island FC (RIFC) at Beirne Stadium — demo venue

-- ============================================================
-- VENUE
-- ============================================================
insert into public.venues (id, name, slug) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Beirne Stadium — Rhode Island FC', 'rifc');

-- ============================================================
-- VENDORS (concession stands)
-- ============================================================
insert into public.vendors (id, venue_id, name, description) values
  ('b1000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001',
   'Stadium Grill', 'Burgers, dogs, and classic ballpark fare'),
  ('b1000000-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001',
   'The Drink Stand', 'Soft drinks, water, and game-day beverages'),
  ('b1000000-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001',
   'RIFC Merch Shop', 'Official Rhode Island FC gear and accessories');

-- ============================================================
-- MENU ITEMS — Stadium Grill
-- ============================================================
insert into public.menu_items (vendor_id, name, description, price, category) values
  ('b1000000-0000-0000-0000-000000000001', 'Classic Burger',         'Quarter-pound beef patty with lettuce, tomato, onion', 9.50,  'food'),
  ('b1000000-0000-0000-0000-000000000001', 'Cheeseburger',           'Classic burger with American cheese',                  10.50, 'food'),
  ('b1000000-0000-0000-0000-000000000001', 'Hot Dog',                'All-beef frank on a toasted bun',                      6.00,  'food'),
  ('b1000000-0000-0000-0000-000000000001', 'Loaded Nachos',          'Tortilla chips with cheese, jalapeños, salsa',         8.50,  'food'),
  ('b1000000-0000-0000-0000-000000000001', 'Chicken Tenders',        'Crispy breaded tenders with dipping sauce',            9.00,  'food'),
  ('b1000000-0000-0000-0000-000000000001', 'French Fries',           'Seasoned crispy fries',                                5.50,  'food'),
  ('b1000000-0000-0000-0000-000000000001', 'Pretzel Bites',          'Warm soft pretzel bites with cheese dip',              7.00,  'food');

-- ============================================================
-- MENU ITEMS — The Drink Stand
-- ============================================================
insert into public.menu_items (vendor_id, name, description, price, category) values
  ('b1000000-0000-0000-0000-000000000002', 'Bottled Water',          '16.9 oz',                          3.50,  'drink'),
  ('b1000000-0000-0000-0000-000000000002', 'Coca-Cola',              '20 oz bottle',                     4.50,  'drink'),
  ('b1000000-0000-0000-0000-000000000002', 'Sprite',                 '20 oz bottle',                     4.50,  'drink'),
  ('b1000000-0000-0000-0000-000000000002', 'Lemonade',               'Fresh-squeezed, 16 oz',            5.50,  'drink'),
  ('b1000000-0000-0000-0000-000000000002', 'Gatorade',               '20 oz bottle',                     4.50,  'drink'),
  ('b1000000-0000-0000-0000-000000000002', 'Bud Light',              '16 oz draft',                      8.00,  'alcohol'),
  ('b1000000-0000-0000-0000-000000000002', 'Sam Adams Lager',        '16 oz draft',                      9.00,  'alcohol'),
  ('b1000000-0000-0000-0000-000000000002', 'Narragansett Lager',     'Tallboy can — local RI favorite',  7.50,  'alcohol'),
  ('b1000000-0000-0000-0000-000000000002', 'White Claw',             'Variety flavors, 12 oz can',       8.00,  'alcohol');

-- ============================================================
-- MENU ITEMS — RIFC Merch Shop
-- ============================================================
insert into public.menu_items (vendor_id, name, description, price, category) values
  ('b1000000-0000-0000-0000-000000000003', 'RIFC Scarf',             'Official match-day scarf',            25.00, 'merch'),
  ('b1000000-0000-0000-0000-000000000003', 'RIFC Cap',               'Adjustable fit, embroidered crest',   22.00, 'merch'),
  ('b1000000-0000-0000-0000-000000000003', 'RIFC T-Shirt',           'Tri-blend, unisex fit',               28.00, 'merch');
