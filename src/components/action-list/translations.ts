export type ActionListTranslations = {
  confirm: string;
  cancel: string;
  confirmDelete: string;
  cancelDelete: string;
  confirmModify: string;
  cancelModify: string;

  pin: string;
  unpin: string;
  delete: string;
  modify: string;
};

export const actionListDefaultTranslations = Object.freeze({
  confirm: "Confirm",
  cancel: "Cancel",

  confirmDelete: "Confirm delete",
  cancelDelete: "Cancel delete",
  confirmModify: "Confirm modification",
  cancelModify: "Cancel modification",

  pin: "Pin",
  unpin: "Unpin",
  delete: "Delete",
  modify: "Modify"
}) satisfies Readonly<ActionListTranslations>;
