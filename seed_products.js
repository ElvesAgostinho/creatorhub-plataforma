import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pjzfqqxkeivrxfnwqswl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqemZxcXhrZWl2cnhmbndxc3dsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMxNjg2NywiZXhwIjoyMDk0ODkyODY3fQ.ozf42oypTMNXcRGCROwNyoYOsTdaIkexNQSgDpVd-5A'
const supabase = createClient(supabaseUrl, supabaseKey)

const newProducts = [
  {
    type: 'course',
    title: 'Adestramento Positivo para Cães',
    slug: 'adestramento-positivo-caes',
    description: 'Aprenda a educar o seu cão com métodos baseados em recompensas e amor.',
    image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
    instructor_name: 'Ana Silva',
    instructor_role: 'Especialista em Comportamento Animal',
    price_cents: 2900,
    original_price_cents: 4900,
    discount_pct: 40,
    best_seller: true,
    students_count: 1200,
    published: true,
    category: 'Animais e plantas'
  },
  {
    type: 'course',
    title: 'Meditação Mindfulness para Iniciantes',
    slug: 'meditacao-mindfulness',
    description: 'Reduza o stress e encontre o seu centro com este guia prático de 21 dias.',
    image_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=800',
    instructor_name: 'Mestre João',
    instructor_role: 'Guia Espiritual',
    price_cents: 1900,
    original_price_cents: 1900,
    discount_pct: 0,
    best_seller: false,
    students_count: 850,
    published: true,
    category: 'Autoconhecimento e espiritualidade'
  },
  {
    type: 'book',
    title: 'Receitas Rápidas e Saudáveis',
    slug: 'receitas-rapidas-saudaveis',
    description: 'E-book com 100 receitas para quem não tem tempo mas quer comer bem.',
    image_url: 'https://images.unsplash.com/photo-1498837167922-41c546cb9081?auto=format&fit=crop&q=80&w=800',
    instructor_name: 'Chef Maria',
    instructor_role: 'Nutricionista',
    price_cents: 1500,
    original_price_cents: 1500,
    discount_pct: 0,
    best_seller: true,
    students_count: 3200,
    published: true,
    category: 'Culinária e gastronomia'
  },
  {
    type: 'mentorship',
    title: 'Mentoria: Investimentos na Bolsa',
    slug: 'mentoria-investimentos-bolsa',
    description: '1 hora de mentoria individual para montar a sua carteira de dividendos.',
    image_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    instructor_name: 'Carlos Finanças',
    instructor_role: 'Analista Financeiro',
    price_cents: 15000,
    original_price_cents: 15000,
    discount_pct: 0,
    best_seller: false,
    students_count: 50,
    published: true,
    category: 'Finanças e negócios'
  },
  {
    type: 'event',
    title: 'Workshop: Fotografia com Smartphone',
    slug: 'workshop-fotografia-smartphone',
    description: 'Aprenda a tirar fotos incríveis apenas com o seu telemóvel.',
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    instructor_name: 'Pedro Lentes',
    instructor_role: 'Fotógrafo Profissional',
    price_cents: 3500,
    original_price_cents: 3500,
    discount_pct: 0,
    event_starts_at: '2027-01-15T10:00:00Z',
    best_seller: false,
    students_count: 200,
    published: true,
    category: 'Design e fotografia'
  },
  {
    type: 'course',
    title: 'Gestão de Tempo e Produtividade',
    slug: 'gestao-tempo-produtividade',
    description: 'Como fazer mais em menos tempo e equilibrar a sua vida pessoal e profissional.',
    image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800',
    instructor_name: 'Diana Silva',
    instructor_role: 'Coach de Produtividade',
    price_cents: 4900,
    original_price_cents: 6900,
    discount_pct: 29,
    best_seller: true,
    students_count: 4100,
    published: true,
    category: 'Carreira e desenvolvimento pessoal'
  }
]

async function run() {
  console.log("Checking if 'category' column exists...");
  // Attempt to insert without category first, if it fails due to category, we might need to alter table.
  // Actually, we can just alter table first. Since I don't have direct SQL, I'll use the rest API to insert. Wait, if `category` column doesn't exist, it will throw an error.
  
  // Let's insert the products
  const { data, error } = await supabase.from('products').insert(newProducts).select();
  if (error) {
    console.error("Error inserting products:", error);
  } else {
    console.log("Inserted products:", data.length);
  }
}

run();
