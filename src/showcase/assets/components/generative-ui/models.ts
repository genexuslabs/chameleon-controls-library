import { GenerativeUISample } from "../../../../components/generative-ui/internal/types";
import { dataTypeInGeneXus } from "../combo-box/models";
import {
  checkDroppableZoneCallback,
  dropItemsCallback,
  getImagePathCallback,
  kbExplorerModel,
  lazyLoadTreeItemsCallback
} from "../tree-view/models";
import { generativeUIFileSystemModel } from "./model-file-system";
import { generativeUIWebFormModel } from "./web-form";

const TREE_VIEW_TAG = "ch-tree-view-render";
const COMBO_BOX_TAG = "ch-combo-box";

const updateTreeViewModels = (renderRef: HTMLElement) => {
  const treeViews = renderRef.querySelectorAll(TREE_VIEW_TAG);

  treeViews.forEach(treeView => {
    treeView.model = structuredClone(kbExplorerModel);
    treeView.checkDroppableZoneCallback = checkDroppableZoneCallback;
    treeView.dropItemsCallback = dropItemsCallback;
    treeView.lazyLoadTreeItemsCallback = lazyLoadTreeItemsCallback;
    treeView.getImagePathCallback = getImagePathCallback;
  });
};

const updateComboBoxModels = (renderRef: HTMLElement) => {
  const comboBoxes = renderRef.querySelectorAll(COMBO_BOX_TAG);

  comboBoxes.forEach(comboBox => {
    comboBox.model = structuredClone(dataTypeInGeneXus);
  });
};

export const updateModels = (renderRef: HTMLElement) => {
  updateComboBoxModels(renderRef);
  updateTreeViewModels(renderRef);
};

export const samples: GenerativeUISample[] = [
  {
    caption: "File system",
    imageSrc:
      "url('https://unpkg.com/@genexus/mercury@0.2.0/dist/assets/icons/objects/dark/folder-open.svg#enabled')",
    initializeModels: renderRef => {
      updateTreeViewModels(renderRef);

      const editRef = renderRef.querySelector("ch-edit")!;
      const treeViewRef = renderRef.querySelector("ch-tree-view-render")!;

      editRef.addEventListener("input", () => {
        treeViewRef.filter = editRef.value;
      });
    },
    prompt: "A file system",
    html: generativeUIFileSystemModel
  },
  {
    caption: "Web form",
    imageSrc:
      "url('https://unpkg.com/@genexus/mercury@0.2.0/dist/assets/icons/objects/dark/web-panel.svg#enabled')",
    initializeModels: renderRef => {
      updateComboBoxModels(renderRef);

      // const editRef = renderRef.querySelector("ch-edit")!;
      // const treeViewRef = renderRef.querySelector("ch-tree-view-render")!;

      // editRef.addEventListener("input", () => {
      //   console.log(editRef);
      //   treeViewRef.filter = editRef.value;
      // });
    },
    prompt: "A web form with an input for the email and the password",
    html: generativeUIWebFormModel
  }
];
