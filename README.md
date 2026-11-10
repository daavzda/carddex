# CardDex

Aplicação web para pesquisa de cartas Yu-Gi-Oh! e organização de coleção pessoal. Stack: Next.js, JavaScript, Supabase PostgreSQL/Auth e Vercel.

## Requisitos
- Node.js 20.9 ou superior
- Projeto Supabase

## Configuração local
1. Instale as dependências: `npm install`.
2. No Supabase, abra **SQL Editor**, cole e execute `supabase/schema.sql`.
3. Copie `.env.example` para `.env.local`.
4. No painel Supabase, em **Project Settings → API**, copie Project URL e anon/public key para as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Execute `npm run dev` e abra `http://localhost:3000`.

A chave anon/public é própria para uso no navegador quando as tabelas estão protegidas por RLS. Nunca coloque `service_role`, senha do banco ou outros segredos em variáveis `NEXT_PUBLIC_*`.

## Publicação na Vercel
1. Envie este projeto para um repositório GitHub.
2. Na Vercel, importe o repositório como projeto Next.js.
3. Cadastre as mesmas duas variáveis de ambiente do `.env.local` nas configurações do projeto Vercel.
4. Faça o deploy e teste cadastro, login, pesquisa, inclusão/edição/remoção da coleção e lista de desejos em uma janela anônima.

## Segurança
- Senhas são gerenciadas pelo Supabase Auth; não são armazenadas nas tabelas da aplicação.
- Coleção e lista de desejos têm RLS e políticas vinculadas a `auth.uid()`.
- Quantidade deve ser inteiro positivo, validado na interface e por `CHECK` no banco.
- Consultas usam o SDK Supabase com parâmetros separados, sem concatenar SQL fornecido pelo usuário.
- O catálogo é público somente para leitura.

## Limitações conhecidas
- Catálogo inicial pequeno e estático, inserido por SQL.
- Valores são referências demonstrativas, não preços de mercado em tempo real.
- Confirmação de e-mail pode estar habilitada no Supabase; nesse caso o usuário deve confirmar o endereço antes do primeiro login.
- A publicação, as credenciais e os testes reais dependem da configuração das contas externas.

## Enviar para o GitHub
Depois de criar um repositório vazio no GitHub (sem README/licença inicial), execute dentro da pasta do projeto:

```bash
git remote add origin https://github.com/SEU-USUARIO/carddex.git
git push -u origin main
```

Os commits locais já estão incluídos no diretório `.git`. Antes de fazer novos commits, configure sua identidade Git com `git config user.name` e `git config user.email` usando seus próprios dados.
