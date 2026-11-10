import { createClient } from '@supabase/supabase-js';

let client;
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  return client;
}


export async function preencherImagens() {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase não conectado' };

  const { data: cartas, error } = await supabase
    .from('cartas')
    .select('id, nome')
    .is('imagem_url', null);

  if (error) return { error: error.message };

  let atualizadas = 0;

  for (const carta of cartas) {
    try {
      const resposta = await fetch(
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(carta.nome)}`
      );

      if (!resposta.ok) continue;

      const resultado = await resposta.json();
      const encontrada = resultado.data?.find(
        c => c.name.toLowerCase() === carta.nome.toLowerCase()
      );

      const imagem = encontrada?.card_images?.[0]?.image_url;

      if (!imagem) continue;

      const { error: updateError } = await supabase
        .from('cartas')
        .update({ imagem_url: imagem })
        .eq('id', carta.id);

      if (!updateError) atualizadas++;
    } catch (e) {
      console.error('Erro ao buscar imagem:', carta.nome, e);
    }
  }

  return { atualizadas };
}
