export const generativeUIFileSystemModel = `<div class="generated-container">
  <ch-edit class="form-input" placeholder="Search..."></ch-edit>
  <ch-tree-view-render
    class="tree-view tree-view-secondary"
    drag-disabled="false"
    drop-disabled="false"
    filter-type="caption"
    multi-selection
    show-lines="last"
  >
  </ch-tree-view-render>
</div>
<style>
  .generated-container {
    display: grid;
    grid-template-rows: max-content 1fr;
    gap: 8px;
  }
</style>
`;
