# Scraper API

API RESTful desenvolvida com NestJS para realizar scraping de notebooks no site de testes da WebScraper.io.

O projeto realiza:
- Extração de produtos de múltiplas páginas
- Filtragem de notebooks pela marca
- Ordenação por preço (menor → maior)
- Exposição dos dados via endpoint REST em JSON

---

# Tecnologias utilizadas

- Node.js
- TypeScript
- NestJS
- Axios
- Cheerio

---

# Decisões técnicas

## NestJS

O NestJS foi escolhido por fornecer uma arquitetura modular e escalável, facilitando:
- Separação de responsabilidades
- Organização do código
- Injeção de dependências
- Manutenção futura da aplicação

---

## Axios

Axios foi utilizado como cliente HTTP para realizar as requisições das páginas do site.

Motivos:
- Simplicidade de uso
- Boa legibilidade
- Suporte nativo a Promises

---

## Cheerio

Cheerio foi utilizado para parsing do HTML.

Motivos:
- Permite manipular HTML usando seletores CSS
- Leve e performático
- Não necessita automação de navegador

---

## Estratégia de scraping

A aplicação:
1. Descobre automaticamente a quantidade total de páginas
2. Realiza scraping concorrente utilizando Promise.all
3. Consolida todos os produtos
4. Filtra apenas notebooks da marca passada como parâmetro
5. Ordena os resultados pelo menor preço

---

## Concorrência

As páginas são processadas em paralelo utilizando Promise.all para melhorar performance.

Em cenários reais com maior volume de requisições, seria recomendado utilizar controle de concorrência/rate limit para evitar bloqueios.

---

# Estrutura do projeto

```txt
src/
 └── products/
        ├── services/
        ├── products.controller.ts/
        └── products.module.ts
```

---

# Como rodar o projeto

## Clone o repositório

```bash
git clone https://github.com/JuanHelpes/webscraper-api
```

---

## Instale as dependências

```bash
npm install
```

---

## Execute o projeto

```bash
npm run start:dev
```

A aplicação ficará disponível em:

```txt
http://localhost:3000
```

---

# Endpoint

## Buscar notebooks

```http
GET /products/:marca
```

## Exemplo

```txt
http://localhost:3000/products/lenovo
```

---

# Exemplo de resposta

```json
[
  {
    "name": "Lenovo V110-15ISK",
    "price": 321,
    "description": "15.6\" HD notebook...",
    "reviews": 12,
    "rating": 4,
    "link": "https://webscraper.io/test-sites/e-commerce/static/product/36",
  }
]
```

---

# Observações

- O projeto não utiliza Selenium, Puppeteer ou Playwright.
- Toda extração é realizada apenas com requisições HTTP e parsing HTML.
- O scraper foi desenvolvido especificamente para o site de testes fornecido no desafio.


---------------------

# Web Scraper em Go

Este projeto consiste em um web scraper desenvolvido em Go para coletar informações de livros do site https://books.toscrape.com.

O scraper percorre as páginas do catálogo e extrai:
- título
- preço
- avaliação

---

# Problemas Encontrados e Correções Aplicadas


## 1. Extensão incorreta da página inicial

### Problema
O crawler iniciava com:

```go
page := "page-2.htm"
```

O site utiliza arquivos `.html`, e não `.htm`.

### Correção Aplicada

```go
page := "page-1.html"
```

### Justificativa
A URL anterior era inválida e impedia o acesso correto às páginas do catálogo.

---

## 2. Erro na lógica da próxima página

### Problema
A função `getNextPage()` assumia incorretamente a estrutura da DOM:

```go
if n.FirstChild != nil && n.FirstChild.NextSibling != nil
```

O código esperava que o elemento `<a>` estivesse no `NextSibling`, porém no HTML real o `<a>` é o próprio `FirstChild`.

HTML real:

```html
<li class="next">
    <a href="page-2.html">next</a>
</li>
```

### Correção Aplicada

```go
a := n.FirstChild

if a != nil && a.Data == "a" {
```

### Justificativa
A correção faz com que o scraper encontre corretamente o link da próxima página, permitindo navegar por toda a paginação do site.

---

## 3. Duplicação de registros na última página

### Problema
O código executava `parseBooks(doc)` duas vezes na última página:

```go
if next == "" {
	parseBooks(doc)
}
```

Isso fazia com que os livros da última página fossem adicionados em duplicidade.

### Correção Aplicada
O bloco foi removido.

### Justificativa
Os livros já haviam sido processados anteriormente no loop principal.

---