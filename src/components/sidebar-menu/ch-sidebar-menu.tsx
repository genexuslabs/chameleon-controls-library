import {
  Component,
  Element,
  Host,
  h,
  Prop,
  getAssetPath,
  State,
  Event,
  EventEmitter,
} from "@stencil/core";

@Component({
  tag: "ch-sidebar-menu",
  styleUrl: "ch-sidebar-menu.scss",
  shadow: true,
  assetsDirs: ["sidebar-menu-assets"],
})
export class ChSidebarMenu {
  @Event() itemClicked: EventEmitter;
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

  /*
   * The presence of this attribute allows the menu to have only one list open at the same time
   */
  @Prop() singleListOpen: boolean = false;

  /*******************
   * STATE
   *******************/
  @State() indicator: HTMLElement;

  componentWillLoad() {}

  componentDidLoad() {
    const titleHeight = this.title.offsetHeight;
    const footerHeight = this.footer.offsetHeight;
    const titleAndFooterHeight = titleHeight + footerHeight + "px";
    const collapsableItems = this.el.querySelectorAll(".collapsable");

    // const items = document.getElementsByClassName("item");

    /*Set main height*/
    this.main.style.height = `calc(100vh - ${titleAndFooterHeight})`;

    //SET INITAL ITEMS MAX HEIGHT
    const items = this.el.querySelectorAll(".item");
    Array.from((items as unknown) as HTMLCollectionOf<HTMLElement>).forEach(
      function (item) {
        const mainContainer = item.shadowRoot.querySelector(".main-container");
        item.style.maxHeight =
          (mainContainer as HTMLElement).offsetHeight + "px";
      }
    );

    /**************
    SET ACTIVE ITEM
    ***************/
    Array.from(items).forEach(
      function (item) {
        item.addEventListener(
          "click",
          function (e) {
            if (!this.menu.classList.contains("collapsed")) {
              //remove current active item class
              const currentActiveItem = document.querySelector(".item--active");
              if (currentActiveItem !== null) {
                currentActiveItem.classList.remove("item--active");
              }
              //set current item as active
              item.classList.add("item--active");

              //Emmit event from the selected item
            }
          }.bind(this)
        );
      }.bind(this)
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

    /*******************************
    SINGLE UL1 OPEN AT A TIME LOGIC  
    *******************************/
    //Only one list of type 1 can be open at the same time.
    //This is an optional parameter. Applies if 'data-single-ul1-open' attribute is present on #menu
    if (this.singleListOpen) {
      const collapsableListOneItems = document.querySelectorAll(
        ".list-one__item"
      );
      Array.from(collapsableListOneItems).forEach(
        function (item) {
          const mainContainer = item.shadowRoot.querySelector(
            ".main-container"
          );
          mainContainer.addEventListener(
            "click",
            function (e) {
              if (!this.menu.classList.contains("collapsed")) {
                const lastUl1Opened = document.querySelector(".lastUl1Opened");
                if (
                  lastUl1Opened !== null &&
                  !item.classList.contains("lastUl1Opened")
                ) {
                  const lastUl1OpenedMainContainer = lastUl1Opened.shadowRoot.querySelector(
                    ".main-container"
                  );
                  (lastUl1OpenedMainContainer as HTMLElement).click();
                }
                if (item.classList.contains("uncollapsed")) {
                  item.classList.add("lastUl1Opened");
                } else {
                  item.classList.remove("lastUl1Opened");
                }
              }
            }.bind(this)
          );
        }.bind(this)
      );
    }

    /*******************
    COLLAPSE MENU LOGIC
    *******************/
    this.collapseButton.addEventListener(
      "click",
      function () {
        let setTimeOutDelay = 0;
        if (this.menu.classList.contains("collapsed")) {
          //if menu is collapsed, the animation that shows the menu should be quicker
          this.menu.classList.add("collapse-faster");
          setTimeOutDelay = 300; //This value should be the same as the #menu.collapse-faster transition speed value.
        } else {
          this.menu.classList.remove("collapse-faster");
          setTimeOutDelay = 600; //This value should be the same as the #menu without .collapse-faster transition speed value.
        }
        this.menu.classList.add("collapsing");
        //hideIndicator();
        setTimeout(
          function () {
            if (this.menu.classList.contains("collapsed")) {
              this.uncollapseCollapsedLists();
              this.undoSwitchListOneOrder();
              this.menu.classList.remove("collapsed");
              setTimeout(
                function () {
                  this.repositionIndicatorAfterMenuUncollapse();
                }.bind(this),
                50
              );
            } else {
              this.collapseUncollapsedLists1();
              this.switchListOneOrder();
              this.menu.classList.add("collapsed");
              setTimeout(
                function () {
                  this.repositionIndicatorAfterMenuCollapse();
                }.bind(this),
                50
              );
            }
            this.menu.classList.remove("collapsing");
            setTimeout(function () {
              //showIndicator();
            }, 400);
          }.bind(this),
          setTimeOutDelay
        );
      }.bind(this)
    );

    /******************
    ITEMS TOOLTIP LOGIC
    *******************/
    var itemTooltip = document.createElement("DIV");
    itemTooltip.classList.add("tooltip");
    itemTooltip.style.zIndex = "0";
    this.menu.appendChild(itemTooltip);

    Array.from(items).forEach(
      function (item) {
        const mainContainer = item.shadowRoot.querySelector(".main-container");
        mainContainer.addEventListener(
          "mouseenter",
          function (event) {
            console.log("item", item.slot);
            if (this.menu.classList.contains("collapsed")) {
              itemTooltip.classList.add("visible");
              itemTooltip.innerHTML = item.childNodes[0].nodeValue;
              console.log(itemTooltip.innerHTML);
              const itemTopPosition = item.getBoundingClientRect().y;
              itemTooltip.style.top = itemTopPosition + "px";
            }
          }.bind(this)
        );
        mainContainer.addEventListener(
          "mouseleave",
          function (event) {
            if (this.menu.classList.contains("collapsed")) {
              itemTooltip.classList.remove("visible");
            }
          }.bind(this)
        );
      }.bind(this)
    );

    /**********************************
    LATERAL ACTIVE ITEM INDICATOR LOGIC
    ***********************************/
    this.indicator = document.createElement("DIV");
    this.indicator.setAttribute("id", "indicator");
    this.main.appendChild(this.indicator);

    Array.from(items).forEach(
      function (item) {
        item.addEventListener(
          "click",
          function (e) {
            e.stopPropagation();
            if (!this.menu.classList.contains("collapsed")) {
              const itemTopPosition = item.getBoundingClientRect().y;
              const itemHeight = item.shadowRoot.querySelector(
                ".main-container"
              ).offsetHeight;

              if (
                this.singleListOpen &&
                item.classList.contains("list-one__item")
              ) {
                let itemCopy = item;
                let totalHeight = titleHeight;
                while ((itemCopy = itemCopy.previousElementSibling) != null) {
                  const itemCopyMainContainer = itemCopy.shadowRoot.querySelector(
                    ".main-container"
                  );
                  totalHeight += itemCopyMainContainer.offsetHeight;
                }
                this.indicator.style.top = totalHeight + "px";
                this.indicator.style.height = itemHeight + "px";
              } else {
                this.indicator.style.top = itemTopPosition + "px";
                this.indicator.style.height = itemHeight + "px";
              }
            }
          }.bind(this)
        );
      }.bind(this)
    );

    //REPOSITION INDICATOR ON SCROLL
    var timer = null;
    this.main.addEventListener(
      "scroll",
      function (e) {
        //get reference to current active item
        const currentActiveItem = document.querySelector(".item--active");
        if (currentActiveItem !== null) {
          let currentActiveItemTopPosition = currentActiveItem.getBoundingClientRect()
            .y;
          this.indicator.classList.add("speed-zero");
          this.indicator.style.top = currentActiveItemTopPosition + "px";

          //detect when scrolling has stopped
          if (timer !== null) {
            clearTimeout(timer);
          }
          timer = setTimeout(
            function () {
              this.indicator.classList.remove("speed-zero");
            }.bind(this),
            50
          );
        }
      }.bind(this)
    );
  } // End of ComponentDidLoad

  //REPOSITION INDICATOR AFTER MENU COLLAPSE
  repositionIndicatorAfterMenuCollapse() {
    const activeItem = this.el.querySelector(".item--active");
    if (activeItem !== null) {
      const closestL1 = activeItem.closest(".list-one__item");
      if (closestL1 !== null) {
        const closestL1MainContainer = closestL1.shadowRoot.querySelector(
          ".main-container"
        );
        const topPosition = closestL1MainContainer.getBoundingClientRect().y;
        const height = (closestL1MainContainer as HTMLElement).offsetHeight;
        this.indicator.style.top = topPosition + "px";
        this.indicator.style.height = height + "px";
      } else {
        //else, the active item has no parent l ist. just reposition indicator
        const topPosition = activeItem.getBoundingClientRect().y;
        const height = (activeItem as HTMLElement).offsetHeight;
        this.indicator.style.top = topPosition + "px";
        this.indicator.style.height = height + "px";
      }
    }
  }
  //REPOSITION INDICATOR AFTER MENU UNCOLLAPSE
  repositionIndicatorAfterMenuUncollapse() {
    const activeItem = this.el.querySelector(".item--active");
    const activeItemMainContainer = activeItem.shadowRoot.querySelector(
      ".main-container"
    );
    const activeItemMainContainerTopPosition = activeItemMainContainer.getBoundingClientRect()
      .y;
    const activeItemMainContainerHeight = (activeItemMainContainer as HTMLElement)
      .offsetHeight;
    this.indicator.style.top = activeItemMainContainerTopPosition + "px";
    this.indicator.style.height = activeItemMainContainerHeight + "px";
  }

  collapseUncollapsedLists1() {
    let uncollapsedLists1Items = document.querySelectorAll(
      ".list-one__item.uncollapsed"
    );
    Array.from(uncollapsedLists1Items).forEach(function (item) {
      item.classList.add("speed-zero");
      item.setAttribute(
        "data-uncollapsed-max-height",
        (item as HTMLElement).style.maxHeight
      );
      (item as HTMLElement).style.maxHeight =
        item.shadowRoot.querySelector<HTMLElement>(".main-container")
          .offsetHeight + "px";
    });
  }
  uncollapseCollapsedLists() {
    let uncollapsedLists1Items = document.querySelectorAll(
      ".list-one__item.uncollapsed"
    );
    Array.from(uncollapsedLists1Items).forEach(function (item) {
      item.addEventListener("transitionend", removeSpeedZero);
      function removeSpeedZero(e) {
        if (e.propertyName === "max-height") {
          item.classList.remove("speed-zero");
          item.removeEventListener("transitionend", removeSpeedZero);
        }
      }
      const uncollapsedMaxHeight = item.getAttribute(
        "data-uncollapsed-max-height"
      );
      (item as HTMLElement).style.maxHeight = uncollapsedMaxHeight;
      item.removeAttribute("data-uncollapsed-max-height");
    });
  }
  switchListOneOrder() {
    let listOneItems = document.querySelectorAll(".list-one__item");
    Array.from(listOneItems).forEach(function (item) {
      item.classList.add("switch-order");
    });
  }
  undoSwitchListOneOrder() {
    let listOneItems = document.querySelectorAll(".list-one__item");
    Array.from(listOneItems).forEach(function (item) {
      item.classList.remove("switch-order");
    });
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
