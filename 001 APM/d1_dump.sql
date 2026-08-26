PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE _mocha_migrations (
number     INTEGER UNIQUE,
up_sql     TEXT NOT NULL,
down_sql   TEXT NOT NULL,
applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(1,replace('-- Rooms table: 20 rooms across 5 buildings\nCREATE TABLE rooms (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  code TEXT NOT NULL,\n  building TEXT NOT NULL,\n  room_type TEXT NOT NULL,\n  capacity INTEGER NOT NULL,\n  description TEXT,\n  is_active INTEGER DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Guests table: guest information\nCREATE TABLE guests (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  email TEXT,\n  phone TEXT,\n  document_id TEXT,\n  country TEXT,\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Reservations table: booking records\nCREATE TABLE reservations (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  room_id INTEGER,\n  guest_id INTEGER,\n  check_in_date DATE NOT NULL,\n  check_out_date DATE NOT NULL,\n  num_guests INTEGER DEFAULT 1,\n  total_amount REAL,\n  deposit_amount REAL,\n  status TEXT DEFAULT ''pending'',\n  source TEXT DEFAULT ''whatsapp'',\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Leads table: contact form submissions for CRM\nCREATE TABLE leads (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  email TEXT,\n  phone TEXT,\n  room_type_interest TEXT,\n  check_in_date DATE,\n  check_out_date DATE,\n  status TEXT DEFAULT ''nuevo'',\n  assigned_to TEXT,\n  notes TEXT,\n  last_contact_at DATETIME,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Lead history: contact history for CRM\nCREATE TABLE lead_history (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  lead_id INTEGER,\n  action_type TEXT NOT NULL,\n  description TEXT,\n  contacted_via TEXT,\n  created_by TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Tasks table: operational tasks\nCREATE TABLE tasks (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title TEXT NOT NULL,\n  description TEXT,\n  room_id INTEGER,\n  task_type TEXT DEFAULT ''general'',\n  priority TEXT DEFAULT ''normal'',\n  status TEXT DEFAULT ''pending'',\n  assigned_to TEXT,\n  due_date DATE,\n  completed_at DATETIME,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert the 20 rooms\nINSERT INTO rooms (code, building, room_type, capacity) VALUES\n  (''A1'', ''Edificio Principal'', ''Matrimonial'', 2),\n  (''A2'', ''Edificio Principal'', ''Triple'', 3),\n  (''A3'', ''Edificio Principal'', ''Cuádruple'', 4),\n  (''A4'', ''Edificio Principal'', ''Matrimonial'', 2),\n  (''A5'', ''Edificio Principal'', ''Matrimonial'', 2),\n  (''B1'', ''Edificio de la Piscina'', ''Triple'', 3),\n  (''B2'', ''Edificio de la Piscina'', ''Cuádruple'', 4),\n  (''B3'', ''Edificio de la Piscina'', ''Triple'', 3),\n  (''B4'', ''Edificio de la Piscina'', ''Triple'', 3),\n  (''B5'', ''Edificio de la Piscina'', ''Matrimonial'', 2),\n  (''C1'', ''Piscina Apartamentos'', ''Apartamento'', 5),\n  (''C2'', ''Piscina Apartamentos'', ''Apartamento'', 5),\n  (''D1'', ''Edificio de Recepción'', ''Triple'', 3),\n  (''D2'', ''Edificio de Recepción'', ''Cuádruple'', 4),\n  (''D3'', ''Edificio de Recepción'', ''Triple'', 3),\n  (''D4'', ''Edificio de Recepción'', ''Triple'', 3),\n  (''D5'', ''Edificio de Recepción'', ''Matrimonial'', 2),\n  (''E1'', ''Recepción Apartamentos'', ''Apartamento'', 5),\n  (''E2'', ''Recepción Apartamentos'', ''Apartamento'', 5),\n  (''E3'', ''Recepción Apartamentos'', ''Apartamento'', 5);\n\nCREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);\nCREATE INDEX idx_reservations_status ON reservations(status);\nCREATE INDEX idx_leads_status ON leads(status);\nCREATE INDEX idx_tasks_status ON tasks(status);','\n',char(10)),replace('DROP INDEX idx_tasks_status;\nDROP INDEX idx_leads_status;\nDROP INDEX idx_reservations_status;\nDROP INDEX idx_reservations_dates;\nDROP TABLE tasks;\nDROP TABLE lead_history;\nDROP TABLE leads;\nDROP TABLE reservations;\nDROP TABLE guests;\nDROP TABLE rooms;','\n',char(10)),'2026-03-14 17:45:17');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(2,replace('\nCREATE TABLE site_content (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  section TEXT NOT NULL,\n  content_key TEXT NOT NULL,\n  content_value TEXT,\n  content_type TEXT DEFAULT ''text'',\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_site_content_section ON site_content(section);\n\n-- Banner content\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES \n(''banner'', ''image_url'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-6.jpg'', ''image''),\n(''banner'', ''title'', ''Su casa en la Playa'', ''text''),\n(''banner'', ''subtitle'', ''Despierte con el sonido de las olas y descubra el verdadero significado de descansar.'', ''text''),\n(''banner'', ''highlight_text'', ''20 habitaciones con vista al mar esperan por usted.'', ''text'');\n\n-- Rooms section content\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES \n(''rooms'', ''section_title'', ''Encuentre su Refugio Perfecto'', ''text''),\n(''rooms'', ''section_subtitle'', ''Desde habitaciones íntimas hasta espaciosos apartamentos familiares'', ''text'');\n\n-- Room type images\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES \n(''room_images'', ''triple'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg'', ''image''),\n(''room_images'', ''apartamento'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg'', ''image''),\n(''room_images'', ''matrimonial'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg'', ''image''),\n(''room_images'', ''cuadruple'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg'', ''image'');\n\n-- Facilities content\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES \n(''facilities'', ''section_title'', ''Nuestras Instalaciones'', ''text''),\n(''facilities'', ''section_subtitle'', ''Todo lo que necesita para unas vacaciones perfectas'', ''text''),\n(''facilities'', ''facility_1_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-5.jpg'', ''image''),\n(''facilities'', ''facility_1_title'', ''Piscina de Noche'', ''text''),\n(''facilities'', ''facility_1_description'', ''Disfrute de nuestra piscina iluminada bajo las estrellas'', ''text''),\n(''facilities'', ''facility_2_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-6.jpg'', ''image''),\n(''facilities'', ''facility_2_title'', ''Piscina'', ''text''),\n(''facilities'', ''facility_2_description'', ''Piscina cristalina rodeada de palmeras tropicales'', ''text''),\n(''facilities'', ''facility_3_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-7.jpg'', ''image''),\n(''facilities'', ''facility_3_title'', ''Áreas Comunes'', ''text''),\n(''facilities'', ''facility_3_description'', ''Espacios cómodos para relajarse y socializar'', ''text''),\n(''facilities'', ''facility_4_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-8.jpg'', ''image''),\n(''facilities'', ''facility_4_title'', ''Estacionamiento'', ''text''),\n(''facilities'', ''facility_4_description'', ''Estacionamiento privado y seguro para huéspedes'', ''text'');\n','\n',char(10)),replace('\nDROP INDEX idx_site_content_section;\nDROP TABLE site_content;\n','\n',char(10)),'2026-03-14 18:00:45');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(3,replace('-- Add 4 more room entries (rooms 5-8) with image, title and description\n-- Also add title and description for existing rooms 1-4\n\n-- Room 1 (was matrimonial) - add title and description\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_1_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_1_title'', ''Habitación Matrimonial'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_1_description'', ''Perfecta para parejas, con cama matrimonial y vista relajante. Un refugio íntimo para disfrutar del mar.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_1_capacity'', ''2'', ''text'');\n\n-- Room 2 (was triple)\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_2_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_2_title'', ''Habitación Triple'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_2_description'', ''Ideal para familias pequeñas o grupos de amigos. Espacio cómodo con todo lo necesario.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_2_capacity'', ''3'', ''text'');\n\n-- Room 3 (was cuadruple)\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_3_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_3_title'', ''Habitación Cuádruple'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_3_description'', ''Amplias habitaciones para familias que buscan comodidad y espacio para compartir momentos especiales.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_3_capacity'', ''4'', ''text'');\n\n-- Room 4 (was apartamento)\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_4_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_4_title'', ''Apartamento'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_4_description'', ''Tu hogar lejos de casa. Espacios completos con cocina, sala y todo para una estadía prolongada.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_4_capacity'', ''5'', ''text'');\n\n-- Room 5\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_5_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_5_title'', ''Habitación Vista Piscina'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_5_description'', ''Disfruta de las mejores vistas a nuestra piscina desde esta acogedora habitación.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_5_capacity'', ''2'', ''text'');\n\n-- Room 6\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_6_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_6_title'', ''Suite Familiar'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_6_description'', ''Espacio amplio diseñado para toda la familia con todas las comodidades.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_6_capacity'', ''4'', ''text'');\n\n-- Room 7\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_7_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_7_title'', ''Habitación Estándar'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_7_description'', ''Confort y practicidad en una habitación bien equipada para tu descanso.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_7_capacity'', ''3'', ''text'');\n\n-- Room 8\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_8_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_8_title'', ''Apartamento Premium'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_8_description'', ''Nuestro apartamento más completo con terraza privada y vista panorámica.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_8_capacity'', ''6'', ''text'');','\n',char(10)),'DELETE FROM site_content WHERE section = ''rooms_display'';','2026-04-07 15:20:19');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(4,replace('\nINSERT INTO site_content (section, content_key, content_value, content_type, created_at, updated_at) VALUES\n(''rooms_display'', ''room_1_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_2_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_3_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_4_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_5_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_6_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_7_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_8_images'', ''[]'', ''images'', datetime(''now''), datetime(''now''));\n','\n',char(10)),replace('\nDELETE FROM site_content WHERE content_key IN (\n  ''room_1_images'', ''room_2_images'', ''room_3_images'', ''room_4_images'',\n  ''room_5_images'', ''room_6_images'', ''room_7_images'', ''room_8_images''\n);\n','\n',char(10)),'2026-04-09 16:27:16');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(5,replace('\n-- Room inventory: tracks availability per room per date\nCREATE TABLE room_inventory (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  room_id INTEGER NOT NULL,\n  inventory_date DATE NOT NULL,\n  is_available INTEGER DEFAULT 1,\n  is_blocked INTEGER DEFAULT 0,\n  blocked_reason TEXT,\n  reservation_id INTEGER,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_room_inventory_room_date ON room_inventory(room_id, inventory_date);\nCREATE INDEX idx_room_inventory_date ON room_inventory(inventory_date);\n\n-- Seasonal pricing: different rates per season\nCREATE TABLE seasonal_pricing (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  room_type TEXT NOT NULL,\n  season_name TEXT NOT NULL,\n  start_date DATE NOT NULL,\n  end_date DATE NOT NULL,\n  price_per_night REAL NOT NULL,\n  is_active INTEGER DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_seasonal_pricing_dates ON seasonal_pricing(start_date, end_date);\n\n-- Reservation payments: track payment attempts\nCREATE TABLE reservation_payments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  reservation_id INTEGER NOT NULL,\n  payment_provider TEXT DEFAULT ''stripe'',\n  payment_intent_id TEXT,\n  amount REAL NOT NULL,\n  currency TEXT DEFAULT ''USD'',\n  status TEXT DEFAULT ''pending'',\n  paid_at DATETIME,\n  metadata TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_reservation_payments_reservation ON reservation_payments(reservation_id);\nCREATE INDEX idx_reservation_payments_intent ON reservation_payments(payment_intent_id);\n\n-- Add new columns to reservations for automation\nALTER TABLE reservations ADD COLUMN confirmation_code TEXT;\nALTER TABLE reservations ADD COLUMN expires_at DATETIME;\nALTER TABLE reservations ADD COLUMN payment_status TEXT DEFAULT ''pending'';\nALTER TABLE reservations ADD COLUMN confirmed_at DATETIME;\nALTER TABLE reservations ADD COLUMN cancelled_at DATETIME;\nALTER TABLE reservations ADD COLUMN cancellation_reason TEXT;\n','\n',char(10)),replace('\nALTER TABLE reservations DROP COLUMN confirmation_code;\nALTER TABLE reservations DROP COLUMN expires_at;\nALTER TABLE reservations DROP COLUMN payment_status;\nALTER TABLE reservations DROP COLUMN confirmed_at;\nALTER TABLE reservations DROP COLUMN cancelled_at;\nALTER TABLE reservations DROP COLUMN cancellation_reason;\n\nDROP INDEX idx_reservation_payments_intent;\nDROP INDEX idx_reservation_payments_reservation;\nDROP TABLE reservation_payments;\n\nDROP INDEX idx_seasonal_pricing_dates;\nDROP TABLE seasonal_pricing;\n\nDROP INDEX idx_room_inventory_date;\nDROP INDEX idx_room_inventory_room_date;\nDROP TABLE room_inventory;\n','\n',char(10)),'2026-04-21 01:27:42');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(6,replace('\n-- Payment Methods Catalog\nCREATE TABLE payment_methods (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  code TEXT NOT NULL UNIQUE,\n  currency TEXT DEFAULT ''USD'',\n  is_active INTEGER DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert default payment methods\nINSERT INTO payment_methods (name, code, currency) VALUES \n  (''Efectivo USD'', ''cash_usd'', ''USD''),\n  (''Efectivo Bs'', ''cash_bs'', ''VES''),\n  (''Transferencia USD'', ''transfer_usd'', ''USD''),\n  (''Transferencia Bs'', ''transfer_bs'', ''VES''),\n  (''Zelle'', ''zelle'', ''USD''),\n  (''Pago Móvil'', ''pago_movil'', ''VES''),\n  (''Punto de Venta'', ''pos'', ''VES''),\n  (''Binance Pay'', ''binance'', ''USDT'');\n\n-- Daily Exchange Rates\nCREATE TABLE exchange_rates (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  rate_date DATE NOT NULL,\n  currency_from TEXT DEFAULT ''USD'',\n  currency_to TEXT DEFAULT ''VES'',\n  rate REAL NOT NULL,\n  source TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_exchange_rates_date ON exchange_rates(rate_date);\n\n-- Finance Payments (unified payment tracking)\nCREATE TABLE finance_payments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  reservation_id INTEGER,\n  payment_method_id INTEGER,\n  payment_type TEXT NOT NULL,\n  amount REAL NOT NULL,\n  currency TEXT DEFAULT ''USD'',\n  amount_local REAL,\n  exchange_rate REAL,\n  reference_number TEXT,\n  payment_date DATE NOT NULL,\n  notes TEXT,\n  recorded_by TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_finance_payments_reservation ON finance_payments(reservation_id);\nCREATE INDEX idx_finance_payments_date ON finance_payments(payment_date);\nCREATE INDEX idx_finance_payments_type ON finance_payments(payment_type);\n\n-- Expense Categories\nCREATE TABLE expense_categories (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  code TEXT NOT NULL UNIQUE,\n  expense_type TEXT DEFAULT ''variable'',\n  parent_category_id INTEGER,\n  is_active INTEGER DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert default expense categories\nINSERT INTO expense_categories (name, code, expense_type) VALUES \n  (''Servicios Públicos'', ''utilities'', ''fixed''),\n  (''Electricidad'', ''electricity'', ''fixed''),\n  (''Agua'', ''water'', ''fixed''),\n  (''Internet'', ''internet'', ''fixed''),\n  (''Mantenimiento'', ''maintenance'', ''variable''),\n  (''Insumos de Limpieza'', ''cleaning_supplies'', ''variable''),\n  (''Lencería'', ''linens'', ''variable''),\n  (''Alimentos y Bebidas'', ''food_beverage'', ''variable''),\n  (''Piscina'', ''pool'', ''variable''),\n  (''Jardinería'', ''gardening'', ''variable''),\n  (''Reparaciones'', ''repairs'', ''variable''),\n  (''Marketing'', ''marketing'', ''variable''),\n  (''Impuestos'', ''taxes'', ''fixed''),\n  (''Seguros'', ''insurance'', ''fixed''),\n  (''Otros'', ''other'', ''variable'');\n\n-- Operational Expenses\nCREATE TABLE expenses (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  category_id INTEGER,\n  supplier_id INTEGER,\n  description TEXT NOT NULL,\n  amount REAL NOT NULL,\n  currency TEXT DEFAULT ''USD'',\n  amount_local REAL,\n  exchange_rate REAL,\n  expense_date DATE NOT NULL,\n  payment_method_id INTEGER,\n  invoice_number TEXT,\n  is_paid INTEGER DEFAULT 1,\n  paid_date DATE,\n  notes TEXT,\n  recorded_by TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_expenses_date ON expenses(expense_date);\nCREATE INDEX idx_expenses_category ON expenses(category_id);\n\n-- Employees\nCREATE TABLE employees (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  document_id TEXT,\n  phone TEXT,\n  email TEXT,\n  position TEXT,\n  department TEXT,\n  hire_date DATE,\n  base_salary REAL,\n  salary_currency TEXT DEFAULT ''USD'',\n  is_active INTEGER DEFAULT 1,\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Payroll (Monthly Salaries)\nCREATE TABLE payroll (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  employee_id INTEGER NOT NULL,\n  period_month INTEGER NOT NULL,\n  period_year INTEGER NOT NULL,\n  base_amount REAL NOT NULL,\n  bonuses REAL DEFAULT 0,\n  deductions REAL DEFAULT 0,\n  total_amount REAL NOT NULL,\n  currency TEXT DEFAULT ''USD'',\n  is_paid INTEGER DEFAULT 0,\n  paid_date DATE,\n  payment_method_id INTEGER,\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_payroll_period ON payroll(period_year, period_month);\nCREATE INDEX idx_payroll_employee ON payroll(employee_id);\n\n-- Employee Variable Payments (Commissions, Extra Shifts)\nCREATE TABLE employee_payments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  employee_id INTEGER NOT NULL,\n  payment_type TEXT NOT NULL,\n  description TEXT,\n  room_id INTEGER,\n  reservation_id INTEGER,\n  amount REAL NOT NULL,\n  currency TEXT DEFAULT ''USD'',\n  payment_date DATE NOT NULL,\n  is_paid INTEGER DEFAULT 0,\n  paid_date DATE,\n  payment_method_id INTEGER,\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_employee_payments_date ON employee_payments(payment_date);\nCREATE INDEX idx_employee_payments_employee ON employee_payments(employee_id);\n\n-- Accounts Receivable (Outstanding Balances)\nCREATE TABLE accounts_receivable (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  account_type TEXT DEFAULT ''guest'',\n  guest_id INTEGER,\n  company_name TEXT,\n  company_contact TEXT,\n  company_phone TEXT,\n  reservation_id INTEGER,\n  description TEXT,\n  total_amount REAL NOT NULL,\n  paid_amount REAL DEFAULT 0,\n  currency TEXT DEFAULT ''USD'',\n  due_date DATE,\n  status TEXT DEFAULT ''pending'',\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_accounts_receivable_status ON accounts_receivable(status);\nCREATE INDEX idx_accounts_receivable_due ON accounts_receivable(due_date);\n\n-- Suppliers\nCREATE TABLE suppliers (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  contact_name TEXT,\n  phone TEXT,\n  email TEXT,\n  address TEXT,\n  category TEXT,\n  payment_terms TEXT,\n  notes TEXT,\n  is_active INTEGER DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Supplier Invoices\nCREATE TABLE supplier_invoices (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  supplier_id INTEGER NOT NULL,\n  invoice_number TEXT,\n  invoice_date DATE NOT NULL,\n  due_date DATE,\n  total_amount REAL NOT NULL,\n  paid_amount REAL DEFAULT 0,\n  currency TEXT DEFAULT ''USD'',\n  status TEXT DEFAULT ''pending'',\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_supplier_invoices_status ON supplier_invoices(status);\nCREATE INDEX idx_supplier_invoices_supplier ON supplier_invoices(supplier_id);\n\n-- Supplier Payments\nCREATE TABLE supplier_payments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  supplier_invoice_id INTEGER NOT NULL,\n  amount REAL NOT NULL,\n  currency TEXT DEFAULT ''USD'',\n  payment_date DATE NOT NULL,\n  payment_method_id INTEGER,\n  reference_number TEXT,\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_supplier_payments_date ON supplier_payments(payment_date);\n','\n',char(10)),replace('\nDROP INDEX IF EXISTS idx_supplier_payments_date;\nDROP TABLE IF EXISTS supplier_payments;\n\nDROP INDEX IF EXISTS idx_supplier_invoices_supplier;\nDROP INDEX IF EXISTS idx_supplier_invoices_status;\nDROP TABLE IF EXISTS supplier_invoices;\n\nDROP TABLE IF EXISTS suppliers;\n\nDROP INDEX IF EXISTS idx_accounts_receivable_due;\nDROP INDEX IF EXISTS idx_accounts_receivable_status;\nDROP TABLE IF EXISTS accounts_receivable;\n\nDROP INDEX IF EXISTS idx_employee_payments_employee;\nDROP INDEX IF EXISTS idx_employee_payments_date;\nDROP TABLE IF EXISTS employee_payments;\n\nDROP INDEX IF EXISTS idx_payroll_employee;\nDROP INDEX IF EXISTS idx_payroll_period;\nDROP TABLE IF EXISTS payroll;\n\nDROP TABLE IF EXISTS employees;\n\nDROP INDEX IF EXISTS idx_expenses_category;\nDROP INDEX IF EXISTS idx_expenses_date;\nDROP TABLE IF EXISTS expenses;\n\nDROP TABLE IF EXISTS expense_categories;\n\nDROP INDEX IF EXISTS idx_finance_payments_type;\nDROP INDEX IF EXISTS idx_finance_payments_date;\nDROP INDEX IF EXISTS idx_finance_payments_reservation;\nDROP TABLE IF EXISTS finance_payments;\n\nDROP INDEX IF EXISTS idx_exchange_rates_date;\nDROP TABLE IF EXISTS exchange_rates;\n\nDROP TABLE IF EXISTS payment_methods;\n','\n',char(10)),'2026-05-09 22:18:59');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(7,replace('-- Additional expense categories for hotel operations\nINSERT INTO expense_categories (name, code, expense_type, is_active, created_at, updated_at) VALUES \n  (''Teléfono'', ''phone'', ''fixed'', 1, datetime(''now''), datetime(''now'')),\n  (''Alquiler'', ''rent'', ''fixed'', 1, datetime(''now''), datetime(''now'')),\n  (''Gas'', ''gas'', ''variable'', 1, datetime(''now''), datetime(''now'')),\n  (''Combustible / Transporte'', ''transport'', ''variable'', 1, datetime(''now''), datetime(''now'')),\n  (''Artículos de Baño'', ''toiletries'', ''variable'', 1, datetime(''now''), datetime(''now''));\n\n-- Default suppliers for Venezuelan hotel\nINSERT INTO suppliers (name, contact_name, phone, email, address, category, notes, is_active, created_at, updated_at) VALUES \n  (''CORPOELEC'', NULL, ''0800-CORPOELEC'', NULL, ''Falcón, Venezuela'', ''servicios'', ''Servicio eléctrico nacional'', 1, datetime(''now''), datetime(''now'')),\n  (''Hidrofalcón'', NULL, NULL, NULL, ''Falcón, Venezuela'', ''servicios'', ''Servicio de agua'', 1, datetime(''now''), datetime(''now'')),\n  (''CANTV'', NULL, ''0800-CANTV'', NULL, ''Venezuela'', ''telecomunicaciones'', ''Telefonía e internet'', 1, datetime(''now''), datetime(''now'')),\n  (''Inter / Netuno'', NULL, NULL, NULL, ''Venezuela'', ''telecomunicaciones'', ''Internet y TV cable'', 1, datetime(''now''), datetime(''now'')),\n  (''Ferretería Local'', NULL, NULL, NULL, ''Tucacas, Falcón'', ''materiales'', ''Materiales de mantenimiento'', 1, datetime(''now''), datetime(''now'')),\n  (''Distribuidora de Limpieza'', NULL, NULL, NULL, ''Tucacas, Falcón'', ''insumos'', ''Productos de limpieza e higiene'', 1, datetime(''now''), datetime(''now'')),\n  (''Supermercado'', NULL, NULL, NULL, ''Tucacas, Falcón'', ''insumos'', ''Insumos generales'', 1, datetime(''now''), datetime(''now'')),\n  (''Servicio de Piscinas'', NULL, NULL, NULL, ''Falcón, Venezuela'', ''mantenimiento'', ''Mantenimiento y químicos para piscina'', 1, datetime(''now''), datetime(''now'')),\n  (''Gasolinera'', NULL, NULL, NULL, ''Tucacas, Falcón'', ''combustible'', ''Combustible'', 1, datetime(''now''), datetime(''now'')),\n  (''Proveedor de Gas'', NULL, NULL, NULL, ''Falcón, Venezuela'', ''combustible'', ''Gas doméstico'', 1, datetime(''now''), datetime(''now''));','\n',char(10)),replace('DELETE FROM expense_categories WHERE code IN (''phone'', ''rent'', ''gas'', ''transport'', ''toiletries'');\n\nDELETE FROM suppliers WHERE name IN (''CORPOELEC'', ''Hidrofalcón'', ''CANTV'', ''Inter / Netuno'', ''Ferretería Local'', ''Distribuidora de Limpieza'', ''Supermercado'', ''Servicio de Piscinas'', ''Gasolinera'', ''Proveedor de Gas'');','\n',char(10)),'2026-05-09 22:19:00');
CREATE TABLE rooms (
id INTEGER PRIMARY KEY AUTOINCREMENT,
code TEXT NOT NULL,
building TEXT NOT NULL,
room_type TEXT NOT NULL,
capacity INTEGER NOT NULL,
description TEXT,
is_active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(1,'A1','Edificio Principal','Matrimonial',2,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(2,'A2','Edificio Principal','Triple',3,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(3,'A3','Edificio Principal','Cuádruple',4,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(4,'A4','Edificio Principal','Matrimonial',2,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(5,'A5','Edificio Principal','Matrimonial',2,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(6,'B1','Edificio de la Piscina','Triple',3,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(7,'B2','Edificio de la Piscina','Cuádruple',4,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(8,'B3','Edificio de la Piscina','Triple',3,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(9,'B4','Edificio de la Piscina','Triple',3,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(10,'B5','Edificio de la Piscina','Matrimonial',2,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(11,'C1','Piscina Apartamentos','Apartamento',5,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(12,'C2','Piscina Apartamentos','Apartamento',5,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(13,'D1','Edificio de Recepción','Triple',3,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(14,'D2','Edificio de Recepción','Cuádruple',4,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(15,'D3','Edificio de Recepción','Triple',3,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(16,'D4','Edificio de Recepción','Triple',3,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(17,'D5','Edificio de Recepción','Matrimonial',2,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(18,'E1','Recepción Apartamentos','Apartamento',5,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(19,'E2','Recepción Apartamentos','Apartamento',5,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(20,'E3','Recepción Apartamentos','Apartamento',5,NULL,1,'2026-03-14 17:45:17','2026-03-14 17:45:17');
CREATE TABLE guests (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT,
phone TEXT,
document_id TEXT,
country TEXT,
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "guests" ("id","name","email","phone","document_id","country","notes","created_at","updated_at") VALUES(1,'pedro perez','ejemplo@paginaweb.com','04145069774',NULL,NULL,NULL,'2026-04-02 20:23:57','2026-04-02 20:23:57');
CREATE TABLE reservations (
id INTEGER PRIMARY KEY AUTOINCREMENT,
room_id INTEGER,
guest_id INTEGER,
check_in_date DATE NOT NULL,
check_out_date DATE NOT NULL,
num_guests INTEGER DEFAULT 1,
total_amount REAL,
deposit_amount REAL,
status TEXT DEFAULT 'pending',
source TEXT DEFAULT 'whatsapp',
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
, confirmation_code TEXT, expires_at DATETIME, payment_status TEXT DEFAULT 'pending', confirmed_at DATETIME, cancelled_at DATETIME, cancellation_reason TEXT);
INSERT INTO "reservations" ("id","room_id","guest_id","check_in_date","check_out_date","num_guests","total_amount","deposit_amount","status","source","notes","created_at","updated_at","confirmation_code","expires_at","payment_status","confirmed_at","cancelled_at","cancellation_reason") VALUES(1,1,1,'2026-04-16','2026-04-20',2,NULL,NULL,'pending','whatsapp','una pareja','2026-04-02 20:23:57','2026-04-02 20:23:57',NULL,NULL,'pending',NULL,NULL,NULL);
CREATE TABLE leads (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT,
phone TEXT,
room_type_interest TEXT,
check_in_date DATE,
check_out_date DATE,
status TEXT DEFAULT 'nuevo',
assigned_to TEXT,
notes TEXT,
last_contact_at DATETIME,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(1,'Visitante Web',NULL,NULL,'Triple',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-03-14 20:09:57','2026-03-14 20:09:57');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(2,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-03-17 19:07:40','2026-03-17 19:07:40');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(3,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-03-28 11:34:29','2026-03-28 11:34:29');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(4,'Visitante Web',NULL,NULL,'Apartamento',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-03-28 20:51:29','2026-03-28 20:51:29');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(5,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-03-28 20:59:20','2026-03-28 20:59:20');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(6,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-03-28 21:03:26','2026-03-28 21:03:26');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(7,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-03-28 21:09:40','2026-03-28 21:09:40');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(8,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-03-28 21:17:47','2026-03-28 21:17:47');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(9,'Visitante Web',NULL,NULL,'Cuádruple',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-03-29 19:22:46','2026-03-29 19:22:46');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(10,'Visitante Web',NULL,NULL,'Consulta: Yo quiero información si aceptan mascotas',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador','2026-04-02 20:30:52','2026-04-02 20:29:18','2026-04-02 20:30:52');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(11,'Visitante Web',NULL,NULL,'Consulta: Probando Israel',NULL,NULL,'perdido',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-04-03 02:48:48','2026-04-03 02:53:06');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(12,'Visitante Web',NULL,NULL,'Habitación Cuadruple',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-04-12 12:54:23','2026-04-12 12:54:23');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(13,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-04-14 19:31:56','2026-04-14 19:31:56');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(14,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-04-15 14:04:26','2026-04-15 14:04:26');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(15,'Visitante Web',NULL,NULL,'Apartamento 8 Personas',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-04-16 15:54:24','2026-04-16 15:54:24');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(16,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-04-17 08:50:52','2026-04-17 08:50:52');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(17,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-04-17 08:51:17','2026-04-17 08:51:17');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(18,'Visitante Web',NULL,NULL,'Habitación Suite Matrimonial Cama King',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-04-20 14:29:00','2026-04-20 14:29:00');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(19,'Visitante Web',NULL,NULL,'Habitación Suite Cuádruple 2 Ambientes ',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-04-26 13:14:24','2026-04-26 13:14:24');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(20,'Visitante Web',NULL,NULL,'Apartamento 6 personas',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-05-06 17:12:49','2026-05-06 17:12:49');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(21,'Visitante Web',NULL,NULL,'No estoy seguro',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-05-08 04:33:11','2026-05-08 04:33:11');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(22,'Visitante Web',NULL,NULL,'Triple',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-05-13 23:56:11','2026-05-13 23:56:11');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(23,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-05-19 19:28:42','2026-05-19 19:28:42');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(24,'Visitante Web',NULL,NULL,'Matrimonial',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-05-19 19:29:45','2026-05-19 19:29:45');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(25,'Visitante Web',NULL,NULL,'Habitación Suite Matrimonial Cama King',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-05-21 23:07:07','2026-05-21 23:07:07');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(26,'Visitante Web',NULL,NULL,'Habitación Suite Matrimonial Cama King',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - Tarjeta de Habitación',NULL,'2026-05-24 02:13:53','2026-05-24 02:13:53');
INSERT INTO "leads" ("id","name","email","phone","room_type_interest","check_in_date","check_out_date","status","assigned_to","notes","last_contact_at","created_at","updated_at") VALUES(27,'Visitante Web',NULL,NULL,'Apartamento',NULL,NULL,'nuevo',NULL,'Contacto via WhatsApp - WhatsApp Clasificador',NULL,'2026-05-24 13:58:55','2026-05-24 13:58:55');
CREATE TABLE lead_history (
id INTEGER PRIMARY KEY AUTOINCREMENT,
lead_id INTEGER,
action_type TEXT NOT NULL,
description TEXT,
contacted_via TEXT,
created_by TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(1,1,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-03-14 20:09:58','2026-03-14 20:09:58');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(2,2,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-03-17 19:07:41','2026-03-17 19:07:41');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(3,3,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-03-28 11:34:29','2026-03-28 11:34:29');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(4,4,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-03-28 20:51:29','2026-03-28 20:51:29');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(5,5,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-03-28 20:59:20','2026-03-28 20:59:20');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(6,6,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-03-28 21:03:26','2026-03-28 21:03:26');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(7,7,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-03-28 21:09:40','2026-03-28 21:09:40');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(8,8,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-03-28 21:17:47','2026-03-28 21:17:47');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(9,9,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-03-29 19:22:47','2026-03-29 19:22:47');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(10,10,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-02 20:29:18','2026-04-02 20:29:18');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(11,10,'llamada','no aceptamos mascotas','whatsapp','admin@apartoposadadelmar.net','2026-04-02 20:30:52','2026-04-02 20:30:52');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(12,11,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-03 02:48:48','2026-04-03 02:48:48');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(13,12,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-12 12:54:23','2026-04-12 12:54:23');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(14,13,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-14 19:31:56','2026-04-14 19:31:56');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(15,14,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-15 14:04:26','2026-04-15 14:04:26');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(16,15,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-16 15:54:24','2026-04-16 15:54:24');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(17,16,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-17 08:50:52','2026-04-17 08:50:52');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(18,17,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-17 08:51:17','2026-04-17 08:51:17');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(19,18,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-20 14:29:00','2026-04-20 14:29:00');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(20,19,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-04-26 13:14:24','2026-04-26 13:14:24');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(21,20,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-05-06 17:12:49','2026-05-06 17:12:49');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(22,21,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-05-08 04:33:11','2026-05-08 04:33:11');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(23,22,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-05-13 23:56:11','2026-05-13 23:56:11');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(24,23,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-05-19 19:28:43','2026-05-19 19:28:43');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(25,24,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-05-19 19:29:46','2026-05-19 19:29:46');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(26,25,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-05-21 23:07:07','2026-05-21 23:07:07');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(27,26,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-05-24 02:13:54','2026-05-24 02:13:54');
INSERT INTO "lead_history" ("id","lead_id","action_type","description","contacted_via","created_by","created_at","updated_at") VALUES(28,27,'clic_whatsapp','Visitante hizo clic en botón de WhatsApp','whatsapp',NULL,'2026-05-24 13:58:56','2026-05-24 13:58:56');
CREATE TABLE tasks (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
description TEXT,
room_id INTEGER,
task_type TEXT DEFAULT 'general',
priority TEXT DEFAULT 'normal',
status TEXT DEFAULT 'pending',
assigned_to TEXT,
due_date DATE,
completed_at DATETIME,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "tasks" ("id","title","description","room_id","task_type","priority","status","assigned_to","due_date","completed_at","created_at","updated_at") VALUES(1,'limpiar lahabitacion 1 3 y la 5','pintar',17,'piscina','urgente','pending','rosa','2026-04-16',NULL,'2026-04-02 20:25:54','2026-04-02 20:25:54');
INSERT INTO "tasks" ("id","title","description","room_id","task_type","priority","status","assigned_to","due_date","completed_at","created_at","updated_at") VALUES(2,'Pintar de azul la piscina','Preferiblemente el día lunes que no hay gente ',8,'piscina','alta','completed','Fulanoto','2026-04-17','2026-04-09 04:29:15','2026-04-09 04:29:06','2026-04-09 04:29:15');
INSERT INTO "tasks" ("id","title","description","room_id","task_type","priority","status","assigned_to","due_date","completed_at","created_at","updated_at") VALUES(3,'Pintar la piscina ','Bsjs',NULL,'general','normal','pending','Funalinti','2026-04-16',NULL,'2026-04-09 13:22:07','2026-04-09 13:22:07');
INSERT INTO "tasks" ("id","title","description","room_id","task_type","priority","status","assigned_to","due_date","completed_at","created_at","updated_at") VALUES(4,'Li piar la piscina ',NULL,NULL,'limpieza','alta','pending','María ','2026-04-16',NULL,'2026-04-09 14:02:48','2026-04-09 14:02:48');
INSERT INTO "tasks" ("id","title","description","room_id","task_type","priority","status","assigned_to","due_date","completed_at","created_at","updated_at") VALUES(5,'Limpiar la grana',NULL,4,'general','normal','pending',NULL,'2026-05-14',NULL,'2026-05-03 17:22:24','2026-05-03 17:22:24');
CREATE TABLE site_content (
id INTEGER PRIMARY KEY AUTOINCREMENT,
section TEXT NOT NULL,
content_key TEXT NOT NULL,
content_value TEXT,
content_type TEXT DEFAULT 'text',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(1,'banner','image_url','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-6.jpg','image','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(2,'banner','title','Su casa en la Playa','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(3,'banner','subtitle','A solo unos pasos de la arena: su refugio privado con salida directa al mar','text','2026-03-14 18:00:45','2026-03-14 19:38:34');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(4,'banner','highlight_text','.','text','2026-03-14 18:00:45','2026-03-14 19:36:10');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(5,'rooms','section_title','Encuentre su Refugio Perfecto','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(6,'rooms','section_subtitle','Desde habitaciones íntimas hasta espaciosos apartamentos familiares','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(7,'room_images','triple','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg','image','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(8,'room_images','apartamento','/api/images/content/1775162308029-pydkiy.jpeg','image','2026-03-14 18:00:45','2026-04-02 20:38:28');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(9,'room_images','matrimonial','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg','image','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(10,'room_images','cuadruple','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg','image','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(11,'facilities','section_title','Nuestras Instalaciones','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(12,'facilities','section_subtitle','Todo lo que necesita para unas vacaciones perfectas','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(13,'facilities','facility_1_image','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-5.jpg','image','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(14,'facilities','facility_1_title','Piscina de Noche','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(15,'facilities','facility_1_description','Disfrute de nuestra piscina iluminada bajo las estrellas','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(16,'facilities','facility_2_image','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-6.jpg','image','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(17,'facilities','facility_2_title','Piscina','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(18,'facilities','facility_2_description','Piscina cristalina rodeada de palmeras tropicales','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(19,'facilities','facility_3_image','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-7.jpg','image','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(20,'facilities','facility_3_title','Áreas Comunes','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(21,'facilities','facility_3_description','Espacios cómodos para relajarse y socializar','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(22,'facilities','facility_4_image','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-8.jpg','image','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(23,'facilities','facility_4_title','Estacionamiento','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(24,'facilities','facility_4_description','Estacionamiento privado y seguro para huéspedes','text','2026-03-14 18:00:45','2026-03-14 18:00:45');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(25,'rooms_display','room_1_image','/api/images/content/1776272562539-f6nzia.jpg','image','2026-04-07 15:20:19','2026-04-15 17:02:43');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(26,'rooms_display','room_1_title','Habitación Suite Matrimonial Cama King','text','2026-04-07 15:20:19','2026-04-08 22:08:43');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(27,'rooms_display','room_1_description','Perfecta para parejas, con cama matrimonial y vista relajante. Un refugio íntimo para disfrutar del mar.','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(28,'rooms_display','room_1_capacity','2','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(29,'rooms_display','room_2_image','/api/images/content/1776269517564-hsksqi.jpg','image','2026-04-07 15:20:19','2026-04-15 16:11:58');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(30,'rooms_display','room_2_title','Habitación Triple con Balcón ','text','2026-04-07 15:20:19','2026-04-15 16:11:36');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(31,'rooms_display','room_2_description','Ideal para familias pequeñas o grupos de amigos. Espacio cómodo con todo lo necesario.','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(32,'rooms_display','room_2_capacity','3','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(33,'rooms_display','room_3_image','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg','image','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(34,'rooms_display','room_3_title','Habitación Suite Cuádruple 2 Ambientes ','text','2026-04-07 15:20:19','2026-04-08 22:14:40');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(35,'rooms_display','room_3_description','2 Camas Matrimoniales Amplias habitaciones para familias que buscan comodidad y espacio para compartir momentos especiales.','text','2026-04-07 15:20:19','2026-04-08 23:12:50');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(36,'rooms_display','room_3_capacity','4','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(37,'rooms_display','room_4_image','/api/images/content/1775686525604-biy2g5.jpg','image','2026-04-07 15:20:19','2026-04-08 22:15:26');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(38,'rooms_display','room_4_title','Apartamento 6 personas','text','2026-04-07 15:20:19','2026-04-08 23:11:26');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(39,'rooms_display','room_4_description','Tu hogar lejos de casa. Espacios completos con cocina, sala y todo para una estadía prolongada.','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(40,'rooms_display','room_4_capacity','6','text','2026-04-07 15:20:19','2026-04-08 23:04:36');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(41,'rooms_display','room_5_image','/api/images/content/1776270986641-7h8y5i.jpg','image','2026-04-07 15:20:19','2026-04-15 16:36:27');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(42,'rooms_display','room_5_title','Habitación Cuadruple','text','2026-04-07 15:20:19','2026-04-08 22:18:42');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(43,'rooms_display','room_5_description','Disfruta de las mejores vistas a nuestra piscina desde esta acogedora habitación.','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(44,'rooms_display','room_5_capacity','4','text','2026-04-07 15:20:19','2026-04-08 22:31:43');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(45,'rooms_display','room_6_image','/api/images/content/1775688519411-n2p9gp.jpg','image','2026-04-07 15:20:19','2026-04-08 22:48:42');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(46,'rooms_display','room_6_title','Triple vista a la Piscina','text','2026-04-07 15:20:19','2026-04-08 22:26:49');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(47,'rooms_display','room_6_description','Espacio amplio diseñado para toda la familia con todas las comodidades.','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(48,'rooms_display','room_6_capacity','3','text','2026-04-07 15:20:19','2026-04-08 22:26:59');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(49,'rooms_display','room_7_image','/api/images/content/1775688583413-nkq6.jpg','image','2026-04-07 15:20:19','2026-04-08 22:49:44');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(50,'rooms_display','room_7_title','Matrimonial con Vista a la Poscina','text','2026-04-07 15:20:19','2026-04-08 22:49:56');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(51,'rooms_display','room_7_description','Confort y practicidad en una habitación bien equipada para tu descanso.','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(52,'rooms_display','room_7_capacity','2','text','2026-04-07 15:20:19','2026-04-08 22:49:53');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(53,'rooms_display','room_8_image','/api/images/content/1776271916335-fugyu9.png','image','2026-04-07 15:20:19','2026-04-15 16:51:57');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(54,'rooms_display','room_8_title','Apartamento 8 Personas','text','2026-04-07 15:20:19','2026-04-08 23:04:05');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(55,'rooms_display','room_8_description','Nuestro apartamento más completo con terraza privada y vista panorámica.','text','2026-04-07 15:20:19','2026-04-07 15:20:19');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(56,'rooms_display','room_8_capacity','8','text','2026-04-07 15:20:19','2026-04-08 23:04:14');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(57,'rooms_display','room_1_images','["/api/images/content/1775753544138-akj3mj.jpg","/api/images/content/1775770155505-xti5q5.jpg","/api/images/content/1775770185690-vd679y.jpg","/api/images/content/1775770205468-ht9hgb.jpg","/api/images/content/1775770220052-a5b72s.jpg"]','images','2026-04-09 16:27:16','2026-04-09 21:30:20');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(58,'rooms_display','room_2_images','["/api/images/content/1776269535532-oyfwmj.jpg","/api/images/content/1776269540967-4iiwt.jpg","/api/images/content/1776269547569-3xq7c.jpg","/api/images/content/1776269570112-uxjysb.jpg"]','images','2026-04-09 16:27:16','2026-04-15 16:12:50');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(59,'rooms_display','room_3_images','["/api/images/content/1775770699912-h1e3hh.jpg","/api/images/content/1775770719333-dgc4tg.jpg","/api/images/content/1775770732441-8z1plq.jpg"]','images','2026-04-09 16:27:16','2026-04-09 21:38:52');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(60,'rooms_display','room_4_images','["/api/images/content/1776274772753-w5wf1.jpg","/api/images/content/1776274780262-517c4.jpg","/api/images/content/1776274783819-nex63l.jpg","/api/images/content/1776274792770-ea2ws.jpg"]','images','2026-04-09 16:27:16','2026-04-15 17:39:53');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(61,'rooms_display','room_5_images','["/api/images/content/1776270996301-sy3yw.jpg","/api/images/content/1776271000367-08qxrq.jpg","/api/images/content/1776271093561-rb2mru.jpg"]','images','2026-04-09 16:27:16','2026-04-15 16:38:14');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(62,'rooms_display','room_6_images','["/api/images/content/1775770896402-3c789s.jpg","/api/images/content/1775770912939-73v4o.jpg","/api/images/content/1775770938227-a0xeb.jpg","/api/images/content/1775770951408-mpmwz.jpg"]','images','2026-04-09 16:27:16','2026-04-09 21:42:32');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(63,'rooms_display','room_7_images','["/api/images/content/1776265002153-58upcm.jpg","/api/images/content/1776265010648-j3pwzk.jpg","/api/images/content/1776265020148-geioh9.jpg","/api/images/content/1776265037779-v1q09.jpg"]','images','2026-04-09 16:27:16','2026-04-15 14:57:18');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(64,'rooms_display','room_8_images','["/api/images/content/1776271925219-zmhexg.png","/api/images/content/1776271930349-mrpop4.png","/api/images/content/1776271941063-zdfbcg.png","/api/images/content/1776272095537-00v6jj.jpg"]','images','2026-04-09 16:27:16','2026-04-15 16:54:56');
CREATE TABLE room_inventory (
id INTEGER PRIMARY KEY AUTOINCREMENT,
room_id INTEGER NOT NULL,
inventory_date DATE NOT NULL,
is_available INTEGER DEFAULT 1,
is_blocked INTEGER DEFAULT 0,
blocked_reason TEXT,
reservation_id INTEGER,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE seasonal_pricing (
id INTEGER PRIMARY KEY AUTOINCREMENT,
room_type TEXT NOT NULL,
season_name TEXT NOT NULL,
start_date DATE NOT NULL,
end_date DATE NOT NULL,
price_per_night REAL NOT NULL,
is_active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE reservation_payments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
reservation_id INTEGER NOT NULL,
payment_provider TEXT DEFAULT 'stripe',
payment_intent_id TEXT,
amount REAL NOT NULL,
currency TEXT DEFAULT 'USD',
status TEXT DEFAULT 'pending',
paid_at DATETIME,
metadata TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payment_methods (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
code TEXT NOT NULL UNIQUE,
currency TEXT DEFAULT 'USD',
is_active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "payment_methods" ("id","name","code","currency","is_active","created_at","updated_at") VALUES(1,'Efectivo USD','cash_usd','USD',1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "payment_methods" ("id","name","code","currency","is_active","created_at","updated_at") VALUES(2,'Efectivo Bs','cash_bs','VES',1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "payment_methods" ("id","name","code","currency","is_active","created_at","updated_at") VALUES(3,'Transferencia USD','transfer_usd','USD',1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "payment_methods" ("id","name","code","currency","is_active","created_at","updated_at") VALUES(4,'Transferencia Bs','transfer_bs','VES',1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "payment_methods" ("id","name","code","currency","is_active","created_at","updated_at") VALUES(5,'Zelle','zelle','USD',1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "payment_methods" ("id","name","code","currency","is_active","created_at","updated_at") VALUES(6,'Pago Móvil','pago_movil','VES',1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "payment_methods" ("id","name","code","currency","is_active","created_at","updated_at") VALUES(7,'Punto de Venta','pos','VES',1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "payment_methods" ("id","name","code","currency","is_active","created_at","updated_at") VALUES(8,'Binance Pay','binance','USDT',1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
CREATE TABLE exchange_rates (
id INTEGER PRIMARY KEY AUTOINCREMENT,
rate_date DATE NOT NULL,
currency_from TEXT DEFAULT 'USD',
currency_to TEXT DEFAULT 'VES',
rate REAL NOT NULL,
source TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE finance_payments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
reservation_id INTEGER,
payment_method_id INTEGER,
payment_type TEXT NOT NULL,
amount REAL NOT NULL,
currency TEXT DEFAULT 'USD',
amount_local REAL,
exchange_rate REAL,
reference_number TEXT,
payment_date DATE NOT NULL,
notes TEXT,
recorded_by TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE expense_categories (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
code TEXT NOT NULL UNIQUE,
expense_type TEXT DEFAULT 'variable',
parent_category_id INTEGER,
is_active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(1,'Servicios Públicos','utilities','fixed',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(2,'Electricidad','electricity','fixed',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(3,'Agua','water','fixed',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(4,'Internet','internet','fixed',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(5,'Mantenimiento','maintenance','variable',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(6,'Insumos de Limpieza','cleaning_supplies','variable',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(7,'Lencería','linens','variable',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(8,'Alimentos y Bebidas','food_beverage','variable',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(9,'Piscina','pool','variable',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(10,'Jardinería','gardening','variable',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(11,'Reparaciones','repairs','variable',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(12,'Marketing','marketing','variable',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(13,'Impuestos','taxes','fixed',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(14,'Seguros','insurance','fixed',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(15,'Otros','other','variable',NULL,1,'2026-05-09 22:18:59','2026-05-09 22:18:59');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(16,'Teléfono','phone','fixed',NULL,1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(17,'Alquiler','rent','fixed',NULL,1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(18,'Gas','gas','variable',NULL,1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(19,'Combustible / Transporte','transport','variable',NULL,1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "expense_categories" ("id","name","code","expense_type","parent_category_id","is_active","created_at","updated_at") VALUES(20,'Artículos de Baño','toiletries','variable',NULL,1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
CREATE TABLE expenses (
id INTEGER PRIMARY KEY AUTOINCREMENT,
category_id INTEGER,
supplier_id INTEGER,
description TEXT NOT NULL,
amount REAL NOT NULL,
currency TEXT DEFAULT 'USD',
amount_local REAL,
exchange_rate REAL,
expense_date DATE NOT NULL,
payment_method_id INTEGER,
invoice_number TEXT,
is_paid INTEGER DEFAULT 1,
paid_date DATE,
notes TEXT,
recorded_by TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE employees (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
document_id TEXT,
phone TEXT,
email TEXT,
position TEXT,
department TEXT,
hire_date DATE,
base_salary REAL,
salary_currency TEXT DEFAULT 'USD',
is_active INTEGER DEFAULT 1,
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payroll (
id INTEGER PRIMARY KEY AUTOINCREMENT,
employee_id INTEGER NOT NULL,
period_month INTEGER NOT NULL,
period_year INTEGER NOT NULL,
base_amount REAL NOT NULL,
bonuses REAL DEFAULT 0,
deductions REAL DEFAULT 0,
total_amount REAL NOT NULL,
currency TEXT DEFAULT 'USD',
is_paid INTEGER DEFAULT 0,
paid_date DATE,
payment_method_id INTEGER,
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE employee_payments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
employee_id INTEGER NOT NULL,
payment_type TEXT NOT NULL,
description TEXT,
room_id INTEGER,
reservation_id INTEGER,
amount REAL NOT NULL,
currency TEXT DEFAULT 'USD',
payment_date DATE NOT NULL,
is_paid INTEGER DEFAULT 0,
paid_date DATE,
payment_method_id INTEGER,
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE accounts_receivable (
id INTEGER PRIMARY KEY AUTOINCREMENT,
account_type TEXT DEFAULT 'guest',
guest_id INTEGER,
company_name TEXT,
company_contact TEXT,
company_phone TEXT,
reservation_id INTEGER,
description TEXT,
total_amount REAL NOT NULL,
paid_amount REAL DEFAULT 0,
currency TEXT DEFAULT 'USD',
due_date DATE,
status TEXT DEFAULT 'pending',
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE suppliers (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
contact_name TEXT,
phone TEXT,
email TEXT,
address TEXT,
category TEXT,
payment_terms TEXT,
notes TEXT,
is_active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(1,'CORPOELEC',NULL,'0800-CORPOELEC',NULL,'Falcón, Venezuela','servicios',NULL,'Servicio eléctrico nacional',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(2,'Hidrofalcón',NULL,NULL,NULL,'Falcón, Venezuela','servicios',NULL,'Servicio de agua',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(3,'CANTV',NULL,'0800-CANTV',NULL,'Venezuela','telecomunicaciones',NULL,'Telefonía e internet',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(4,'Inter / Netuno',NULL,NULL,NULL,'Venezuela','telecomunicaciones',NULL,'Internet y TV cable',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(5,'Ferretería Local',NULL,NULL,NULL,'Tucacas, Falcón','materiales',NULL,'Materiales de mantenimiento',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(6,'Distribuidora de Limpieza',NULL,NULL,NULL,'Tucacas, Falcón','insumos',NULL,'Productos de limpieza e higiene',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(7,'Supermercado',NULL,NULL,NULL,'Tucacas, Falcón','insumos',NULL,'Insumos generales',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(8,'Servicio de Piscinas',NULL,NULL,NULL,'Falcón, Venezuela','mantenimiento',NULL,'Mantenimiento y químicos para piscina',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(9,'Gasolinera',NULL,NULL,NULL,'Tucacas, Falcón','combustible',NULL,'Combustible',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
INSERT INTO "suppliers" ("id","name","contact_name","phone","email","address","category","payment_terms","notes","is_active","created_at","updated_at") VALUES(10,'Proveedor de Gas',NULL,NULL,NULL,'Falcón, Venezuela','combustible',NULL,'Gas doméstico',1,'2026-05-09 22:19:00','2026-05-09 22:19:00');
CREATE TABLE supplier_invoices (
id INTEGER PRIMARY KEY AUTOINCREMENT,
supplier_id INTEGER NOT NULL,
invoice_number TEXT,
invoice_date DATE NOT NULL,
due_date DATE,
total_amount REAL NOT NULL,
paid_amount REAL DEFAULT 0,
currency TEXT DEFAULT 'USD',
status TEXT DEFAULT 'pending',
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE supplier_payments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
supplier_invoice_id INTEGER NOT NULL,
amount REAL NOT NULL,
currency TEXT DEFAULT 'USD',
payment_date DATE NOT NULL,
payment_method_id INTEGER,
reference_number TEXT,
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('rooms',20);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('site_content',64);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('leads',27);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('lead_history',28);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('guests',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('reservations',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('tasks',5);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('payment_methods',8);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('expense_categories',20);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('suppliers',10);
CREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_site_content_section ON site_content(section);
CREATE INDEX idx_room_inventory_room_date ON room_inventory(room_id, inventory_date);
CREATE INDEX idx_room_inventory_date ON room_inventory(inventory_date);
CREATE INDEX idx_seasonal_pricing_dates ON seasonal_pricing(start_date, end_date);
CREATE INDEX idx_reservation_payments_reservation ON reservation_payments(reservation_id);
CREATE INDEX idx_reservation_payments_intent ON reservation_payments(payment_intent_id);
CREATE INDEX idx_exchange_rates_date ON exchange_rates(rate_date);
CREATE INDEX idx_finance_payments_reservation ON finance_payments(reservation_id);
CREATE INDEX idx_finance_payments_date ON finance_payments(payment_date);
CREATE INDEX idx_finance_payments_type ON finance_payments(payment_type);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_payroll_period ON payroll(period_year, period_month);
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_employee_payments_date ON employee_payments(payment_date);
CREATE INDEX idx_employee_payments_employee ON employee_payments(employee_id);
CREATE INDEX idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX idx_accounts_receivable_due ON accounts_receivable(due_date);
CREATE INDEX idx_supplier_invoices_status ON supplier_invoices(status);
CREATE INDEX idx_supplier_invoices_supplier ON supplier_invoices(supplier_id);
CREATE INDEX idx_supplier_payments_date ON supplier_payments(payment_date);
