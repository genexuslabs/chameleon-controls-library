import { LayoutSplitterModel } from "../../../../components/layout-splitter/types";

export const layout1: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    { id: "start-component", size: "3fr" },
    { id: "end-end-component", size: "2fr" },
    { id: "center-component", size: "200px" },
    { id: "end-component", size: "180px" }
  ]
};

export const layout2: LayoutSplitterModel = {
  id: "root",
  direction: "rows",
  items: [
    {
      id: "sub-group-1",
      size: "1fr",
      minSize: "100px",
      direction: "columns",
      items: [
        {
          id: "start-component",
          size: "100px",
          minSize: "200px",
          dragBar: { hidden: true }
        },
        {
          id: "center-component",
          size: "1fr",
          minSize: "250px"
        },
        { id: "end-component", size: "270px", minSize: "400px" }
      ]
    },
    { id: "end-end-component", size: "250px", minSize: "249px" },
    { id: "center-2-component", size: "250px", minSize: "251px" }
  ]
};

export const layout3: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    { id: "start-component", size: "300px" },
    {
      id: "sub-group-1",
      size: "1fr",
      direction: "rows",
      items: [
        { id: "center-component", size: "1fr" },
        { id: "end-end-component", size: "300px" }
      ]
    },
    { id: "end-component", size: "270px" }
  ]
};

export const layout4: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    { id: "start-component", size: "300px" },
    {
      id: "sub-group-1",
      size: "1fr",
      direction: "rows",
      items: [
        {
          id: "sub-group-1-1",
          size: "1fr",
          direction: "columns",
          items: [
            { id: "center-component", size: "1fr" },
            { id: "center-2-component", size: "1fr" }
          ]
        },
        { id: "end-end-component", size: "300px" }
      ]
    },
    { id: "end-component", size: "270px" }
  ]
};

export const layout5: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    { id: "start-component", size: "3fr" },
    { id: "center-2-component", size: "100px" },
    { id: "end-end-component", size: "2fr" },
    { id: "center-component", size: "200px" },
    { id: "end-component", size: "180px" }
  ]
};

export const layout6: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    { id: "start-component", size: "3fr" },
    { id: "end-end-component", size: "2fr" },
    { id: "center-2-component", size: "1fr" },
    { id: "center-component", size: "0.5fr" },
    { id: "end-component", size: "180px" }
  ]
};

export const layout7: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    { id: "start-component", size: "300px", dragBar: { size: 1 } },
    {
      id: "sub-group-1",
      dragBar: { size: 1 },
      size: "1fr",
      direction: "rows",
      items: [
        {
          id: "sub-group-1-1",
          dragBar: { size: 1 },
          size: "1fr",
          direction: "columns",
          items: [
            {
              id: "center-component",
              size: "1fr",
              dragBar: { size: 1 }
            },
            { id: "center-2-component", size: "1fr" }
          ]
        },
        { id: "end-end-component", size: "300px" }
      ]
    },
    { id: "end-component", size: "270px" }
  ]
};

export const layout8: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    { id: "start-component", size: "300px", dragBar: { size: 5 } },
    {
      id: "sub-group-1",
      dragBar: { size: 4 },
      size: "1fr",
      direction: "rows",
      items: [
        {
          id: "sub-group-1-1",
          dragBar: { size: 3 },
          size: "1fr",
          direction: "columns",
          items: [
            {
              id: "center-component",
              size: "1fr",
              dragBar: { size: 2 }
            },
            { id: "center-2-component", size: "1fr" }
          ]
        },
        { id: "end-end-component", size: "300px" }
      ]
    },
    { id: "end-component", size: "270px" }
  ]
};
