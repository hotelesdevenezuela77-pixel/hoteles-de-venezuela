PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE _mocha_migrations (
number     INTEGER UNIQUE,
up_sql     TEXT NOT NULL,
down_sql   TEXT NOT NULL,
applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(1,replace('-- Rooms table: 20 rooms across 5 buildings\nCREATE TABLE rooms (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  code TEXT NOT NULL,\n  building TEXT NOT NULL,\n  room_type TEXT NOT NULL,\n  capacity INTEGER NOT NULL,\n  description TEXT,\n  is_active INTEGER DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Guests table: guest information\nCREATE TABLE guests (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  email TEXT,\n  phone TEXT,\n  document_id TEXT,\n  country TEXT,\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Reservations table: booking records\nCREATE TABLE reservations (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  room_id INTEGER,\n  guest_id INTEGER,\n  check_in_date DATE NOT NULL,\n  check_out_date DATE NOT NULL,\n  num_guests INTEGER DEFAULT 1,\n  total_amount REAL,\n  deposit_amount REAL,\n  status TEXT DEFAULT ''pending'',\n  source TEXT DEFAULT ''whatsapp'',\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Leads table: contact form submissions for CRM\nCREATE TABLE leads (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  email TEXT,\n  phone TEXT,\n  room_type_interest TEXT,\n  check_in_date DATE,\n  check_out_date DATE,\n  status TEXT DEFAULT ''nuevo'',\n  assigned_to TEXT,\n  notes TEXT,\n  last_contact_at DATETIME,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Lead history: contact history for CRM\nCREATE TABLE lead_history (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  lead_id INTEGER,\n  action_type TEXT NOT NULL,\n  description TEXT,\n  contacted_via TEXT,\n  created_by TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Tasks table: operational tasks\nCREATE TABLE tasks (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title TEXT NOT NULL,\n  description TEXT,\n  room_id INTEGER,\n  task_type TEXT DEFAULT ''general'',\n  priority TEXT DEFAULT ''normal'',\n  status TEXT DEFAULT ''pending'',\n  assigned_to TEXT,\n  due_date DATE,\n  completed_at DATETIME,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert the 20 rooms\nINSERT INTO rooms (code, building, room_type, capacity) VALUES\n  (''A1'', ''Edificio Principal'', ''Matrimonial'', 2),\n  (''A2'', ''Edificio Principal'', ''Triple'', 3),\n  (''A3'', ''Edificio Principal'', ''Cuádruple'', 4),\n  (''A4'', ''Edificio Principal'', ''Matrimonial'', 2),\n  (''A5'', ''Edificio Principal'', ''Matrimonial'', 2),\n  (''B1'', ''Edificio de la Piscina'', ''Triple'', 3),\n  (''B2'', ''Edificio de la Piscina'', ''Cuádruple'', 4),\n  (''B3'', ''Edificio de la Piscina'', ''Triple'', 3),\n  (''B4'', ''Edificio de la Piscina'', ''Triple'', 3),\n  (''B5'', ''Edificio de la Piscina'', ''Matrimonial'', 2),\n  (''C1'', ''Piscina Apartamentos'', ''Apartamento'', 5),\n  (''C2'', ''Piscina Apartamentos'', ''Apartamento'', 5),\n  (''D1'', ''Edificio de Recepción'', ''Triple'', 3),\n  (''D2'', ''Edificio de Recepción'', ''Cuádruple'', 4),\n  (''D3'', ''Edificio de Recepción'', ''Triple'', 3),\n  (''D4'', ''Edificio de Recepción'', ''Triple'', 3),\n  (''D5'', ''Edificio de Recepción'', ''Matrimonial'', 2),\n  (''E1'', ''Recepción Apartamentos'', ''Apartamento'', 5),\n  (''E2'', ''Recepción Apartamentos'', ''Apartamento'', 5),\n  (''E3'', ''Recepción Apartamentos'', ''Apartamento'', 5);\n\nCREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);\nCREATE INDEX idx_reservations_status ON reservations(status);\nCREATE INDEX idx_leads_status ON leads(status);\nCREATE INDEX idx_tasks_status ON tasks(status);','\n',char(10)),replace('DROP INDEX idx_tasks_status;\nDROP INDEX idx_leads_status;\nDROP INDEX idx_reservations_status;\nDROP INDEX idx_reservations_dates;\nDROP TABLE tasks;\nDROP TABLE lead_history;\nDROP TABLE leads;\nDROP TABLE reservations;\nDROP TABLE guests;\nDROP TABLE rooms;','\n',char(10)),'2026-04-21 02:08:55');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(2,replace('\nCREATE TABLE site_content (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  section TEXT NOT NULL,\n  content_key TEXT NOT NULL,\n  content_value TEXT,\n  content_type TEXT DEFAULT ''text'',\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_site_content_section ON site_content(section);\n\n-- Banner content\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES \n(''banner'', ''image_url'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-6.jpg'', ''image''),\n(''banner'', ''title'', ''Su casa en la Playa'', ''text''),\n(''banner'', ''subtitle'', ''Despierte con el sonido de las olas y descubra el verdadero significado de descansar.'', ''text''),\n(''banner'', ''highlight_text'', ''20 habitaciones con vista al mar esperan por usted.'', ''text'');\n\n-- Rooms section content\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES \n(''rooms'', ''section_title'', ''Encuentre su Refugio Perfecto'', ''text''),\n(''rooms'', ''section_subtitle'', ''Desde habitaciones íntimas hasta espaciosos apartamentos familiares'', ''text'');\n\n-- Room type images\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES \n(''room_images'', ''triple'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg'', ''image''),\n(''room_images'', ''apartamento'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg'', ''image''),\n(''room_images'', ''matrimonial'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg'', ''image''),\n(''room_images'', ''cuadruple'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg'', ''image'');\n\n-- Facilities content\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES \n(''facilities'', ''section_title'', ''Nuestras Instalaciones'', ''text''),\n(''facilities'', ''section_subtitle'', ''Todo lo que necesita para unas vacaciones perfectas'', ''text''),\n(''facilities'', ''facility_1_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-5.jpg'', ''image''),\n(''facilities'', ''facility_1_title'', ''Piscina de Noche'', ''text''),\n(''facilities'', ''facility_1_description'', ''Disfrute de nuestra piscina iluminada bajo las estrellas'', ''text''),\n(''facilities'', ''facility_2_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-6.jpg'', ''image''),\n(''facilities'', ''facility_2_title'', ''Piscina'', ''text''),\n(''facilities'', ''facility_2_description'', ''Piscina cristalina rodeada de palmeras tropicales'', ''text''),\n(''facilities'', ''facility_3_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-7.jpg'', ''image''),\n(''facilities'', ''facility_3_title'', ''Áreas Comunes'', ''text''),\n(''facilities'', ''facility_3_description'', ''Espacios cómodos para relajarse y socializar'', ''text''),\n(''facilities'', ''facility_4_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-8.jpg'', ''image''),\n(''facilities'', ''facility_4_title'', ''Estacionamiento'', ''text''),\n(''facilities'', ''facility_4_description'', ''Estacionamiento privado y seguro para huéspedes'', ''text'');\n','\n',char(10)),replace('\nDROP INDEX idx_site_content_section;\nDROP TABLE site_content;\n','\n',char(10)),'2026-04-21 02:08:55');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(3,replace('-- Add 4 more room entries (rooms 5-8) with image, title and description\n-- Also add title and description for existing rooms 1-4\n\n-- Room 1 (was matrimonial) - add title and description\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_1_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_1_title'', ''Habitación Matrimonial'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_1_description'', ''Perfecta para parejas, con cama matrimonial y vista relajante. Un refugio íntimo para disfrutar del mar.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_1_capacity'', ''2'', ''text'');\n\n-- Room 2 (was triple)\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_2_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_2_title'', ''Habitación Triple'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_2_description'', ''Ideal para familias pequeñas o grupos de amigos. Espacio cómodo con todo lo necesario.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_2_capacity'', ''3'', ''text'');\n\n-- Room 3 (was cuadruple)\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_3_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_3_title'', ''Habitación Cuádruple'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_3_description'', ''Amplias habitaciones para familias que buscan comodidad y espacio para compartir momentos especiales.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_3_capacity'', ''4'', ''text'');\n\n-- Room 4 (was apartamento)\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_4_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_4_title'', ''Apartamento'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_4_description'', ''Tu hogar lejos de casa. Espacios completos con cocina, sala y todo para una estadía prolongada.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_4_capacity'', ''5'', ''text'');\n\n-- Room 5\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_5_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_5_title'', ''Habitación Vista Piscina'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_5_description'', ''Disfruta de las mejores vistas a nuestra piscina desde esta acogedora habitación.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_5_capacity'', ''2'', ''text'');\n\n-- Room 6\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_6_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_6_title'', ''Suite Familiar'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_6_description'', ''Espacio amplio diseñado para toda la familia con todas las comodidades.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_6_capacity'', ''4'', ''text'');\n\n-- Room 7\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_7_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_7_title'', ''Habitación Estándar'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_7_description'', ''Confort y practicidad en una habitación bien equipada para tu descanso.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_7_capacity'', ''3'', ''text'');\n\n-- Room 8\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_8_image'', ''https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg'', ''image'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_8_title'', ''Apartamento Premium'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_8_description'', ''Nuestro apartamento más completo con terraza privada y vista panorámica.'', ''text'');\nINSERT INTO site_content (section, content_key, content_value, content_type) VALUES (''rooms_display'', ''room_8_capacity'', ''6'', ''text'');','\n',char(10)),'DELETE FROM site_content WHERE section = ''rooms_display'';','2026-04-21 02:08:55');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(4,replace('\nINSERT INTO site_content (section, content_key, content_value, content_type, created_at, updated_at) VALUES\n(''rooms_display'', ''room_1_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_2_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_3_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_4_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_5_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_6_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_7_images'', ''[]'', ''images'', datetime(''now''), datetime(''now'')),\n(''rooms_display'', ''room_8_images'', ''[]'', ''images'', datetime(''now''), datetime(''now''));\n','\n',char(10)),replace('\nDELETE FROM site_content WHERE content_key IN (\n  ''room_1_images'', ''room_2_images'', ''room_3_images'', ''room_4_images'',\n  ''room_5_images'', ''room_6_images'', ''room_7_images'', ''room_8_images''\n);\n','\n',char(10)),'2026-04-21 02:08:55');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(5,replace('\n-- Room inventory: tracks availability per room per date\nCREATE TABLE room_inventory (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  room_id INTEGER NOT NULL,\n  inventory_date DATE NOT NULL,\n  is_available INTEGER DEFAULT 1,\n  is_blocked INTEGER DEFAULT 0,\n  blocked_reason TEXT,\n  reservation_id INTEGER,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_room_inventory_room_date ON room_inventory(room_id, inventory_date);\nCREATE INDEX idx_room_inventory_date ON room_inventory(inventory_date);\n\n-- Seasonal pricing: different rates per season\nCREATE TABLE seasonal_pricing (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  room_type TEXT NOT NULL,\n  season_name TEXT NOT NULL,\n  start_date DATE NOT NULL,\n  end_date DATE NOT NULL,\n  price_per_night REAL NOT NULL,\n  is_active INTEGER DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_seasonal_pricing_dates ON seasonal_pricing(start_date, end_date);\n\n-- Reservation payments: track payment attempts\nCREATE TABLE reservation_payments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  reservation_id INTEGER NOT NULL,\n  payment_provider TEXT DEFAULT ''stripe'',\n  payment_intent_id TEXT,\n  amount REAL NOT NULL,\n  currency TEXT DEFAULT ''USD'',\n  status TEXT DEFAULT ''pending'',\n  paid_at DATETIME,\n  metadata TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_reservation_payments_reservation ON reservation_payments(reservation_id);\nCREATE INDEX idx_reservation_payments_intent ON reservation_payments(payment_intent_id);\n\n-- Add new columns to reservations for automation\nALTER TABLE reservations ADD COLUMN confirmation_code TEXT;\nALTER TABLE reservations ADD COLUMN expires_at DATETIME;\nALTER TABLE reservations ADD COLUMN payment_status TEXT DEFAULT ''pending'';\nALTER TABLE reservations ADD COLUMN confirmed_at DATETIME;\nALTER TABLE reservations ADD COLUMN cancelled_at DATETIME;\nALTER TABLE reservations ADD COLUMN cancellation_reason TEXT;\n','\n',char(10)),replace('\nALTER TABLE reservations DROP COLUMN confirmation_code;\nALTER TABLE reservations DROP COLUMN expires_at;\nALTER TABLE reservations DROP COLUMN payment_status;\nALTER TABLE reservations DROP COLUMN confirmed_at;\nALTER TABLE reservations DROP COLUMN cancelled_at;\nALTER TABLE reservations DROP COLUMN cancellation_reason;\n\nDROP INDEX idx_reservation_payments_intent;\nDROP INDEX idx_reservation_payments_reservation;\nDROP TABLE reservation_payments;\n\nDROP INDEX idx_seasonal_pricing_dates;\nDROP TABLE seasonal_pricing;\n\nDROP INDEX idx_room_inventory_date;\nDROP INDEX idx_room_inventory_room_date;\nDROP TABLE room_inventory;\n','\n',char(10)),'2026-04-21 02:08:56');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(6,replace('-- Actualizar banner con foto de Posada Perla Negra\nUPDATE site_content \nSET content_value = ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(1).jpeg'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''banner'' AND content_key = ''image_url'';\n\n-- Actualizar título del banner\nUPDATE site_content \nSET content_value = ''Bienvenidos a Morrocoy'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''banner'' AND content_key = ''title'';\n\n-- Actualizar subtítulo del banner\nUPDATE site_content \nSET content_value = ''Descubra el paraíso caribeño en Posada Perla Negra, donde la naturaleza y el confort se encuentran.'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''banner'' AND content_key = ''subtitle'';\n\n-- Actualizar highlight text\nUPDATE site_content \nSET content_value = ''Su refugio perfecto en el corazón del Parque Nacional Morrocoy.'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''banner'' AND content_key = ''highlight_text'';\n\n-- Actualizar imágenes de habitaciones para mostrar fotos de Perla Negra\nUPDATE site_content \nSET content_value = ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''rooms_display'' AND content_key LIKE ''room_%_image'';\n\n-- Actualizar facilities con fotos de Perla Negra\nUPDATE site_content \nSET content_value = ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(1).jpeg'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''facilities'' AND content_key LIKE ''%_image'' AND content_key LIKE ''1%'';\n\nUPDATE site_content \nSET content_value = ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(2).jpeg'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''facilities'' AND content_key LIKE ''%_image'' AND content_key LIKE ''2%'';\n\nUPDATE site_content \nSET content_value = ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''facilities'' AND content_key LIKE ''%_image'' AND content_key LIKE ''3%'';\n\nUPDATE site_content \nSET content_value = ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(2).jpeg'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''facilities'' AND content_key LIKE ''%_image'' AND content_key LIKE ''4%'';','\n',char(10)),replace('-- Revertir a valores anteriores (genéricos)\nUPDATE site_content \nSET content_value = ''https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''banner'' AND content_key = ''image_url'';\n\nUPDATE site_content \nSET content_value = ''Su casa en la Playa'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''banner'' AND content_key = ''title'';\n\nUPDATE site_content \nSET content_value = ''Despierte con el sonido de las olas y descubra el verdadero significado de descansar.'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''banner'' AND content_key = ''subtitle'';\n\nUPDATE site_content \nSET content_value = ''20 habitaciones con vista al mar esperan por usted.'',\n    updated_at = CURRENT_TIMESTAMP\nWHERE section = ''banner'' AND content_key = ''highlight_text'';','\n',char(10)),'2026-04-21 02:16:30');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(7,replace('-- Update rooms_display to reflect Posada Perla Negra room types\nDELETE FROM site_content WHERE section = ''rooms_display'';\n\n-- Room 1: Habitación Familiar (10 disponibles)\nINSERT INTO site_content (section, content_key, content_value, content_type, created_at, updated_at) VALUES\n(''rooms_display'', ''room_1_title'', ''Habitación Familiar'', ''text'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_1_description'', ''Habitación cómoda ideal para familias pequeñas. Ambiente acogedor con aire acondicionado, WiFi, TV y baño privado. 10 habitaciones disponibles.'', ''text'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_1_image'', ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'', ''image'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_1_capacity'', ''4'', ''number'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_1_images'', ''[]'', ''json'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\n\n-- Room 2: Habitación Familiar Grande (8 disponibles)\nINSERT INTO site_content (section, content_key, content_value, content_type, created_at, updated_at) VALUES\n(''rooms_display'', ''room_2_title'', ''Habitación Familiar Grande'', ''text'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_2_description'', ''Espaciosa habitación para familias numerosas. Mayor espacio y comodidad con múltiples camas. 8 habitaciones disponibles.'', ''text'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_2_image'', ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'', ''image'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_2_capacity'', ''6'', ''number'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_2_images'', ''[]'', ''json'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\n\n-- Room 3: Habitación Extrafamiliar (2 disponibles)\nINSERT INTO site_content (section, content_key, content_value, content_type, created_at, updated_at) VALUES\n(''rooms_display'', ''room_3_title'', ''Habitación Extrafamiliar'', ''text'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_3_description'', ''Diseñada para grupos grandes o varias familias. Amplio espacio con múltiples ambientes y baños. 2 habitaciones disponibles.'', ''text'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_3_image'', ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'', ''image'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_3_capacity'', ''8'', ''number'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_3_images'', ''[]'', ''json'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\n\n-- Room 4: Habitación Ejecutiva (1 disponible)\nINSERT INTO site_content (section, content_key, content_value, content_type, created_at, updated_at) VALUES\n(''rooms_display'', ''room_4_title'', ''Habitación Ejecutiva'', ''text'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_4_description'', ''Nuestra habitación premium con acabados de lujo y servicios exclusivos. Perfecta para viajeros exigentes. 1 habitación disponible.'', ''text'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_4_image'', ''https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'', ''image'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_4_capacity'', ''2'', ''number'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n(''rooms_display'', ''room_4_images'', ''[]'', ''json'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);','\n',char(10)),replace('-- Restore old room display data\nDELETE FROM site_content WHERE section = ''rooms_display'';','\n',char(10)),'2026-04-21 03:23:33');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(8,replace('\nCREATE TABLE financial_transactions (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  transaction_type TEXT NOT NULL,\n  category TEXT NOT NULL,\n  description TEXT,\n  amount REAL NOT NULL,\n  payment_method TEXT,\n  reference_number TEXT,\n  reservation_id INTEGER,\n  transaction_date DATE NOT NULL,\n  created_by TEXT,\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE expense_categories (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  description TEXT,\n  is_active INTEGER DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nINSERT INTO expense_categories (name, description) VALUES \n  (''Servicios'', ''Agua, luz, internet, gas''),\n  (''Mantenimiento'', ''Reparaciones y mantenimiento general''),\n  (''Limpieza'', ''Productos y servicios de limpieza''),\n  (''Suministros'', ''Artículos para habitaciones''),\n  (''Personal'', ''Salarios y pagos a empleados''),\n  (''Publicidad'', ''Marketing y publicidad''),\n  (''Impuestos'', ''Pagos de impuestos''),\n  (''Otros'', ''Gastos varios'');\n','\n',char(10)),replace('\nDROP TABLE expense_categories;\nDROP TABLE financial_transactions;\n','\n',char(10)),'2026-05-09 22:48:42');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(9,replace('-- Employees table for payroll\nCREATE TABLE employees (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  position TEXT,\n  department TEXT,\n  phone TEXT,\n  email TEXT,\n  document_id TEXT,\n  hire_date DATE,\n  salary REAL,\n  salary_type TEXT DEFAULT ''monthly'',\n  bank_name TEXT,\n  bank_account TEXT,\n  is_active INTEGER DEFAULT 1,\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Payroll payments table\nCREATE TABLE payroll_payments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  employee_id INTEGER NOT NULL,\n  pay_period_start DATE NOT NULL,\n  pay_period_end DATE NOT NULL,\n  base_salary REAL NOT NULL,\n  bonuses REAL DEFAULT 0,\n  deductions REAL DEFAULT 0,\n  net_amount REAL NOT NULL,\n  payment_method TEXT,\n  payment_date DATE,\n  status TEXT DEFAULT ''pending'',\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Suppliers/Vendors table\nCREATE TABLE suppliers (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  contact_name TEXT,\n  phone TEXT,\n  email TEXT,\n  address TEXT,\n  category TEXT,\n  tax_id TEXT,\n  payment_terms TEXT,\n  notes TEXT,\n  is_active INTEGER DEFAULT 1,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Supplier invoices table\nCREATE TABLE supplier_invoices (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  supplier_id INTEGER NOT NULL,\n  invoice_number TEXT,\n  invoice_date DATE NOT NULL,\n  due_date DATE,\n  amount REAL NOT NULL,\n  amount_paid REAL DEFAULT 0,\n  status TEXT DEFAULT ''pending'',\n  payment_date DATE,\n  payment_method TEXT,\n  description TEXT,\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Accounts receivable table\nCREATE TABLE accounts_receivable (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  reservation_id INTEGER,\n  guest_id INTEGER,\n  description TEXT NOT NULL,\n  amount_total REAL NOT NULL,\n  amount_paid REAL DEFAULT 0,\n  due_date DATE,\n  status TEXT DEFAULT ''pending'',\n  notes TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);','\n',char(10)),replace('DROP TABLE accounts_receivable;\nDROP TABLE supplier_invoices;\nDROP TABLE suppliers;\nDROP TABLE payroll_payments;\nDROP TABLE employees;','\n',char(10)),'2026-05-09 23:28:24');
INSERT INTO "_mocha_migrations" ("number","up_sql","down_sql","applied_at") VALUES(10,replace('CREATE TABLE exchange_rates (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  rate_date DATE NOT NULL,\n  rate REAL NOT NULL,\n  source TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_exchange_rates_date ON exchange_rates(rate_date DESC);','\n',char(10)),replace('DROP INDEX idx_exchange_rates_date;\nDROP TABLE exchange_rates;','\n',char(10)),'2026-05-10 00:53:01');
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
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(1,'A1','Edificio Principal','Matrimonial',2,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(2,'A2','Edificio Principal','Triple',3,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(3,'A3','Edificio Principal','Cuádruple',4,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(4,'A4','Edificio Principal','Matrimonial',2,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(5,'A5','Edificio Principal','Matrimonial',2,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(6,'B1','Edificio de la Piscina','Triple',3,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(7,'B2','Edificio de la Piscina','Cuádruple',4,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(8,'B3','Edificio de la Piscina','Triple',3,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(9,'B4','Edificio de la Piscina','Triple',3,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(10,'B5','Edificio de la Piscina','Matrimonial',2,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(11,'C1','Piscina Apartamentos','Apartamento',5,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(12,'C2','Piscina Apartamentos','Apartamento',5,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(13,'D1','Edificio de Recepción','Triple',3,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(14,'D2','Edificio de Recepción','Cuádruple',4,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(15,'D3','Edificio de Recepción','Triple',3,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(16,'D4','Edificio de Recepción','Triple',3,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(17,'D5','Edificio de Recepción','Matrimonial',2,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(18,'E1','Recepción Apartamentos','Apartamento',5,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(19,'E2','Recepción Apartamentos','Apartamento',5,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "rooms" ("id","code","building","room_type","capacity","description","is_active","created_at","updated_at") VALUES(20,'E3','Recepción Apartamentos','Apartamento',5,NULL,1,'2026-04-21 02:08:55','2026-04-21 02:08:55');
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
CREATE TABLE site_content (
id INTEGER PRIMARY KEY AUTOINCREMENT,
section TEXT NOT NULL,
content_key TEXT NOT NULL,
content_value TEXT,
content_type TEXT DEFAULT 'text',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(1,'banner','image_url','https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(1).jpeg','image','2026-04-21 02:08:55','2026-04-21 02:16:30');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(2,'banner','title','Bienvenidos a Morrocoy','text','2026-04-21 02:08:55','2026-04-21 02:16:30');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(3,'banner','subtitle','Descubra el paraíso caribeño en Posada Perla Negra, donde la naturaleza y el confort se encuentran.','text','2026-04-21 02:08:55','2026-04-21 02:16:30');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(4,'banner','highlight_text','Su refugio perfecto en el corazón del Parque Nacional Morrocoy.','text','2026-04-21 02:08:55','2026-04-21 02:16:30');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(5,'rooms','section_title','Encuentre su Refugio Perfecto','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(6,'rooms','section_subtitle','Desde habitaciones íntimas hasta espaciosos apartamentos familiares','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(7,'room_images','triple','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg','image','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(8,'room_images','apartamento','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg','image','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(9,'room_images','matrimonial','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg','image','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(10,'room_images','cuadruple','https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg','image','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(11,'facilities','section_title','Nuestras Instalaciones','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(12,'facilities','section_subtitle','Todo lo que necesita para unas vacaciones perfectas','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(13,'facilities','facility_1_image','/api/images/content/1778172103157-kz16ss.jpg','image','2026-04-21 02:08:55','2026-05-07 16:41:43');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(14,'facilities','facility_1_title','Piscina de Noche','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(15,'facilities','facility_1_description','Disfrute de nuestra piscina iluminada bajo las estrellas','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(16,'facilities','facility_2_image','','image','2026-04-21 02:08:55','2026-05-07 16:40:36');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(17,'facilities','facility_2_title','Piscina','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(18,'facilities','facility_2_description','Piscina cristalina rodeada de palmeras tropicales','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(19,'facilities','facility_3_image','','image','2026-04-21 02:08:55','2026-05-07 16:40:36');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(20,'facilities','facility_3_title','Áreas Comunes','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(21,'facilities','facility_3_description','Espacios cómodos para relajarse y socializar','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(22,'facilities','facility_4_image','','image','2026-04-21 02:08:55','2026-05-07 16:40:36');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(23,'facilities','facility_4_title','Estacionamiento','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(24,'facilities','facility_4_description','Estacionamiento privado y seguro para huéspedes','text','2026-04-21 02:08:55','2026-04-21 02:08:55');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(65,'rooms_display','room_1_title','Habitación Familiar','text','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(66,'rooms_display','room_1_description','Habitación cómoda ideal para familias pequeñas. Ambiente acogedor con aire acondicionado, WiFi, TV y baño privado. 10 habitaciones disponibles.','text','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(67,'rooms_display','room_1_image','','image','2026-04-21 03:23:33','2026-05-07 16:35:17');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(68,'rooms_display','room_1_capacity','4','number','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(69,'rooms_display','room_1_images','["/api/images/content/1778171870077-pnc7d.jpg","/api/images/content/1778173799962-34kyxm.jpg"]','json','2026-04-21 03:23:33','2026-05-07 17:10:01');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(70,'rooms_display','room_2_title','Habitación Familiar Grande','text','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(71,'rooms_display','room_2_description','Espaciosa habitación para familias numerosas. Mayor espacio y comodidad con múltiples camas. 8 habitaciones disponibles.','text','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(72,'rooms_display','room_2_image','','image','2026-04-21 03:23:33','2026-05-07 16:35:27');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(73,'rooms_display','room_2_capacity','6','number','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(74,'rooms_display','room_2_images','["/api/images/content/1778171477571-dzsz0e.jpg"]','json','2026-04-21 03:23:33','2026-05-07 16:31:18');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(75,'rooms_display','room_3_title','Habitación Extrafamiliar','text','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(76,'rooms_display','room_3_description','Diseñada para grupos grandes o varias familias. Amplio espacio con múltiples ambientes y baños. 2 habitaciones disponibles.','text','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(77,'rooms_display','room_3_image','','image','2026-04-21 03:23:33','2026-05-07 16:35:34');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(78,'rooms_display','room_3_capacity','8','number','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(79,'rooms_display','room_3_images','["/api/images/content/1778171521913-55w5p8.jpg"]','json','2026-04-21 03:23:33','2026-05-07 16:32:02');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(80,'rooms_display','room_4_title','Habitación Ejecutiva','text','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(81,'rooms_display','room_4_description','Nuestra habitación premium con acabados de lujo y servicios exclusivos. Perfecta para viajeros exigentes. 1 habitación disponible.','text','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(82,'rooms_display','room_4_image','','image','2026-04-21 03:23:33','2026-05-07 16:35:39');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(83,'rooms_display','room_4_capacity','2','number','2026-04-21 03:23:33','2026-04-21 03:23:33');
INSERT INTO "site_content" ("id","section","content_key","content_value","content_type","created_at","updated_at") VALUES(84,'rooms_display','room_4_images','["/api/images/content/1778171540484-7yiwyf.jpg"]','json','2026-04-21 03:23:33','2026-05-07 16:32:21');
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
CREATE TABLE financial_transactions (
id INTEGER PRIMARY KEY AUTOINCREMENT,
transaction_type TEXT NOT NULL,
category TEXT NOT NULL,
description TEXT,
amount REAL NOT NULL,
payment_method TEXT,
reference_number TEXT,
reservation_id INTEGER,
transaction_date DATE NOT NULL,
created_by TEXT,
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE expense_categories (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
description TEXT,
is_active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "expense_categories" ("id","name","description","is_active","created_at","updated_at") VALUES(1,'Servicios','Agua, luz, internet, gas',1,'2026-05-09 22:48:42','2026-05-09 22:48:42');
INSERT INTO "expense_categories" ("id","name","description","is_active","created_at","updated_at") VALUES(2,'Mantenimiento','Reparaciones y mantenimiento general',1,'2026-05-09 22:48:42','2026-05-09 22:48:42');
INSERT INTO "expense_categories" ("id","name","description","is_active","created_at","updated_at") VALUES(3,'Limpieza','Productos y servicios de limpieza',1,'2026-05-09 22:48:42','2026-05-09 22:48:42');
INSERT INTO "expense_categories" ("id","name","description","is_active","created_at","updated_at") VALUES(4,'Suministros','Artículos para habitaciones',1,'2026-05-09 22:48:42','2026-05-09 22:48:42');
INSERT INTO "expense_categories" ("id","name","description","is_active","created_at","updated_at") VALUES(5,'Personal','Salarios y pagos a empleados',1,'2026-05-09 22:48:42','2026-05-09 22:48:42');
INSERT INTO "expense_categories" ("id","name","description","is_active","created_at","updated_at") VALUES(6,'Publicidad','Marketing y publicidad',1,'2026-05-09 22:48:42','2026-05-09 22:48:42');
INSERT INTO "expense_categories" ("id","name","description","is_active","created_at","updated_at") VALUES(7,'Impuestos','Pagos de impuestos',1,'2026-05-09 22:48:42','2026-05-09 22:48:42');
INSERT INTO "expense_categories" ("id","name","description","is_active","created_at","updated_at") VALUES(8,'Otros','Gastos varios',1,'2026-05-09 22:48:42','2026-05-09 22:48:42');
CREATE TABLE employees (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
position TEXT,
department TEXT,
phone TEXT,
email TEXT,
document_id TEXT,
hire_date DATE,
salary REAL,
salary_type TEXT DEFAULT 'monthly',
bank_name TEXT,
bank_account TEXT,
is_active INTEGER DEFAULT 1,
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payroll_payments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
employee_id INTEGER NOT NULL,
pay_period_start DATE NOT NULL,
pay_period_end DATE NOT NULL,
base_salary REAL NOT NULL,
bonuses REAL DEFAULT 0,
deductions REAL DEFAULT 0,
net_amount REAL NOT NULL,
payment_method TEXT,
payment_date DATE,
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
tax_id TEXT,
payment_terms TEXT,
notes TEXT,
is_active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE supplier_invoices (
id INTEGER PRIMARY KEY AUTOINCREMENT,
supplier_id INTEGER NOT NULL,
invoice_number TEXT,
invoice_date DATE NOT NULL,
due_date DATE,
amount REAL NOT NULL,
amount_paid REAL DEFAULT 0,
status TEXT DEFAULT 'pending',
payment_date DATE,
payment_method TEXT,
description TEXT,
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE accounts_receivable (
id INTEGER PRIMARY KEY AUTOINCREMENT,
reservation_id INTEGER,
guest_id INTEGER,
description TEXT NOT NULL,
amount_total REAL NOT NULL,
amount_paid REAL DEFAULT 0,
due_date DATE,
status TEXT DEFAULT 'pending',
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE exchange_rates (
id INTEGER PRIMARY KEY AUTOINCREMENT,
rate_date DATE NOT NULL,
rate REAL NOT NULL,
source TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('rooms',20);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('site_content',84);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('expense_categories',8);
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
CREATE INDEX idx_exchange_rates_date ON exchange_rates(rate_date DESC);
