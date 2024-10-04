import {
  TabularGridColumnsModel,
  TabularGridModel,
  TabularGridRowItemModel
} from "../../../../components/tabular-grid-render/types";

const columnsCountry: TabularGridColumnsModel = [
  {
    id: "code",
    caption: "Code",
    parts: "iso"
  },
  {
    id: "name",
    caption: "Name"
  },
  {
    id: "population",
    caption: "Population"
  },
  {
    id: "lang",
    caption: "Language"
  }
];

const columnsTreeGrid: TabularGridColumnsModel = [
  {
    id: "name",
    caption: "Name"
  },
  {
    id: "type",
    caption: "Type"
  },
  {
    id: "desc",
    caption: "Description"
  },
  {
    id: "collection",
    caption: "Collection"
  }
];

const columnsPropertyGrid: TabularGridColumnsModel = [
  {
    id: "name",
    caption: "Property"
  },
  {
    id: "value",
    caption: "Value"
  }
];

const rowCountryAR: TabularGridRowItemModel = {
  id: "ar",
  cells: [
    { text: "AR" },
    { text: "Argentina" },
    { text: "45.400.000" },
    { text: "Español" }
  ]
};
const rowCountryBO: TabularGridRowItemModel = {
  id: "bo",
  cells: [
    { text: "BO" },
    { text: "Bolivia" },
    { text: "11.800.000" },
    { text: "Español" }
  ]
};
const rowCountryBR: TabularGridRowItemModel = {
  id: "br",
  cells: [
    { text: "BR" },
    { text: "Brasil" },
    { text: "212.600.000" },
    { text: "Português" }
  ]
};
const rowCountryCL: TabularGridRowItemModel = {
  id: "cl",
  cells: [
    { text: "CL" },
    { text: "Chile" },
    { text: "19.500.000" },
    { text: "Español" }
  ]
};
const rowCountryCO: TabularGridRowItemModel = {
  id: "co",
  cells: [
    { text: "CO" },
    { text: "Colombia" },
    { text: "38.750.000" },
    { text: "Español" }
  ]
};
const rowCountryEC: TabularGridRowItemModel = {
  id: "ec",
  cells: [
    { text: "EC" },
    { text: "Ecuador" },
    { text: "17.600.000" },
    { text: "Español" }
  ]
};
const rowCountryPY: TabularGridRowItemModel = {
  id: "py",
  cells: [
    { text: "PY" },
    { text: "Paraguay" },
    { text: "7.500.000" },
    { text: "Español" }
  ]
};
const rowCountryPE: TabularGridRowItemModel = {
  id: "pe",
  cells: [
    { text: "PE" },
    { text: "Perú" },
    { text: "32.800.000" },
    { text: "Español" }
  ]
};
const rowCountryUY: TabularGridRowItemModel = {
  id: "uy",
  cells: [
    { text: "UY" },
    { text: "Uruguay" },
    { text: "3.500.000" },
    { text: "Español" }
  ]
};
const rowCountryVE: TabularGridRowItemModel = {
  id: "ve",
  cells: [
    { text: "VE" },
    { text: "Venezuela" },
    { text: "28.500.000" },
    { text: "Español" }
  ]
};

const rowCountryCA: TabularGridRowItemModel = {
  id: "ca",
  cells: [
    { text: "CA" },
    { text: "Canadá" },
    { text: "38.000.000" },
    { text: "English" }
  ]
};
const rowCountryMX: TabularGridRowItemModel = {
  id: "mx",
  cells: [
    { text: "MX" },
    { text: "México" },
    { text: "126.000.000" },
    { text: "Español" }
  ]
};
const rowCountryUS: TabularGridRowItemModel = {
  id: "us",
  cells: [
    { text: "US" },
    { text: "Estados Unidos" },
    { text: "331.000.000" },
    { text: "English" }
  ]
};

export const basicModel: TabularGridModel = {
  columns: columnsCountry,
  rowsets: {
    rows: [
      rowCountryAR,
      rowCountryBO,
      rowCountryBR,
      rowCountryCL,
      rowCountryCO,
      rowCountryEC,
      rowCountryPE,
      rowCountryPY,
      rowCountryUY,
      rowCountryVE
    ]
  }
};

export const groupModel: TabularGridModel = {
  columns: columnsCountry,
  rowsets: [
    {
      id: "america-north",
      caption: "América del Norte",
      rows: [rowCountryCA, rowCountryMX, rowCountryUS]
    },
    {
      id: "america-south",
      caption: "América del Sur",
      rows: [
        rowCountryAR,
        rowCountryBO,
        rowCountryBR,
        rowCountryCL,
        rowCountryCO,
        rowCountryEC,
        rowCountryPE,
        rowCountryPY,
        rowCountryUY,
        rowCountryVE
      ]
    }
  ]
};

export const treeGridModel: TabularGridModel = {
  columns: columnsTreeGrid,
  rowsets: {
    rows: [
      {
        id: "target",
        cells: [
          { text: "Target" },
          { text: "" },
          { text: "Target" },
          { text: "false" }
        ],
        rows: [
          {
            id: "target-type",
            cells: [
              { text: "TargetType" },
              { text: "TargetType, GeneXus.Common.Notifications" },
              { text: "Target Type (required)" },
              { text: "false" }
            ]
          },
          {
            id: "devices",
            cells: [
              { text: "Devices" },
              { text: "" },
              { text: "Devices List" },
              { text: "true" }
            ],
            rows: [
              {
                id: "device",
                cells: [
                  { text: "Device" },
                  { text: "" },
                  { text: "" },
                  { text: "" }
                ],
                rows: [
                  {
                    id: "device-token",
                    cells: [
                      { text: "DeviceToken" },
                      { text: "Character(500)" },
                      { text: "DeviceToken" },
                      { text: "false" }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: "groups",
            cells: [
              { text: "Groups" },
              { text: "" },
              { text: "Groups" },
              { text: "true" }
            ],
            rows: [
              {
                id: "group",
                cells: [
                  { text: "Group" },
                  { text: "" },
                  { text: "" },
                  { text: "" }
                ],
                rows: [
                  {
                    id: "name",
                    cells: [
                      { text: "Name" },
                      { text: "Character(100)" },
                      { text: "Name" },
                      { text: "false" }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: "targets",
            cells: [
              { text: "Targets" },
              { text: "" },
              { text: "Targets" },
              { text: "true" }
            ],
            rows: [
              {
                id: "filter",
                cells: [
                  { text: "Filter" },
                  { text: "" },
                  { text: "" },
                  { text: "" }
                ],
                rows: [
                  {
                    id: "name",
                    cells: [
                      { text: "Name" },
                      { text: "Character(100)" },
                      { text: "Name" },
                      { text: "false" }
                    ]
                  },
                  {
                    id: "value",
                    cells: [
                      { text: "Value" },
                      { text: "Character(100)" },
                      { text: "Value" },
                      { text: "false" }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

export const propertyGridModel: TabularGridModel = {
  columns: columnsPropertyGrid,
  rowsets: [
    {
      rows: [
        {
          id: "name",
          cells: [{ text: "Nombre" }, { text: "Productos" }],
          rows: [
            {
              id: "english",
              cells: [{ text: "English" }, { text: "Products" }]
            },
            {
              id: "portugues",
              cells: [{ text: "Português" }, { text: "Produtos" }]
            }
          ]
        },
        {
          id: "redirect",
          cells: [
            { text: "Redireccionar a" },
            { text: "Tecnologías soportadas" }
          ]
        },
        {
          id: "redirect-type",
          cells: [{ text: "Tipo de redirección" }, { text: "Found" }]
        }
      ]
    },
    {
      id: "url",
      caption: "Url",
      rows: [
        {
          id: "url-friendly",
          cells: [{ text: "Url amigable" }, { text: "productos" }],
          rows: [
            {
              id: "english",
              cells: [{ text: "English" }, { text: "products" }]
            },
            {
              id: "portugues",
              cells: [{ text: "Português" }, { text: "produtos" }]
            }
          ]
        }
      ],
      rowsets: [
        {
          id: "permalink",
          caption: "Permalink",
          rows: [
            { id: "id", cells: [{ text: "Id" }, { text: "Found" }] },
            {
              id: "guid",
              cells: [{ text: "Guid" }, { text: "abcdef-peodfg-293845-3947" }]
            }
          ]
        }
      ]
    }
  ]
};
