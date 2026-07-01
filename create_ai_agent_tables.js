import pg from 'pg';
import dns from 'dns/promises';

const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';
const host = 'aws-1-us-west-2.pooler.supabase.com';

async function run() {
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);

  console.log(`Resolving IP for ${host}...`);
  const ips = await resolver.resolve4(host);
  const ip = ips[0];
  console.log(`Resolved IP: ${ip}`);

  const client = new Client({
    host: ip,
    port: 6543,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });
  client.connectionParameters.servername = host;

  console.log("Connecting to PostgreSQL...");
  await client.connect();
  console.log("Connected successfully!");

  try {
    console.log("Creating AI agent tables...");

    const sqlScript = `
      -- 1. Tabla de Agentes de IA
      CREATE TABLE IF NOT EXISTS public.ai_agents (
          id SERIAL PRIMARY KEY,
          establishment_id INTEGER REFERENCES public.establishments(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          role TEXT DEFAULT 'comercial', -- 'comercial' | 'atencion'
          tone TEXT DEFAULT 'profesional', -- 'profesional' | 'amigable' | 'entusiasta' | 'formal'
          openrouter_key TEXT,
          ai_model TEXT DEFAULT 'google/gemini-2.5-flash',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Índices únicos para evitar múltiples agentes por hotel/plataforma
      DROP INDEX IF EXISTS unique_platform_agent;
      DROP INDEX IF EXISTS unique_hotel_agent;
      
      CREATE UNIQUE INDEX unique_platform_agent ON public.ai_agents (establishment_id) WHERE establishment_id IS NULL;
      CREATE UNIQUE INDEX unique_hotel_agent ON public.ai_agents (establishment_id) WHERE establishment_id IS NOT NULL;

      -- 2. Tabla de Horarios de Atención del Agente
      CREATE TABLE IF NOT EXISTS public.agent_schedules (
          id SERIAL PRIMARY KEY,
          agent_id INTEGER REFERENCES public.ai_agents(id) ON DELETE CASCADE,
          day_of_week TEXT NOT NULL, -- 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
          start_time TEXT NOT NULL,  -- HH:MM (e.g. '09:00')
          end_time TEXT NOT NULL,    -- HH:MM (e.g. '14:00')
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Tabla de Conversaciones de IA
      CREATE TABLE IF NOT EXISTS public.ai_conversations (
          id SERIAL PRIMARY KEY,
          agent_id INTEGER REFERENCES public.ai_agents(id) ON DELETE CASCADE,
          lead_name TEXT,
          lead_phone TEXT,
          status TEXT DEFAULT 'nuevo', -- 'nuevo', 'contactado', 'interesado', 'negociando', 'cerrado', 'perdido'
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 4. Tabla de Mensajes de IA
      CREATE TABLE IF NOT EXISTS public.ai_messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          direction TEXT NOT NULL, -- 'inbound' | 'outbound'
          is_ai_generated BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Habilitar RLS
      ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.agent_schedules ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

      -- Eliminar políticas viejas si existen
      DROP POLICY IF EXISTS "Allow public all on ai_agents" ON public.ai_agents;
      DROP POLICY IF EXISTS "Allow public all on agent_schedules" ON public.agent_schedules;
      DROP POLICY IF EXISTS "Allow public all on ai_conversations" ON public.ai_conversations;
      DROP POLICY IF EXISTS "Allow public all on ai_messages" ON public.ai_messages;

      -- Crear políticas públicas completas
      CREATE POLICY "Allow public all on ai_agents" ON public.ai_agents FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Allow public all on agent_schedules" ON public.agent_schedules FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Allow public all on ai_conversations" ON public.ai_conversations FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Allow public all on ai_messages" ON public.ai_messages FOR ALL USING (true) WITH CHECK (true);
    `;

    await client.query(sqlScript);
    console.log("AI Agent tables and policies successfully created!");

  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
