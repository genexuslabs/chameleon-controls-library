gx.uc.chameleonGrid = function () {
  var _control;

  this.show = function () {
    if (!this.IsPostBack) {
      if (_control) {
        _control.gridTimestamp = Date.now();
      } else {
        var fragment = new DocumentFragment();
        _control = document.createElement("gx-grid-chameleon");

        _control.grid = this;
        fragment.appendChild(_control);

        this.getContainerControl().appendChild(fragment);
      }
    } else {
      _control.gridTimestamp = Date.now();
    }
  };
};
