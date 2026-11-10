# Changelog

## 1.0.0 — primeira implementação

- Criada aplicação Next.js com interface responsiva em português.
- Implementado cadastro, login e logout por Supabase Auth.
- Implementada pesquisa de catálogo por nome e código de edição.
- Implementadas inclusão, consulta, atualização e remoção da coleção.
- Implementado gerenciamento da lista de desejos.
- Implementado cálculo de valor parcial com aviso para valores ausentes.
- Criado script SQL com tabelas, chaves estrangeiras, restrições, dados iniciais e políticas RLS.
- Criados `.env.example`, instruções de configuração e documentação de publicação.

## Decisões e revisão humana

- O catálogo inicial é inserido por SQL, conforme a spec; não foi adicionada API externa de cartas ou preços.
- Os valores do seed são referências demonstrativas e não devem ser apresentados como preços atuais.
- A chave `service_role` não é necessária no cliente; a aplicação usa somente URL e chave pública anon, com RLS no banco.
- A primeira versão mantém o escopo da spec e evita painel administrativo e funcionalidades futuras.
- A validação de segurança não é considerada concluída até que as políticas sejam executadas no Supabase e o isolamento entre duas contas seja testado.

## Pendências antes da entrega

- Executar `supabase/schema.sql` no projeto Supabase real.
- Configurar as variáveis de ambiente local e na Vercel.
- Testar cadastro, login, coleção, lista de desejos e isolamento RLS com contas distintas.
- Publicar e testar o link em janela anônima.
- Registrar commits adicionais conforme as correções reais forem realizadas.
