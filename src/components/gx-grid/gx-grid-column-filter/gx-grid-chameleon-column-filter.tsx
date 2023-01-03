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
    @Prop({mutable: true}) equal: string;
    @Prop({mutable: true}) less: string;
    @Prop({mutable: true}) greater: string;
    @Event() columnSettingsChanged: EventEmitter<GridChameleonColumnFilterChanged>;

    private inputEqual: HTMLInputElement | HTMLSelectElement;
    private inputLess: HTMLInputElement | HTMLSelectElement;
    private inputGreater: HTMLInputElement | HTMLSelectElement;


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
      console.log(this.column);
      return (
        <Host>
            <fieldset>
              <caption>Filter</caption>
              {this.column.FilterMode == "single" &&
                  this.renderColumnFilterControl(
                  "inputEqual",
                  this.column.FilterEnum,
                  this.column.gxControl.type,
                  this.column.gxControl.dataType,
                  this.column.gxControl.possibleValues,
                  this.equal
              )}
              {this.column.FilterMode == "range" &&
                  this.renderColumnFilterControl(
                  "inputLess",
                  this.column.FilterEnum,
                  this.column.gxControl.type,
                  this.column.gxControl.dataType,
                  this.column.gxControl.possibleValues,
                  this.less
              )}
              {this.column.FilterMode == "range" &&
                  this.renderColumnFilterControl(
                  "inputGreater",
                  this.column.FilterEnum,
                  this.column.gxControl.type,
                  this.column.gxControl.dataType,
                  this.column.gxControl.possibleValues,
                  this.greater
              )}
            </fieldset>
            <button onClick={this.resetClickHandler.bind(this)}>Reset</button>
            <button onClick={this.applyClickHandler.bind(this)}>Apply</button>
        </Host>
      );
    }

    private renderColumnFilterControl(
        input: string,
        filterEnum: GridChameleonColumnFilterEnum[],
        type: GxControlType,
        dataType: GxControlDataType,
        possibleValues: GxControlPossibleValues,
        value: string
      ) {

        if (Array.isArray(filterEnum) && filterEnum.length > 0) {
          type = GxControlType.COMBO;
          possibleValues = filterEnum.map(filter => [filter.Value, filter.Description]);
        }

        switch (type) {
          case GxControlType.EDIT:
          case GxControlType.CHECK:
            return (
              <label>
                <input
                  type={this.getFilterInputType(dataType)}
                  value={value}
                  ref={el => this[input] = el}
                />
              </label>
            );
          case GxControlType.COMBO:
            return (
              <select
                ref={el => this[input] = el}
              >
                {possibleValues.map(([optionValue, optionDescription]) => <option value={optionValue} selected={optionValue==value}>{optionDescription}</option>)}
              </select>
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
