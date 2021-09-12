import {
  Component,
  Host,
  h,
  Element,
  Prop,
  Event,
  EventEmitter,
} from "@stencil/core";
import datepicker from "js-datepicker";

@Component({
  tag: "ch-grid-date-picker",
  styleUrl: "ch-grid-date-picker.scss",
  shadow: true,
})
export class ChGridDatePicker {
  @Element() el: HTMLChGridDatePickerElement;

  /*******************
  PROPS
  ********************/

  /**
   * The presence of this attribute makes the date-picker always visible
   */
  @Prop() alwaysShow = false;

  /**
   * The date picker id
   */
  @Prop() datePickerId: string;

  /**
   * The date picker class
   */
  @Prop() datePickerClass: string;

  /**
   * initial date
   */
  @Prop() defaultDate: string;

  /**
   * The datepicker label
   */
  @Prop() label: string;

  /**
   * no weekends available
   */
  @Prop() noWeekends = false;

  /**
   * The min. date
   */
  @Prop() minDate = "1000, 1, 1";

  /**
   * The max. date
   */
  @Prop() maxDate = "3000, 1, 1";

  /**
   * The max. width
   */
  @Prop() maxWidth = "100%";

  /**
   * The columnd id that this datepicker belongs to
   */
  @Prop() colId: string = undefined;

  /*******************
  EVENTS
  ********************/

  /**
   * Emmits the sorting event
   */
  @Event() dateRangeChanged: EventEmitter;

  /*******************
  FUNCTIONS/METHODS
  ********************/

  componentDidLoad() {
    //Datepicker Options
    let defaultDate = new Date();

    if (this.defaultDate !== undefined && this.defaultDate !== "") {
      //default/initial date
      const d = new Date(this.defaultDate);
      if (Object.prototype.toString.call(d) === "[object Date]") {
        // it is a date
        if (isNaN(d.getTime())) {
          // d.valueOf() could also work
          // date is not valid
        } else {
          // date is valid
          defaultDate = new Date(this.defaultDate);
        }
      } else {
        // not a date
      }
    }

    //default date
    const defaultDateYear = defaultDate.getFullYear();
    const defaultDateMonth = defaultDate.getMonth();
    const defaultDateDay = defaultDate.getDate();

    //min date
    const minDate = new Date(this.minDate);
    const minDateYear = minDate.getFullYear();
    const minDateMonth = minDate.getMonth();
    const minDateDay = minDate.getDate();
    //max date
    const maxDate = new Date(this.maxDate);
    const maxDateYear = maxDate.getFullYear();
    const maxDateMonth = maxDate.getMonth();
    const maxDateDay = maxDate.getDate();

    //DATE PICKER START
    //const pickerSelector = this.el.shadowRoot.querySelector("#date-picker");
    const startPickerSelector = this.el.shadowRoot.querySelector(".start");
    const start = datepicker(startPickerSelector, {
      // Event callbacks.
      onSelect: (instance) => {
        this.dateRangeChanged.emit({
          "column-id": this.colId,
          "date-range": start.getRange(),
        });
      },
      // onShow: instance => {

      // },
      // onHide: instance => {

      // },
      // onMonthChange: instance => {

      // },

      // Customizations.
      formatter: (input, date) => {
        // This will display the date as `1/1/2019`.
        input.value = date.toDateString();
      },
      position: "bl",
      startDay: 1, // Calendar week starts on a Monday.
      customDays: ["S", "M", "T", "W", "T", "F", "S"],
      customMonths: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      customOverlayMonths: [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ],
      overlayButton: "Go!",
      overlayPlaceholder: "Enter a 4-digit year",

      // Settings.
      alwaysShow: this.alwaysShow, // Never hide the calendar.
      //dateSelected: new Date(defaultDateYear, defaultDateMonth, defaultDateDay),
      maxDate: new Date(maxDateYear, maxDateMonth, maxDateDay), // Jan 1st, 2099.
      minDate: new Date(minDateYear, minDateMonth, minDateDay), // June 1st, 2016.
      startDate: new Date(), // This month.
      showAllDates: true, // Numbers for leading & trailing days outside the current month will show.

      // Disabling things.
      noWeekends: this.noWeekends, // Saturday's and Sunday's will be unselectable.
      disabler: (date) => date.getDay() === 2 && date.getMonth() === 9, // Disabled every Tuesday in October
      // disabledDates: [new Date(2050, 0, 1), new Date(2050, 0, 3)], // Specific disabled dates.
      disableMobile: false, // Conditionally disabled on mobile devices.
      disableYearOverlay: false, // Clicking the year or month will *not* bring up the year overlay.

      // ID - be sure to provide a 2nd picker with the same id to create a daterange pair.
      id: this.datePickerId,
    });
    //picker.setDate(new Date(2099, 0, 1), true);
    start.calendarContainer.style.setProperty("font-size", "12px");

    //DATE PICKER END
    //const pickerSelector = this.el.shadowRoot.querySelector("#date-picker");
    const endPickerSelector = this.el.shadowRoot.querySelector(".end");
    const end = datepicker(endPickerSelector, {
      // Event callbacks.
      onSelect: (instance) => {
        this.dateRangeChanged.emit({
          "column-id": this.colId,
          "date-range": end.getRange(),
        });
      },
      // onShow: instance => {

      // },
      // onHide: instance => {

      // },
      // onMonthChange: instance => {

      // },

      // Customizations.
      formatter: (input, date) => {
        // This will display the date as `1/1/2019`.
        input.value = date.toDateString();
      },
      position: "bl",
      startDay: 1, // Calendar week starts on a Monday.
      customDays: ["S", "M", "T", "W", "T", "F", "S"],
      customMonths: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      customOverlayMonths: [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ],
      overlayButton: "Go!",
      overlayPlaceholder: "Enter a 4-digit year",

      // Settings.
      alwaysShow: this.alwaysShow, // Never hide the calendar.
      //dateSelected: new Date(defaultDateYear, defaultDateMonth, defaultDateDay),
      maxDate: new Date(maxDateYear, maxDateMonth, maxDateDay), // Jan 1st, 2099.
      minDate: new Date(minDateYear, minDateMonth, minDateDay), // June 1st, 2016.
      startDate: new Date(), // This month.
      showAllDates: true, // Numbers for leading & trailing days outside the current month will show.

      // Disabling things.
      noWeekends: this.noWeekends, // Saturday's and Sunday's will be unselectable.
      disabler: (date) => date.getDay() === 2 && date.getMonth() === 9, // Disabled every Tuesday in October
      // disabledDates: [new Date(2050, 0, 1), new Date(2050, 0, 3)], // Specific disabled dates.
      disableMobile: false, // Conditionally disabled on mobile devices.
      disableYearOverlay: false, // Clicking the year or month will *not* bring up the year overlay.

      // ID - be sure to provide a 2nd picker with the same id to create a daterange pair.
      id: this.datePickerId,
    });
    //picker.setDate(new Date(2099, 0, 1), true);
    end.calendarContainer.style.setProperty("font-size", "12px");
  }

  printLabel() {
    if (this.label) {
      return <label class="label">{this.label}</label>;
    }
  }

  render() {
    return (
      <Host
        style={{
          maxWidth: this.maxWidth,
        }}
      >
        {this.printLabel()}
        <label class={{ "label-start-date": true }}>Start Date</label>
        <input
          type="text"
          id={this.datePickerId}
          class={{ start: true }}
        ></input>
        <label class={{ "label-end-date": true }}>End Date</label>
        <input type="text" id={this.datePickerId} class={{ end: true }}></input>
      </Host>
    );
  }
}
