import {
  TabularGridColumnModel,
  TabularGridModel,
  TabularGridRowModel
} from "../../../../components/tabular-grid-render/types";

const columnsCountry: TabularGridColumnModel[] = [
  {
    caption: "Code"
  },
  {
    caption: "Name"
  },
  {
    caption: "Population"
  },
  {
    caption: "Language"
  }
];

const columnsTreeGrid: TabularGridColumnModel[] = [
  {
    caption: "Name"
  },
  {
    caption: "Type"
  },
  {
    caption: "Description"
  },
  {
    caption: "Collection"
  }
];

const columnsPropertyGrid: TabularGridColumnModel[] = [
  {
    caption: "Property"
  },
  {
    caption: "Value"
  }
];

const rowCountryAR: TabularGridRowModel = {
  cells: [
    { text: "AR" },
    { text: "Argentina" },
    { text: "45.400.000" },
    { text: "Español" }
  ]
};
const rowCountryBO: TabularGridRowModel = {
  cells: [
    { text: "BO" },
    { text: "Bolivia" },
    { text: "11.800.000" },
    { text: "Español" }
  ]
};
const rowCountryBR: TabularGridRowModel = {
  cells: [
    { text: "BR" },
    { text: "Brasil" },
    { text: "212.600.000" },
    { text: "Português" }
  ]
};
const rowCountryCL: TabularGridRowModel = {
  cells: [
    { text: "CL" },
    { text: "Chile" },
    { text: "19.500.000" },
    { text: "Español" }
  ]
};
const rowCountryCO: TabularGridRowModel = {
  cells: [
    { text: "CO" },
    { text: "Colombia" },
    { text: "38.750.000" },
    { text: "Español" }
  ]
};
const rowCountryEC: TabularGridRowModel = {
  cells: [
    { text: "EC" },
    { text: "Ecuador" },
    { text: "17.600.000" },
    { text: "Español" }
  ]
};
const rowCountryPY: TabularGridRowModel = {
  cells: [
    { text: "PY" },
    { text: "Paraguay" },
    { text: "7.500.000" },
    { text: "Español" }
  ]
};
const rowCountryPE: TabularGridRowModel = {
  cells: [
    { text: "PE" },
    { text: "Perú" },
    { text: "32.800.000" },
    { text: "Español" }
  ]
};
const rowCountryUY: TabularGridRowModel = {
  cells: [
    { text: "UY" },
    { text: "Uruguay" },
    { text: "3.500.000" },
    { text: "Español" }
  ]
};
const rowCountryVE: TabularGridRowModel = {
  cells: [
    { text: "VE" },
    { text: "Venezuela" },
    { text: "28.500.000" },
    { text: "Español" }
  ]
};

const rowCountryCA: TabularGridRowModel = {
  cells: [
    { text: "CA" },
    { text: "Canadá" },
    { text: "38.000.000" },
    { text: "English" }
  ]
};
const rowCountryMX: TabularGridRowModel = {
  cells: [
    { text: "MX" },
    { text: "México" },
    { text: "126.000.000" },
    { text: "Español" }
  ]
};
const rowCountryUS: TabularGridRowModel = {
  cells: [
    { text: "US" },
    { text: "Estados Unidos" },
    { text: "331.000.000" },
    { text: "English" }
  ]
};

export const basicModel: TabularGridModel = {
  columns: columnsCountry,
  rowsets: [
    {
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

export const groupModel: TabularGridModel = {
  columns: columnsCountry,
  rowsets: [
    {
      legend: { caption: "América del Norte" },
      rows: [rowCountryCA, rowCountryMX, rowCountryUS]
    },
    {
      legend: { caption: "América del Sur" },
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
  rowsets: [
    {
      rows: [
        {
          cells: [
            { text: "Target" },
            { text: "" },
            { text: "Target" },
            { text: "false" }
          ],
          rows: [
            {
              cells: [
                { text: "TargetType" },
                { text: "TargetType, GeneXus.Common.Notifications" },
                { text: "Target Type (required)" },
                { text: "false" }
              ]
            },
            {
              cells: [
                { text: "Devices" },
                { text: "" },
                { text: "Devices List" },
                { text: "true" }
              ],
              rows: [
                {
                  cells: [
                    { text: "Device" },
                    { text: "" },
                    { text: "" },
                    { text: "" }
                  ],
                  rows: [
                    {
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
              cells: [
                { text: "Groups" },
                { text: "" },
                { text: "Groups" },
                { text: "true" }
              ],
              rows: [
                {
                  cells: [
                    { text: "Group" },
                    { text: "" },
                    { text: "" },
                    { text: "" }
                  ],
                  rows: [
                    {
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
              cells: [
                { text: "Targets" },
                { text: "" },
                { text: "Targets" },
                { text: "true" }
              ],
              rows: [
                {
                  cells: [
                    { text: "Filter" },
                    { text: "" },
                    { text: "" },
                    { text: "" }
                  ],
                  rows: [
                    {
                      cells: [
                        { text: "Name" },
                        { text: "Character(100)" },
                        { text: "Name" },
                        { text: "false" }
                      ]
                    },
                    {
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
  ]
};

export const propertyGridModel: TabularGridModel = {
  columns: columnsPropertyGrid,
  rowsets: [
    {
      rows: [
        {
          cells: [{ text: "Nombre" }, { text: "Productos" }],
          rows: [
            { cells: [{ text: "English" }, { text: "Products" }] },
            { cells: [{ text: "Português" }, { text: "Produtos" }] }
          ]
        },
        {
          cells: [
            { text: "Redireccionar a" },
            { text: "Tecnologías soportadas" }
          ]
        },
        { cells: [{ text: "Tipo de redirección" }, { text: "Found" }] }
      ]
    },
    {
      legend: { caption: "Url" },
      rows: [
        {
          cells: [{ text: "Url amigable" }, { text: "productos" }],
          rows: [
            { cells: [{ text: "English" }, { text: "products" }] },
            { cells: [{ text: "Português" }, { text: "produtos" }] }
          ]
        }
      ],
      rowsets: [
        {
          legend: { caption: "Permalink" },
          rows: [
            { cells: [{ text: "Id" }, { text: "Found" }] },
            { cells: [{ text: "Guid" }, { text: "abcdef-peodfg-293845-3947" }] }
          ]
        }
      ]
    }
  ]
};
