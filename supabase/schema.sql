-- CardDex: execute este arquivo no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.cartas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  codigo_edicao text not null unique check (length(trim(codigo_edicao)) > 0),
  valor_referencia numeric(10,2) check (valor_referencia is null or valor_referencia >= 0)
);

create table if not exists public.colecao (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  carta_id uuid not null references public.cartas(id) on delete cascade,
  quantidade integer not null check (quantidade > 0),
  constraint colecao_usuario_carta_unique unique (usuario_id, carta_id)
);

create table if not exists public.lista_desejos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  carta_id uuid not null references public.cartas(id) on delete cascade,
  constraint desejos_usuario_carta_unique unique (usuario_id, carta_id)
);

alter table public.cartas enable row level security;
alter table public.colecao enable row level security;
alter table public.lista_desejos enable row level security;

drop policy if exists "Catalogo publico para leitura" on public.cartas;
create policy "Catalogo publico para leitura" on public.cartas for select to anon, authenticated using (true);

drop policy if exists "Usuario le sua colecao" on public.colecao;
create policy "Usuario le sua colecao" on public.colecao for select to authenticated using (auth.uid() = usuario_id);
drop policy if exists "Usuario insere na sua colecao" on public.colecao;
create policy "Usuario insere na sua colecao" on public.colecao for insert to authenticated with check (auth.uid() = usuario_id);
drop policy if exists "Usuario atualiza sua colecao" on public.colecao;
create policy "Usuario atualiza sua colecao" on public.colecao for update to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
drop policy if exists "Usuario remove da sua colecao" on public.colecao;
create policy "Usuario remove da sua colecao" on public.colecao for delete to authenticated using (auth.uid() = usuario_id);

drop policy if exists "Usuario le sua lista" on public.lista_desejos;
create policy "Usuario le sua lista" on public.lista_desejos for select to authenticated using (auth.uid() = usuario_id);
drop policy if exists "Usuario adiciona a sua lista" on public.lista_desejos;
create policy "Usuario adiciona a sua lista" on public.lista_desejos for insert to authenticated with check (auth.uid() = usuario_id);
drop policy if exists "Usuario remove da sua lista" on public.lista_desejos;
create policy "Usuario remove da sua lista" on public.lista_desejos for delete to authenticated using (auth.uid() = usuario_id);

insert into public.cartas (nome, codigo_edicao, valor_referencia) values
('Mago Negro', 'SDY-006', 12.50),
('Dragão Branco de Olhos Azuis', 'SDK-001', 18.00),
('Dragão Negro de Olhos Vermelhos', 'SDJ-001', 9.90),
('Exodia, o Proibido', 'LOB-124', 25.00),
('Dragão Supremo de Olhos Azuis', 'PCK-001', null),
('Mago do Tempo', 'MRD-065', 4.50),
('Caveira Invocada', 'MRD-003', 7.00),
('Kuriboh', 'MRD-071', 3.00),
('Dragão de Metal das Trevas de Olhos Vermelhos', 'PTDN-EN000', null),
('Ciber Dragão', 'CRV-EN015', 6.50)
on conflict (codigo_edicao) do nothing;

grant select on public.cartas to anon, authenticated;
grant select, insert, update, delete on public.colecao to authenticated;
grant select, insert, delete on public.lista_desejos to authenticated;
