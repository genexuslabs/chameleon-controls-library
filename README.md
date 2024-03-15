![ci status](https://github.com/genexuslabs/chameleon-controls-library/actions/workflows/node.js.yml/badge.svg?event=push) [![Netlify Status](https://api.netlify.com/api/v1/badges/ce65d606-d581-41c5-bba7-fb330c333739/deploy-status)](https://app.netlify.com/sites/gx-chameleon/deploys) ![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# chameleon web components

A library of white-label, highly-customizable and reusable web components.

## Getting Started

```bash
npm install
npm start
```

## Running the tests

To run the unit tests for the custom elements, run:

```bash
npm test
```

To run the spec tests for a specific custom elements, run:

```bash
npm run test.spec <component-name-without-prefix>
```

For example:

```bash
npm run test.spec layout-splitter
```

## Building for production

To build the design for production, run:

```bash
npm run build
```

## Using this library

There are three strategies we recommend for using these web components.

### Script tag

- Put a script tag similar to this `<script src="https://unpkg.com/@genexus/chameleon-controls-library@4.4.7/dist/chameleon/chameleon.esm.js"></script>` in the head of your index.html
- Then you can use the web components anywhere in your template, JSX, html etc

### Node Modules

- Run `npm install @genexus/chameleon-controls-library --save`
- Put a script tag similar to this `<script src="node_modules/@genexus/chameleon-controls-library/dist/chameleon/chameleon.esm.js"></script>` in the head of your index.html
- Then you can use the web components anywhere in your template, JSX, html etc

### In a Stencil project

- Run `npm install @genexus/chameleon-controls-library --save`
- Add an import to the library inside `src/index.ts`: `import "@genexus/chameleon-controls-library";`
- Then you can use the web components anywhere in your template, JSX, html etc
