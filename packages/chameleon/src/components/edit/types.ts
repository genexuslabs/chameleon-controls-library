export type EditType =
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url";

export type EditInputMode =
  | "none"
  | "text"
  | "decimal"
  | "numeric"
  | "tel"
  | "search"
  | "email"
  | "url";

export type EditTranslations = {
  accessibleName: {
    /**
     * This property lets you specify the label for the clear search button.
     * Important for accessibility.
     *
     * Only works if `type = "search"` and `multiline = false`.
     */
    clearSearchButton?: "Clear search";

    /**
     * This property lets you specify the label for the show password button
     * when the password is displayed.
     * Important for accessibility.
     *
     * Only works if `type = "password"`, `showPassword = true` and
     * `showPasswordButton = true`
     */
    hidePasswordButton?: "Hide password";

    /**
     * This property lets you specify the label for the show password button
     * when the password is hidden.
     * Important for accessibility.
     *
     * Only works if `type = "password"`, `showPassword = false` and
     * `showPasswordButton = true`
     */
    showPasswordButton?: "Show password";
  };
};
