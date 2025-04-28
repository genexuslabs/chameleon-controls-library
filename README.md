![ci status](https://github.com/genexuslabs/chameleon-controls-library/actions/workflows/node.js.yml/badge.svg?event=push) [![Netlify Status](https://api.netlify.com/api/v1/badges/ce65d606-d581-41c5-bba7-fb330c333739/deploy-status)](https://app.netlify.com/sites/gx-chameleon/deploys) ![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Chameleon

A library of white-label, highly-customizable and reusable web components.

Visit the [Chameleon Showcase](https://gx-chameleon.netlify.app) for general information, demos and documentation.

## Using this library

There are four strategies we recommend for using these web components.

### In frameworks (React, Angular, etc) using a design system like Mercury or Unanimo.

For this, we recommend consulting our repository [chameleon-integrations](https://github.com/genexuslabs/chameleon-integrations) that contains various examples demonstrating how to effectively use the Chameleon Controls Library in different frameworks and with different design systems.

#### React

- Run

  ```bash
  npm i @genexus/chameleon-controls-library --save
  ```

- Starting with Chameleon version `6.4.0`, there is a CLI to create React Web Component wrappers. To create the wrappers, run the following command:

  ```bash
  npx chameleon-generate-react <output dir (optional)>
  ```

  For example:

  ```bash
  npx chameleon-generate-react ./src/chameleon-components
  ```

- **Tip**: We recommend adding this command to your `package.json` file before running the dev server and production builds, as it takes less than 300ms to execute.

  For example:

  ```json
  "dev": "npm run build.chameleon && ...",
  "build": "npm run build.chameleon && ..."
  "build.chameleon": "chameleon-generate-react <output dir (optional)>"
  ```

  If you are in a monorepo environment, you may need run the script with `npx chameleon-generate-react`, `yarn chameleon-generate-react`, etc.

- Finally, all you have to do is use the components in your project!

### In a Stencil project

- Run

  ```bash
  npm i @genexus/chameleon-controls-library --save
  ```

- Add an import to the library inside `src/index.ts`:

  ```ts
  import "@genexus/chameleon-controls-library";
  ```

- Then you can use the web components anywhere in your template, JSX, html etc

### Node Modules

- Run

  ```bash
  npm i @genexus/chameleon-controls-library --save
  ```

- Put a script tag similar to this `<script src="node_modules/@genexus/chameleon-controls-library/dist/chameleon/chameleon.esm.js"></script>` in the head of your index.html

- Then you can use the web components anywhere in your template, JSX, html etc

### Script tag

- Put a script tag similar to this `<script src="https://unpkg.com/@genexus/chameleon-controls-library@latest/dist/chameleon/chameleon.esm.js"></script>` in the head of your index.html

- Then you can use the web components anywhere in your template, JSX, html etc

## Accessibility checker

Starting with Chameleon version `6.4.0` there is a new accessibility utility that checks if form elements have a valid label and notifies (`console.warn`) when they don't accomplish this condition. At this moment, it's supported in the following components:

- `ch-combo-box-render`
- `ch-edit`
- `ch-slider`

The accessibility checker is enabled by default and can be disabled as follows:

```ts
import { disableAccessibilityReports } from "@genexus/chameleon-controls-library/dist/collection";

disableAccessibilityReports();
```

## Meaning of development status in each control

| Category              | Description                                                                                                                                                                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"experimental"`      | The control is in its early stages of the development. This phase is often useful for testing the control early, but it is very likely that the interface will change from the final version. <br><br> Breaking changes for the control can be applied in "patch" tags.                   |
| `"developer-preview"` | The control is in its final stages of the development. The interface and behaviors to implement the control are almost complete. The interface of the control should not change so much from the final version. <br><br> Breaking changes for the control can be applied in "patch" tags. |
| `"stable"`            | The control's development is stable and can be safety used in production environments. <br><br> Breaking changes for the control can be applied in "major" tags. In some cases, two "major" tags would be used to deprecate a behavior in the control.                                    |

## Local Development

```bash
npm i
npm start
```

### Running the tests

To run the unit tests for the custom elements, run:

```bash
npm test
```

To run the spec tests for a specific custom element, run:

```bash
npm run test.spec src/components/<path to test file.spec.ts>

## For example:

npm run test.spec src/components/layout-splitter/tests/fixAndUpdateLayoutModel.spec.ts
```

To watch changes for tests (spec and e2e), run:

```bash
npm run test.watch
```

To watch only one file, run:

```bash
npm run test.watch -- -- src/components/edit/<path to test file.<spec|e2e>.ts>

## For example:

npm run test.watch -- -- src/components/edit/tests/edit.e2e.ts
```

To watch only one folder, run:

```bash
npm run test.watch -- -- <folder path>

## For example:

npm run test.watch -- -- src/components/edit/tests/
```

### Building for production

To build the design for production, run:

```bash
npm run build
```
