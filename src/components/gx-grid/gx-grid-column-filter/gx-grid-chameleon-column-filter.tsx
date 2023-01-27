import {
    Element,
    Component,
    h,
    Host,
    Prop,
    Event,
    EventEmitter
  } from "@stencil/core";
import { Gx, GxControlDataType, GxControlPossibleValues, GxControlType, gxdate, GxGridColumn } from "../genexus";
  
  declare var gx: Gx;

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
        this.equal = this.getControlValue(this.inputEqual);
        this.less = this.getControlValue(this.inputLess);
        this.greater = this.getControlValue(this.inputGreater);

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

    private getControlValue(input: HTMLInputElement | HTMLSelectElement): string {
      const value = input?.value ?? "";
      let dataType = this.column.gxControl.dataType;

      if (dataType == GxControlDataType.DATETIME && this.column.FilterDateTimeAsDate == -1) {
        dataType = GxControlDataType.DATE;
      }

      switch (dataType) {
        case GxControlDataType.DATE:
          return gx.date.ctod(value, "Y4MD").toString();
        case GxControlDataType.DATETIME:
          return gx.date.ctot(value, "Y4MD").toString();
        default:
          return value;
      }
    }

    private toControlValue(value: string): string {
      let dataType = this.column.gxControl.dataType;

      if (!value) {
        return "";
      }

      if (dataType == GxControlDataType.DATETIME && this.column.FilterDateTimeAsDate == -1) {
        dataType = GxControlDataType.DATE;
      }

      switch (dataType) {
        case GxControlDataType.DATE:
          return this.convertGxDateToISO(gx.date.ctod(value), false);
        case GxControlDataType.DATETIME:
          return this.convertGxDateToISO(gx.date.ctot(value), true);
        default:
          return value;
      }
    }

    private convertGxDateToISO(gxdate: gxdate, isDateTime: boolean): string {
      const pad = (n:number) => n.toString().padStart(2, "0");
      const date = gxdate.Value;

      if (gx.date.isNullDate(date)) {
        return "";
      }

      if (isDateTime) {
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
      } else {
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
      }
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

        if (dataType == GxControlDataType.DATETIME && this.column.FilterDateTimeAsDate == -1) {
          dataType = GxControlDataType.DATE;
        }

        switch (type) {
          case GxControlType.EDIT:
          case GxControlType.CHECK:
            return (
              <label part={`label ${part}`}>
                {label}
                <input
                  type={this.getFilterInputType(dataType)}
                  value={this.toControlValue(value)}
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
