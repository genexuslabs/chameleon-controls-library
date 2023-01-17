import {
    Element,
    Component,
    h,
    Host,
    Prop,
    Event,
    EventEmitter
  } from "@stencil/core";
import { GxControlDataType, GxControlPossibleValues, GxControlType, GxGridColumn } from "../genexus";
  
  @Component({
    tag: "gx-grid-chameleon-column-filter",
    styleUrl: "gx-grid-chameleon-column-filter.scss",
    shadow: true,
  })
  export class GridChameleonColumnFilter {
    @Element() el: HTMLGxGridChameleonColumnFilterElement;
    @Prop() readonly column: GxGridColumn;
    @Prop() buttonApplyText: string;
    @Prop() buttonResetText: string;
    @Prop({mutable: true}) equal: string;
    @Prop({mutable: true}) less: string;
    @Prop({mutable: true}) greater: string;
    @Event() columnSettingsChanged: EventEmitter<GridChameleonColumnFilterChanged>;

    private filterEnum: GridChameleonColumnFilterEnum[] = [];
    private inputEqual: HTMLInputElement | HTMLSelectElement;
    private inputLess: HTMLInputElement | HTMLSelectElement;
    private inputGreater: HTMLInputElement | HTMLSelectElement;

    componentWillLoad() {
      if (Array.isArray(this.column.FilterEnum) && this.column.FilterEnum.length > 0) {
        this.filterEnum = this.column.FilterEnum;
      }
    }

    private applyClickHandler() {
        this.equal = this.inputEqual?.value ?? "";
        this.less = this.inputLess?.value ?? "";
        this.greater = this.inputGreater?.value ?? "";

        this.columnSettingsChanged.emit({
            column: this.column,
            equal: this.equal,
            less: this.less,
            greater: this.greater
        });
    }
    
    private resetClickHandler() {
        this.equal = "";
        this.less = "";
        this.greater = "";

        this.columnSettingsChanged.emit({
            column: this.column,
            equal: this.equal,
            less: this.less,
            greater: this.greater
        });
    }

    private getFilterInputType(dataType: GxControlDataType): string {
        switch (dataType) {
          case GxControlDataType.BOOLEAN:
            return "checkbox";
          case GxControlDataType.CHAR:
          case GxControlDataType.VARCHAR:
          case GxControlDataType.LONGVARCHAR:
            return "text";
          case GxControlDataType.DATE:
            return "date";
          case GxControlDataType.DATETIME:
            return "datetime-local";
          case GxControlDataType.NUMBER:
            return "number";
          default:
            return "text";
        }
    }

    render() {
      return (
        <Host>
            <fieldset part="main">
              <caption part="caption">{this.column.FilterCaption}</caption>
              {this.column.FilterMode == "single" &&
                  this.renderColumnFilterControl(
                  "inputEqual",
                  this.column.gxControl.type,
                  this.column.gxControl.dataType,
                  this.column.gxControl.possibleValues,
                  this.column.FilterLabelEqual,
                  this.equal
              )}
              {this.column.FilterMode == "range" &&
                  this.renderColumnFilterControl(
                  "inputGreater",
                  this.column.gxControl.type,
                  this.column.gxControl.dataType,
                  this.column.gxControl.possibleValues,
                  this.column.FilterLabelGreater,
                  this.greater
              )}
              {this.column.FilterMode == "range" &&
                  this.renderColumnFilterControl(
                  "inputLess",
                  this.column.gxControl.type,
                  this.column.gxControl.dataType,
                  this.column.gxControl.possibleValues,
                  this.column.FilterLabelLess,
                  this.less
              )}
            </fieldset>
            <section part="footer">
              <button part="button reset" onClick={this.resetClickHandler.bind(this)}>{this.buttonResetText}</button>
              <button part="button apply" onClick={this.applyClickHandler.bind(this)}>{this.buttonApplyText}</button>
            </section>
        </Host>
      );
    }

    private renderColumnFilterControl(
        input: string,
        type: GxControlType,
        dataType: GxControlDataType,
        possibleValues: GxControlPossibleValues,
        label: string,
        value: string
      ) {
        const part = input.replace("input", "").toLowerCase();

        if (this.filterEnum.length > 0) {
          type = GxControlType.COMBO;
          possibleValues = this.filterEnum.map(filter => [filter.Value, filter.Description]);
        }

        switch (type) {
          case GxControlType.EDIT:
          case GxControlType.CHECK:
            return (
              <label part={`label ${part}`}>
                {label}
                <input
                  type={this.getFilterInputType(dataType)}
                  value={value}
                  ref={el => this[input] = el}
                  part={`field ${part}`}
                />
              </label>
            );
          case GxControlType.COMBO:
            return (
              <label part={`label ${part}`}>
                {label}
                <select
                  ref={el => this[input] = el}
                  part={`field ${part}`}
                >
                  {possibleValues.map(([optionValue, optionDescription]) => <option value={optionValue} selected={optionValue==value}>{optionDescription}</option>)}
                </select>
              </label>
            );
        }
      }
  }
  
  export interface GridChameleonColumnFilterEnum {
    Description: string;
    Value: string;
  }

  export interface GridChameleonColumnFilterChanged {
    column: GxGridColumn;
    equal?: string;
    less?: string;
    greater?: string;
  }
