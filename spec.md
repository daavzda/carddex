# CardDex — Plataforma inteligente para organização e acompanhamento de coleções de cartas Yu-Gi-Oh!

**Especificação final da primeira versão**  
**Estudante:** Davi Lucas Souza do Amaral  
**Turma:** 3º A — Técnico em Informática  
**Disciplina:** Desenvolvimento de Sistemas — IFRO Campus Porto Velho Calama  
**Situação:** código-fonte da primeira versão implementado; configuração externa do Supabase, publicação e testes de aceitação ainda precisam ser realizados pelo responsável.

## 1. Objetivo

O CardDex é uma aplicação web para consultar um catálogo de cartas Yu-Gi-Oh! e organizar coleção pessoal e lista de desejos. Valores cadastrados são referências demonstrativas, não cotações de mercado em tempo real.

## 2. Usuários

- **Visitante:** pode criar conta, entrar e pesquisar o catálogo público.
- **Usuário autenticado:** pode pesquisar cartas, consultar sua coleção, adicionar cartas, alterar quantidades, remover itens, gerenciar lista de desejos e visualizar a soma parcial das referências disponíveis. Cada usuário só pode acessar seus próprios registros.

Não existe painel administrativo na primeira versão. O catálogo inicial é inserido diretamente no banco por SQL.

## 3. Casos de uso

- **UC01 — Criar conta:** cadastro por e-mail e senha usando Supabase Auth.
- **UC02 — Entrar e sair:** login por e-mail/senha e encerramento de sessão.
- **UC03 — Pesquisar cartas:** pesquisa textual por nome ou código de edição.
- **UC04 — Consultar detalhes:** exibição de nome, código e valor de referência quando disponível.
- **UC05 — Registrar carta na coleção:** inclusão com quantidade positiva; registro existente é atualizado.
- **UC06 — Consultar e atualizar coleção:** listar, alterar quantidade e remover itens da própria coleção.
- **UC07 — Gerenciar lista de desejos:** adicionar e remover cartas, sem duplicidade.
- **UC08 — Visualizar estimativa da coleção:** soma de quantidade × valor de referência para cartas com valor preenchido, com aviso quando houver valores ausentes.

## 4. Requisitos funcionais

- **RF01:** permitir cadastro por e-mail e senha via Supabase Auth.
- **RF02:** permitir login e logout via Supabase Auth.
- **RF03:** pesquisar por parte do nome ou código de edição.
- **RF04:** exibir nome, código e valor de referência ou indicação de indisponibilidade.
- **RF05:** permitir adicionar carta à coleção com quantidade inteira positiva; usar upsert para evitar duplicidade.
- **RF06:** permitir consultar, atualizar e remover apenas os itens da coleção do usuário autenticado.
- **RF07:** permitir adicionar, consultar e remover itens da lista de desejos sem duplicidade.
- **RF08:** exibir total parcial calculado apenas com valores disponíveis e avisar quando houver cartas sem referência.

## 5. Requisitos não funcionais

- **RNF01:** autenticação e tratamento de senha delegados ao Supabase Auth.
- **RNF02:** validação de e-mail e quantidade na interface e restrições de integridade no banco.
- **RNF03:** RLS nas tabelas privadas, com políticas baseadas em `auth.uid()`.
- **RNF04:** credenciais configuradas por variáveis de ambiente; tráfego publicado via HTTPS da hospedagem.
- **RNF05:** catálogo limitado a 500 registros na consulta inicial.
- **RNF06:** interface responsiva para computador e celular e mensagens de operação/erro.
- **RNF07:** chaves estrangeiras, unicidade por usuário/carta e restrição de quantidade positiva.

## 6. Modelo de dados

Banco PostgreSQL do Supabase com três tabelas próprias:

- **cartas:** `id` UUID PK, `nome` TEXT obrigatório, `codigo_edicao` TEXT obrigatório e único, `valor_referencia` NUMERIC(10,2) opcional e não negativo.
- **colecao:** `id` UUID PK, `usuario_id` UUID FK para `auth.users.id`, `carta_id` UUID FK para `cartas.id`, `quantidade` INTEGER positivo, UNIQUE (`usuario_id`, `carta_id`).
- **lista_desejos:** `id` UUID PK, `usuario_id` UUID FK para `auth.users.id`, `carta_id` UUID FK para `cartas.id`, UNIQUE (`usuario_id`, `carta_id`).

As tabelas privadas possuem RLS. O catálogo permite leitura pública, sem permissão pública de escrita. O script completo está em `supabase/schema.sql`.

## 7. Critérios de aceite

- **CA01:** cadastro de e-mail válido; erros de cadastro são apresentados.
- **CA02:** login válido abre área autenticada; credenciais inválidas não abrem sessão; logout encerra a sessão.
- **CA03:** busca encontra cartas pelo nome ou código e apresenta estado vazio quando não há resultado.
- **CA04:** carta apresenta nome, código e valor ou “Valor indisponível”.
- **CA05:** carta é salva na coleção com quantidade positiva; inclusão repetida atualiza o registro.
- **CA06:** usuário consulta, altera e remove seus itens; RLS impede acesso aos itens de outra conta.
- **CA07:** usuário adiciona e remove desejos sem duplicidade.
- **CA08:** total parcial soma apenas valores existentes e informa quando há valores ausentes.

**Estado dos testes:** os critérios acima descrevem o comportamento esperado. Devem ser executados no ambiente Supabase configurado e na versão publicada antes de declarar a entrega validada.

## 8. Stack e publicação

- Next.js e JavaScript para interface e aplicação.
- Supabase PostgreSQL para persistência.
- Supabase Auth para autenticação.
- Git/GitHub para versionamento.
- Vercel para publicação.

As variáveis necessárias são `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. A chave `service_role` não deve ser usada no navegador nem adicionada ao repositório.

## 9. Limites da primeira versão

O catálogo é pequeno e alimentado manualmente por SQL. Não há integração de preços em tempo real, reconhecimento de cartas por imagem, histórico de preços, notificações ou suporte a outros jogos. A versão publicada depende da configuração do projeto Supabase e da Vercel.
