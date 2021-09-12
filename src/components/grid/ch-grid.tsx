import { Component, Host, h, Element } from "@stencil/core";

@Component({
  tag: "ch-grid",
  styleUrl: "ch-grid.scss",
  shadow: true,
})
export class ChGrid {
  @Element() el: HTMLChGridElement;

  private _actionGroup;
  private _section;

  componentDidLoad() {
    this.init();
  }

  init() {
    console.log("init");
    const chgrid = this.el;
    const chgridSection = this.el.shadowRoot.querySelector("section");

    this.evaluateRowsetLevel();

    chgrid.addEventListener("click", this.onClick);
    chgridSection.addEventListener("mousemove", this.onHover, {
      passive: true,
    });
    chgridSection.addEventListener("scroll", this.onScroll, { passive: true });

    this._section = this.el.shadowRoot.querySelector("section");
    this._actionGroup = document.querySelector("ch-grid-ag");
    if (this._actionGroup) {
      chgrid.addEventListener("mouseover", this.actionPosition.bind(this));
    }
  }

  onHover(eventInfo) {
    console.log("hover section");
    const row = eventInfo.composedPath().find((element) => {
      if (element.classList) {
        return element.classList.contains("ch-grid-row");
      } else {
        return false;
      }
    });

    if (row) {
      if (!row.classList.contains("hover")) {
        document.querySelector(".ch-grid-row.hover")?.classList.remove("hover");
        row.classList.add("hover");
      }
    } else {
      document.querySelector(".ch-grid-row.hover")?.classList.remove("hover");
    }
  }

  onClick(eventInfo) {
    console.log("clicked in ch-grid!");
    const row = eventInfo.composedPath().find((element) => {
      if (element.classList) {
        return element.classList.contains("ch-grid-row");
      } else {
        return false;
      }
    });

    if (row) {
      document
        .querySelector(".ch-grid-row.selected")
        ?.classList.remove("selected");
      row.classList.add("selected");

      if (row.classList.contains("has-childs")) {
        row.classList.toggle("expanded");
      }
    }
  }

  onScroll(eventInfo) {
    eventInfo.target.style.setProperty(
      "--scrollH",
      eventInfo.target.scrollLeft + "px"
    );
  }

  evaluateRowsetLevel() {
    //listo
    const rowsets = document.querySelectorAll("ch-grid-rowset");

    rowsets.forEach((rowset) => {
      if (rowset.parentElement.tagName == "CH-GRID-ROW") {
        rowset.parentElement.classList.add("has-childs");
        rowset.parentElement.classList.add("expanded");
      }
      if (rowset.parentElement.tagName == "CH-GRID") {
        (rowset as HTMLElement).style.setProperty("--level", "0");
      } else {
        const parentLevel = parseInt(
          rowset.parentElement.parentElement.style.getPropertyValue("--level")
        );
        (rowset as HTMLElement).style.setProperty(
          "--level",
          (parentLevel + 1).toString()
        );
      }
    });

    //   const secondGridCellsInsideRowSet = document.querySelectorAll("ch-grid-row > ch-grid-rowset ch-grid-cell:nth-child(2)");
    //   secondGridCellsInsideRowSet.forEach((secondGridCellInsideRowSet) => {
    //     secondGridCellInsideRowSet.classList.add("nested");
    //   });
  }

  actionPosition(eventInfo) {
    const target = eventInfo.composedPath().find((element) => {
      if (element.tagName) {
        return (
          element.tagName == "CH-GRID-ROW" || element.tagName == "CH-GRID-AG"
        );
      } else {
        return false;
      }
    });
    if (target) {
      if (target.tagName == "CH-GRID-ROW") {
        const cell = target.querySelector(":scope > ch-grid-cell:nth-child(2)");
        this._actionGroup.removeAttribute("hidden");
        console.log("cell.offsetTop", cell.offsetTop);
        console.log("this._section", this._section);
        this._actionGroup.style.top = `${
          cell.offsetTop - this._section.scrollTop
        }px`;
      }
    } else {
      this._actionGroup.setAttribute("hidden", "hidden");
    }
  }

  actionPositionOriginal(eventInfo) {
    const target = eventInfo.composedPath().find((element) => {
      if (element.classList) {
        return (
          element.classList.contains("ch-grid-row") ||
          element.classList.contains("action-group")
        );
      } else {
        return false;
      }
    });

    if (target) {
      if (target.classList.contains("ch-grid-row")) {
        const cell = target.querySelector(
          ":scope > .ch-grid-cell:nth-child(2)"
        );
        this._actionGroup.removeAttribute("hidden");
        this._actionGroup.style.top = `${
          cell.offsetTop - this._section.scrollTop
        }px`;
      }
    } else {
      this._actionGroup.setAttribute("hidden", "hidden");
    }
  }

  render() {
    return (
      <Host>
        <slot name="header"></slot>
        <section>
          <slot></slot>
        </section>
        <aside>
          <slot name="row-hover"></slot>
        </aside>
        <slot name="footer"></slot>
      </Host>
    );
  }
}
