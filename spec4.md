Quiero migrar varios componentes que tenía hechos con StencilJS. Para ello, podes usar la skill ux-ux-developer que tiene el workflow de stencil-to-kasstor para migrar componentes y tests StencilJS.

Los componentes que quiero migrar a Kasstor son:

- /Users/nicolas.camera/Documents/GitHub/chameleon-controls-library/packages/chameleon/src/components/accordion
- /Users/nicolas.camera/Documents/GitHub/chameleon-controls-library/packages/chameleon/src/components/action-group
- /Users/nicolas.camera/Documents/GitHub/chameleon-controls-library/packages/chameleon/src/components/action-list
- /Users/nicolas.camera/Documents/GitHub/chameleon-controls-library/packages/chameleon/src/components/action-menu
- /Users/nicolas.camera/Documents/GitHub/chameleon-controls-library/packages/chameleon/src/components/combo-box
- /Users/nicolas.camera/Documents/GitHub/chameleon-controls-library/packages/chameleon/src/components/math-viewer
- /Users/nicolas.camera/Documents/GitHub/chameleon-controls-library/packages/chameleon/src/components/popover
- /Users/nicolas.camera/Documents/GitHub/chameleon-controls-library/packages/chameleon/src/components/status
- /Users/nicolas.camera/Documents/GitHub/chameleon-controls-library/packages/chameleon/src/components/tab

Quiero que migres todos los componentes en paralelo que puedas. Quizás un componente tiene dependencias con otros y ahí el sub-agentes tenga que migrar esos componentes juntos y no por separado por temas de coordinación.

Todos los tests tienen que seguir funcionando, además, espero que puedas agregar más tests a los conponentes dividiendo los conceptos para cada tests, es decir, debería haber un archivo .e2e.ts seguramente por propiedad/concepto del componente, deberían haber tests para la accesibilidad, todas las parts que renderizan, casos bordes, lazy loading (en caso de que aplique), render condicional, composición con otros componentes (en caso de que aplique), etc.

Tenes que además agregar los componentes al showcase.

Por lo pronto, la migración tiene que ser 1 a 1, es decir, no podemos perder ninguna feature ni comporamiento existente que ya hayan tenido los componentes.
