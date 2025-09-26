# Facillit Hub - Projeto Next.js com App Router

Este é o projeto do site Facillit Hub convertido para Next.js 13+ (com App Router) e Tailwind CSS.

## Como Rodar o Projeto

1.  **Instale as dependências:**
    Certifique-se de ter o Node.js instalado. Em seguida, execute o comando:
    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Estrutura do Projeto (App Router)

-   **/src/app**: Contém as rotas do site. Cada pasta é um segmento de URL. O arquivo `page.tsx` dentro de uma pasta define a UI para aquela rota.
    -   `layout.tsx`: O layout raiz que envolve todas as páginas.
    -   `globals.css`: Estilos globais importados no `layout.tsx`.
-   **/src/components**: Contém os componentes React reutilizáveis (Header, Footer, etc.).
-   **/public**: Contém todos os assets estáticos como imagens. O caminho no código deve ser absoluto, começando com `/` (ex: `/assets/images/logo.svg`).
-   **/lib**: Ideal para colocar scripts auxiliares, como a configuração do cliente Supabase.

## Pontos Importantes

1.  **Componentes Cliente vs. Servidor**: No App Router, os componentes são **Servidor** por padrão. Qualquer componente que use hooks do React (`useState`, `useEffect`, `onClick`) precisa ser um **Componente Cliente**. Para isso, adicione a diretiva `"use client";` no topo do arquivo. A maioria dos seus componentes interativos (Header, FAQ, formulários) precisará disso.

2.  **Roteamento**: Para criar uma nova página (ex: `/register`), crie uma nova pasta em `src/app` (`src/app/register/`) e adicione um arquivo `page.tsx` dentro dela. Use o componente `<Link href="/caminho">` do Next.js para a navegação.

3.  **Lógica de Autenticação (Supabase)**: Crie um arquivo em `/lib/supabaseClient.ts` para inicializar o cliente Supabase. Importe este cliente nas páginas de `login` e `register` para lidar com a lógica de autenticação. Lembre-se que essas páginas devem ser Componentes Cliente (`"use client";`).

4.  **Metadados e SEO**: As meta tags e o título da página são gerenciados exportando um objeto `metadata` de `layout.tsx` ou `page.tsx`, como mostrado no exemplo do `layout.tsx`.