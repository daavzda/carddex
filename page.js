'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../lib/supabase';

const money = (v) => v == null ? 'Valor indisponível' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Home() {
  const supabase = useMemo(() => getSupabase(), []);
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [collection, setCollection] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [tab, setTab] = useState('catalog');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [quantities, setQuantities] = useState({});

  const notify = (text) => { setMessage(text); window.setTimeout(() => setMessage(''), 3500); };

  const loadCards = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('cartas').select('*').order('nome').limit(500);
    if (error) notify(`Erro ao carregar catálogo: ${error.message}`); else setCards(data || []);
  }, [supabase]);

  const loadPrivateData = useCallback(async (userId) => {
    if (!supabase || !userId) return;
    const [c, w] = await Promise.all([
      supabase.from('colecao').select('id, quantidade, carta_id, cartas(id,nome,codigo_edicao,valor_referencia)').eq('usuario_id', userId),
      supabase.from('lista_desejos').select('id, carta_id, cartas(id,nome,codigo_edicao,valor_referencia)').eq('usuario_id', userId)
    ]);
    if (c.error) notify(`Erro na coleção: ${c.error.message}`); else setCollection(c.data || []);
    if (w.error) notify(`Erro na lista de desejos: ${w.error.message}`); else setWishes(w.data || []);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session) loadPrivateData(data.session.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) loadPrivateData(next.user.id); else { setCollection([]); setWishes([]); }
    });
    loadCards();
    return () => listener.subscription.unsubscribe();
  }, [supabase, loadCards, loadPrivateData]);

  async function authenticate(e) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage('');
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (result.error) notify(result.error.message);
    else if (mode === 'signup' && !result.data.session) notify('Conta criada! Confira seu e-mail para confirmar o cadastro antes de entrar.');
    else notify(mode === 'signup' ? 'Conta criada com sucesso!' : 'Login realizado!');
  }

  async function logout() { await supabase.auth.signOut(); setTab('catalog'); notify('Você saiu da conta.'); }

  async function addCollection(card) {
    if (!session) return notify('Entre na sua conta para adicionar cartas.');
    const amount = Number(quantities[card.id] || 1);
    if (!Number.isInteger(amount) || amount < 1) return notify('Informe uma quantidade inteira positiva.');
    const { error } = await supabase.from('colecao').upsert({ usuario_id: session.user.id, carta_id: card.id, quantidade: amount }, { onConflict: 'usuario_id,carta_id' });
    if (error) notify(`Não foi possível salvar: ${error.message}`); else { notify('Carta salva na coleção!'); loadPrivateData(session.user.id); }
  }

  async function updateAmount(item, amount) {
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1) return notify('A quantidade precisa ser um inteiro maior que zero.');
    const { error } = await supabase.from('colecao').update({ quantidade: value }).eq('id', item.id);
    if (error) notify(error.message); else loadPrivateData(session.user.id);
  }

  async function removeCollection(item) {
    const { error } = await supabase.from('colecao').delete().eq('id', item.id);
    if (error) notify(error.message); else { notify('Carta removida da coleção.'); loadPrivateData(session.user.id); }
  }

  async function toggleWish(card) {
    if (!session) return notify('Entre na sua conta para usar a lista de desejos.');
    const existing = wishes.find(x => x.carta_id === card.id);
    const result = existing
      ? await supabase.from('lista_desejos').delete().eq('id', existing.id)
      : await supabase.from('lista_desejos').insert({ usuario_id: session.user.id, carta_id: card.id });
    if (result.error) notify(result.error.message); else { notify(existing ? 'Removida da lista de desejos.' : 'Adicionada à lista de desejos!'); loadPrivateData(session.user.id); }
  }

  const filtered = cards.filter(c => `${c.nome} ${c.codigo_edicao}`.toLowerCase().includes(query.toLowerCase()));
  const partialTotal = collection.reduce((sum, item) => sum + (item.cartas?.valor_referencia == null ? 0 : Number(item.cartas.valor_referencia) * item.quantidade), 0);
  const missingValues = collection.some(item => item.cartas?.valor_referencia == null);

  if (!ready) return <main className="center"><div className="loader"/><p>Carregando CardDex...</p></main>;
  if (!supabase) return <main className="center"><section className="setup"><div className="logo">CD</div><p className="eyebrow">CONFIGURAÇÃO INICIAL</p><h1>Quase lá!</h1><p>O projeto precisa das credenciais do Supabase para conectar ao banco de dados.</p><ol><li>Crie um projeto no Supabase.</li><li>Execute o arquivo <code>supabase/schema.sql</code> no SQL Editor.</li><li>Copie <code>.env.example</code> para <code>.env.local</code> e preencha as duas variáveis.</li><li>Reinicie o servidor com <code>npm run dev</code>.</li></ol></section></main>;

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="logo">CD</span><span>Card<span className="accent">Dex</span></span></a><div className="top-actions">{session ? <><span className="user-email">{session.user.email}</span><button className="button ghost small" onClick={logout}>Sair</button></> : <span className="status">CATÁLOGO PÚBLICO</span>}</div></header>
    <section className="hero"><div><p className="eyebrow">SUA COLEÇÃO, EM UM SÓ LUGAR</p><h1>Todo duelo começa<br/><span className="accent">pela coleção.</span></h1><p className="hero-copy">Pesquise cartas, organize suas cópias e acompanhe seus desejos.</p></div><div className="hero-mark" aria-hidden="true">遊</div></section>
    {message && <div className="toast" role="status">{message}</div>}
    {!session ? <section className="auth-card"><div className="auth-copy"><p className="eyebrow">ÁREA DO COLECIONADOR</p><h2>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h2><p>Salve sua coleção e acesse seus dados de qualquer lugar.</p></div><form onSubmit={authenticate} className="auth-form"><label>E-mail<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com"/></label><label>Senha<input type="password" required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres"/></label><button className="button primary" disabled={busy}>{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button><button type="button" className="link-button" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Ainda não tem conta? Cadastre-se':'Já tem conta? Entrar'}</button></form></section> : <section className="stats"><div><span>NA SUA COLEÇÃO</span><strong>{collection.length}</strong><small>cartas diferentes</small></div><div><span>LISTA DE DESEJOS</span><strong>{wishes.length}</strong><small>cartas desejadas</small></div><div><span>VALOR PARCIAL</span><strong>{money(partialTotal)}</strong><small>{missingValues?'Há cartas sem referência de valor':'Soma das referências cadastradas'}</small></div></section>}
    <section className="workspace"><div className="section-heading"><div><p className="eyebrow">EXPLORE O UNIVERSO YU-GI-OH!</p><h2>{tab==='catalog'?'Catálogo de cartas':tab==='collection'?'Minha coleção':'Lista de desejos'}</h2></div><span className="count">{tab==='catalog'?filtered.length:tab==='collection'?collection.length:wishes.length} ITENS</span></div>
      {session && <nav className="tabs"><button className={tab==='catalog'?'active':''} onClick={()=>setTab('catalog')}>Catálogo</button><button className={tab==='collection'?'active':''} onClick={()=>setTab('collection')}>Minha coleção</button><button className={tab==='wishes'?'active':''} onClick={()=>setTab('wishes')}>Lista de desejos</button></nav>}
      {tab==='catalog' && <><div className="search-wrap"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar por nome ou código da edição..."/></div><div className="card-grid">{filtered.map(card=><article className="card" key={card.id}><div className="card-art">
  {card.imagem_url ? (
    <img
      src={card.imagem_url}
      alt={card.nome}
      loading="lazy"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }}
    />
  ) : (
    <span>Imagem indisponível</span>
  )}
</div><div className="card-info"><h3>{card.nome}</h3><p>{card.codigo_edicao}</p><strong>{money(card.valor_referencia)}</strong><div className="card-controls">{session && <><input aria-label={`Quantidade de ${card.nome}`} type="number" min="1" value={quantities[card.id]||1} onChange={e=>setQuantities({...quantities,[card.id]:e.target.value})}/><button className="button primary compact" onClick={()=>addCollection(card)}>+ Coleção</button><button className="button ghost compact" title="Lista de desejos" onClick={()=>toggleWish(card)}>♡</button></>}</div></div></article>)}</div>{filtered.length===0&&<p className="empty">Nenhuma carta encontrada. Confira a busca ou adicione cartas ao catálogo pelo Supabase.</p>}</>}
      {tab==='collection' && <div className="rows">{collection.map(item=><div className="data-row" key={item.id}><div><strong>{item.cartas?.nome}</strong><small>{item.cartas?.codigo_edicao} · {money(item.cartas?.valor_referencia)}</small></div><div className="row-actions"><input aria-label="Quantidade" type="number" min="1" defaultValue={item.quantidade} onBlur={e=>{if(Number(e.target.value)!==item.quantidade)updateAmount(item,e.target.value)}}/><button className="button danger compact" onClick={()=>removeCollection(item)}>Remover</button></div></div>)}{collection.length===0&&<p className="empty">Sua coleção ainda está vazia. Explore o catálogo e adicione sua primeira carta.</p>}</div>}
      {tab==='wishes' && <div className="rows">{wishes.map(item=><div className="data-row" key={item.id}><div><strong>{item.cartas?.nome}</strong><small>{item.cartas?.codigo_edicao} · {money(item.cartas?.valor_referencia)}</small></div><button className="button danger compact" onClick={()=>toggleWish(item.cartas)}>Remover</button></div>)}{wishes.length===0&&<p className="empty">Sua lista de desejos está vazia. Adicione cartas pelo catálogo.</p>}</div>}
    </section>
    <footer>CardDex · Projeto acadêmico · Valores são referências cadastradas, não cotações em tempo real.</footer>
  </main>;
}
