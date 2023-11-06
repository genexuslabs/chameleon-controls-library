gx.uc.chameleonGrid = function () {
  var _control, _controlState;

  this.getControlState = function () {
    _controlState = _control.state;

    return _controlState;
  };

  this.setControlState = function (value) {
    _controlState = value;
  };

  this.show = function () {
    if (!this.IsPostBack) {
      if (_control) {
        _control.gridTimestamp = Date.now();
        _control.state = { ..._controlState };
      } else {
        _control = document.createElement("gx-grid-chameleon");
        _control.grid = this;
        _control.state = _controlState;

        this.getContainerControl().appendChild(
          new DocumentFragment().appendChild(_control)
        );
      }
    } else {
      _control.gridTimestamp = Date.now();
      _control.state = { ..._controlState };
    }
  };
};
