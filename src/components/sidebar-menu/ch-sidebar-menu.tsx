import { Component, Element, Host, h, Prop, getAssetPath } from "@stencil/core";

@Component({
  tag: "ch-sidebar-menu",
  styleUrl: "ch-sidebar-menu.scss",
  shadow: true,
  assetsDirs: ["sidebar-menu-assets"],
})
export class ChSidebarMenu {
  @Element() el: HTMLChSidebarMenuElement;

  private iconArrowLeft: string = getAssetPath(
    `./sidebar-menu-assets/arrow-left.svg`
  );
  private topHeightSpeed = 300;
  private speedDivisionValue = 400;

  /*******************
   * REFERENCES
   *******************/
  main!: HTMLElement;
  menu!: HTMLElement;
  title!: HTMLElement;
  footer!: HTMLElement;
  collapseButton!: HTMLElement;

  /*******************
   * PROPS
   *******************/
  /*
   * The menu title
   */
  @Prop() menuTitle: string;

  componentDidLoad() {
    const titleHeight = this.title.offsetHeight;
    const footerHeight = this.footer.offsetHeight;
    const titleAndFooterHeight = titleHeight + footerHeight + "px";
    const collapsableItems = this.el.querySelectorAll(".collapsable");

    // const items = document.getElementsByClassName("item");

    /*Set main height*/
    this.main.style.height = `calc(100vh - ${titleAndFooterHeight})`;

    //Set the initial items max-height
    const items = this.el.querySelectorAll(".item");
    Array.from((items as unknown) as HTMLCollectionOf<HTMLElement>).forEach(
      function (item) {
        const mainContainer = item.shadowRoot.querySelector(".main-container");
        item.style.maxHeight =
          (mainContainer as HTMLElement).offsetHeight + "px";
      }
    );

    /****************************
    COLLAPSABLE LIST ITEMS LOGIC
    ****************************/
    Array.from(collapsableItems).forEach(
      function (item) {
        const mainContainer = item.shadowRoot.querySelector(".main-container");
        mainContainer.addEventListener(
          "click",
          function (e) {
            if (
              item.classList.contains("list-one__item") &&
              this.menu.classList.contains("collapsed")
            ) {
              //If item clicked is type 1, and menu is collapsed, just uncollapse the menu.
              this.collapseButton.click();
            } else {
              let uncollapsed;
              let actualMaxHeight = parseInt(
                (item as HTMLElement).style.maxHeight.slice(0, -2)
              );
              this.toggleIcon(item); //This function has to be before  uncollapseList or collapseList.
              this.setTransitionSpeed(item);
              if (item.classList.contains("uncollapsed")) {
                this.uncollapseList(item);
                uncollapsed = true;
              } else {
                this.collapseList(item);
                uncollapsed = false;
              }
              //If this item is type 2, then update list 1 transition speed and maxheight
              if (item.classList.contains("list-two__item")) {
                const parentItem1 = item.closest(".list-one__item");
                let heightToTransition = item.querySelector(".list-three")
                  .offsetHeight;
                this.updateListItem1TransitionSpeed(
                  parentItem1,
                  heightToTransition
                );
                //Update list 1 max. height
                this.updateListItem1MaxHeight(parentItem1);
              }
            }
          }.bind(this)
        );
      }.bind(this)
    );
  }

  /*TOGGLE ITEM ICON*/
  toggleIcon(item) {
    if (item.classList.contains("uncollapsed")) {
      item.classList.remove("uncollapsed");
    } else {
      item.classList.add("uncollapsed");
    }
  }

  /*SET ITEM TRANSITION SPEED*/
  setTransitionSpeed(item) {
    let transitionSpeed = 0;
    const childListHeight = item.querySelector("ch-sidebar-menu-list")
      .clientHeight;
    if (childListHeight > this.topHeightSpeed) {
      transitionSpeed = this.topHeightSpeed;
    } else {
      transitionSpeed = childListHeight;
    }
    item.style.transitionDuration =
      transitionSpeed / this.speedDivisionValue + "s";
  }

  /*COLLAPSE LIST*/
  collapseList(item) {
    const mainContainerHeight = item.shadowRoot.querySelector(".main-container")
      .offsetHeight;
    item.style.maxHeight = mainContainerHeight + "px";
  }
  /*UNCOLLAPSE LIST*/
  uncollapseList(item) {
    const mainContainerHeight = item.shadowRoot.querySelector(".main-container")
      .clientHeight;
    const childListHeight = item.querySelector("ch-sidebar-menu-list")
      .clientHeight;
    item.style.maxHeight = mainContainerHeight + childListHeight + "px";
  }

  /*UPDATE LIST ITEM 1 TRANSITION SPEED*/
  updateListItem1TransitionSpeed(item, height) {
    let transitionSpeed = 0;
    if (height > this.topHeightSpeed) {
      transitionSpeed = this.topHeightSpeed;
    } else {
      transitionSpeed = height;
    }
    item.style.transitionDuration = height / this.speedDivisionValue + "s";
  }

  /*UPDATE LIST ITEM 1 MAX HEIGHT*/
  updateListItem1MaxHeight(item) {
    const mainContainerHeight = item.shadowRoot.querySelector(".main-container")
      .clientHeight;
    const list2Items = item.querySelectorAll(
      ":scope > ch-sidebar-menu-list > ch-sidebar-menu-list-item"
    );
    let totalMaxHeight = mainContainerHeight;
    Array.from(list2Items).forEach(function (item) {
      totalMaxHeight += parseInt(
        (item as HTMLElement).style.maxHeight.slice(0, -2)
      );
    });
    item.style.maxHeight = totalMaxHeight + "px";
  }

  render() {
    return (
      <Host>
        <nav id="menu" ref={(el) => (this.menu = el as HTMLElement)}>
          <h1 id="title" ref={(el) => (this.title = el as HTMLElement)}>
            {this.menuTitle}
          </h1>
          <main id="main" ref={(el) => (this.main = el as HTMLElement)}>
            <slot></slot>
          </main>
          <footer id="footer" ref={(el) => (this.footer = el as HTMLElement)}>
            <div id="custom-content">
              <slot name="footer" />
            </div>
            <div
              id="collapse-menu"
              ref={(el) => (this.collapseButton = el as HTMLElement)}
            >
              <ch-icon
                style={{
                  "--icon-color": "#000",
                  "--icon-size": "20px",
                }}
                src={this.iconArrowLeft}
              ></ch-icon>
            </div>
          </footer>
        </nav>
      </Host>
    );
  }
}
