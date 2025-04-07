/* eslint-disable @stencil-community/own-methods-must-be-private */
/* eslint-disable @stencil-community/required-jsdoc */
import {
  Component,
  Element,
  Host,
  h,
  Prop,
  State,
  Event,
  EventEmitter
} from "@stencil/core";

import * as StorageHelper from "../../helpers/storage-helper";
import { ClickOutside } from "stencil-click-outside";

@Component({
  tag: "ch-sidebar-menu",
  styleUrl: "ch-sidebar-menu.scss",
  shadow: true,
  assetsDirs: ["sidebar-menu-assets"]
})
export class ChSidebarMenu {
  @Event() itemClicked: EventEmitter;
  @Event() collapseBtnClicked: EventEmitter;

  @Element() el: HTMLChSidebarMenuElement;

  private topHeightSpeed = 300;
  private speedDivisionValue = 400;

  /** *****************
   * REFERENCES
   *******************/
  main!: HTMLElement;
  menu!: HTMLElement;
  title!: HTMLElement;
  footer!: HTMLElement;
  collapseButton!: HTMLElement;

  /** *****************
   * PROPS
   *******************/

  /**
   * The menu title
   */
  @Prop() readonly menuTitle: string;

  /**
   * The presence of this attribute allows the menu to have only one list opened at the same time
   */
  @Prop() readonly singleListOpen: boolean = false;

  /**
   * Allows to set the distance to the top of the page on the menu
   */
  @Prop() readonly distanceToTop: number = 0;

  /**
   * Determines if the menu can be collapsed
   */
  @Prop() readonly collapsible: boolean = true;

  /**
   * The initial active item (optional)
   */
  @Prop() readonly activeItemId: string = "";

  /**
   * The active item
   */
  @Prop({ mutable: true }) activeItem = "";

  /**
   * Determines if the menu is collapsed
   */
  @Prop({ reflect: true, mutable: true }) isCollapsed: boolean;

  /** *****************
   * STATE
   *******************/
  @State() indicator: HTMLElement;

  componentDidLoad() {
    // hide menu in mobile view
    if (window.matchMedia("(max-width: 767px)").matches) {
      this.menu.classList.add("hidden-xs");
    }
    window
      .matchMedia("(max-width: 767px)")
      .addEventListener("change", this.handleMatchMedia.bind(this));

    // get sidebar status from storage
    this.getSidebarState();

    const titleHeight = this.title.offsetHeight;
    const footerHeight = this.footer.offsetHeight;
    const titleAndFooterHeight = titleHeight + footerHeight + "px";
    const collapsableItems = this.el.querySelectorAll(".collapsable");

    /* Set menu top position*/
    const topDistance = this.distanceToTop.toString() + "px";
    this.menu.style.top = topDistance;

    /* Set main height*/
    this.main.style.height = `calc(100vh - ${titleAndFooterHeight} - ${topDistance})`;

    // SET INITAL ITEMS MAX HEIGHT
    const items = this.el.querySelectorAll(".item");
    Array.from(items as unknown as HTMLCollectionOf<HTMLElement>).forEach(
      function (item) {
        const mainContainer = item.shadowRoot.querySelector(".main-container");
        item.style.maxHeight =
          (mainContainer as HTMLElement).offsetHeight + "px";
      }
    );
    // AFTER INITIAL ITEMS MAX HEIGHT HAS BEEN DEFINED, REDEFINE MAX HEIGHT FOR THE UNCOLLAPSED ITEMS
    const uncollapsedItems = this.el.querySelectorAll(".item.uncollapsed");
    const uncollapsedItemsArr = Array.prototype.slice
      .call(uncollapsedItems)
      .reverse();

    uncollapsedItemsArr.forEach(function (item) {
      // mainContainer height
      const mainContainerHeight =
        item.shadowRoot.querySelector(".main-container").offsetHeight;
      // menu list height
      const menuList = item.querySelector(":scope > ch-sidebar-menu-list");
      if (menuList) {
        const menuListHeight = (menuList as HTMLElement).offsetHeight;
        item.style.maxHeight = mainContainerHeight + menuListHeight + "px";
      }
    });

    /** ********************************
    LATERAL ACTIVE ITEM INDICATOR LOGIC
    ***********************************/
    this.indicator = document.createElement("DIV");
    this.indicator.setAttribute("id", "indicator");
    this.main.appendChild(this.indicator);

    // when active-item is loaded from session, recalculate indicator position
    this.repositionIndicatorAfterMenuUncollapse();

    Array.from(items).forEach(
      function (item) {
        item.addEventListener(
          "click",
          function (e) {
            e.stopPropagation();
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            if (!this.menu.classList.contains("collapsed")) {
              const itemTopPosition = item.getBoundingClientRect().y;
              const itemHeight =
                item.shadowRoot.querySelector(".main-container").offsetHeight;

              if (
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.singleListOpen &&
                item.classList.contains("list-one__item")
              ) {
                let itemCopy = item;
                let totalHeight = titleHeight;
                while ((itemCopy = itemCopy.previousElementSibling) != null) {
                  const itemCopyMainContainer =
                    itemCopy.shadowRoot.querySelector(".main-container");
                  totalHeight += itemCopyMainContainer.offsetHeight;
                }
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.indicator.style.top = totalHeight + "px";
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.indicator.style.height = itemHeight + "px";
              } else {
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.indicator.style.top = itemTopPosition + "px";
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.indicator.style.height = itemHeight + "px";
              }
            }
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
          }.bind(this)
        );
      }.bind(this)
    );

    /** *******************
    SET ACTIVE ITEM LOGIC
    **********************/
    Array.from(items).forEach(
      function (item) {
        item.addEventListener(
          "click",
          function (e) {
            e.stopPropagation();
            // fede
            // if (!this.menu.classList.contains("collapsed")) {
            // remove current active item class
            const currentActiveItem = document.querySelector(".item--active");
            if (currentActiveItem !== null) {
              currentActiveItem.classList.remove("item--active");
            }
            // set current item as active
            item.classList.add("item--active");

            // fede
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.GetCurrentItemIndicatorPos();

            // store the active item on the sessionStorage
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.storeSidebarActiveItem(item);
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.activeItem = item.id;
            // }
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
          }.bind(this)
        );
      }.bind(this)
    );
    // SET ACTIVE CURRENT ACTIVE ITEM IF PRESENT
    // if (this.activeItemId !== "") {
    if (this.activeItemId !== "" && !this.activeItem) {
      const activeItem = this.el.querySelector("#" + this.activeItemId);
      activeItem.classList.add("item--active");

      // uncollapse item's parent if exists
      let parentEl = activeItem.parentElement;
      if (parentEl.hasAttribute("slot")) {
        parentEl = parentEl.parentElement;
        this.uncollapseList(parentEl);
        parentEl.classList.add("uncollapsed");
        let grandpaEl = parentEl.parentElement;
        if (grandpaEl.hasAttribute("slot")) {
          grandpaEl = grandpaEl.parentElement;
          this.uncollapseList(grandpaEl);
          grandpaEl.classList.add("uncollapsed");
        }
      }
      // indicator
      // let indicator = this.el.shadowRoot.querySelector("#indicator");
      const activeItemTopPosition = activeItem.getBoundingClientRect().y;
      const activeItemHeight =
        activeItem.shadowRoot.querySelector<HTMLElement>(
          ".main-container"
        ).offsetHeight;
      this.indicator.style.top = activeItemTopPosition + "px";
      this.indicator.style.height = activeItemHeight + "px";
    }

    /** **************************
    COLLAPSABLE LIST ITEMS LOGIC
    ****************************/
    Array.from(collapsableItems).forEach(
      function (item) {
        const mainContainer = item.shadowRoot.querySelector(".main-container");
        mainContainer.addEventListener(
          "click",
          function () {
            if (
              item.classList.contains("list-one__item") &&
              // @ts-expect-error: This control is deprecated, so we are avoiding this error
              this.menu.classList.contains("collapsed")
            ) {
              // If item clicked is type 1, and menu is collapsed, just uncollapse the menu.
              // @ts-expect-error: This control is deprecated, so we are avoiding this error
              this.collapseButton.click();
            } else {
              // @ts-expect-error: This control is deprecated, so we are avoiding this error
              this.toggleIcon(item); // This function has to be before  uncollapseList or collapseList.
              // @ts-expect-error: This control is deprecated, so we are avoiding this error
              this.setTransitionSpeed(item);
              if (item.classList.contains("uncollapsed")) {
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.uncollapseList(item);
              } else {
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.collapseList(item);
              }
              // If this item is type 2, then update list 1 transition speed and maxheight
              if (item.classList.contains("list-two__item")) {
                const parentItem1 = item.closest(".list-one__item");
                const heightToTransition =
                  item.querySelector(".list-three").offsetHeight;
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.updateListItem1TransitionSpeed(
                  parentItem1,
                  heightToTransition
                );
                // Update list 1 max. height
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.updateListItem1MaxHeight(parentItem1);
              }
            }
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
          }.bind(this)
        );
      }.bind(this)
    );

    /** *****************************
    SINGLE UL1 OPEN AT A TIME LOGIC  
    *******************************/
    // Only one list of type 1 can be open at the same time.
    // This is an optional parameter. Applies if 'data-single-ul1-open' attribute is present on #menu
    if (this.singleListOpen) {
      const collapsableListOneItems =
        document.querySelectorAll(".list-one__item");
      Array.from(collapsableListOneItems).forEach(
        function (item) {
          const mainContainer =
            item.shadowRoot.querySelector(".main-container");
          mainContainer.addEventListener(
            "click",
            function () {
              // @ts-expect-error: This control is deprecated, so we are avoiding this error
              if (!this.menu.classList.contains("collapsed")) {
                const lastUl1Opened = document.querySelector(".lastUl1Opened");
                if (
                  lastUl1Opened !== null &&
                  !item.classList.contains("lastUl1Opened")
                ) {
                  const lastUl1OpenedMainContainer =
                    lastUl1Opened.shadowRoot.querySelector(".main-container");
                  (lastUl1OpenedMainContainer as HTMLElement).click();
                }
                if (item.classList.contains("uncollapsed")) {
                  item.classList.add("lastUl1Opened");
                } else {
                  item.classList.remove("lastUl1Opened");
                }
              }
              // @ts-expect-error: This control is deprecated, so we are avoiding this error
            }.bind(this)
          );
        }.bind(this)
      );
    }

    /** *****************
    COLLAPSE MENU LOGIC
    *******************/
    if (this.collapsible) {
      this.collapseButton.addEventListener(
        "click",
        function () {
          let setTimeOutDelay = 0;
          // @ts-expect-error: This control is deprecated, so we are avoiding this error
          if (this.menu.classList.contains("collapsed")) {
            // if menu is collapsed, the animation that shows the menu should be quicker
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.menu.classList.add("collapse-faster");
            setTimeOutDelay = 300; // This value should be the same as the #menu.collapse-faster transition speed value.
          } else {
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.menu.classList.remove("collapse-faster");
            setTimeOutDelay = 600; // This value should be the same as the #menu without .collapse-faster transition speed value.
          }
          // @ts-expect-error: This control is deprecated, so we are avoiding this error
          this.menu.classList.add("collapsing");
          // @ts-expect-error: This control is deprecated, so we are avoiding this error
          this.hideIndicator();
          setTimeout(
            function () {
              // @ts-expect-error: This control is deprecated, so we are avoiding this error
              if (this.menu.classList.contains("collapsed")) {
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.uncollapseCollapsedLists();
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.undoSwitchListOneOrder();
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.menu.classList.remove("collapsed");
                setTimeout(
                  function () {
                    // @ts-expect-error: This control is deprecated, so we are avoiding this error
                    this.repositionIndicatorAfterMenuUncollapse();
                    // @ts-expect-error: This control is deprecated, so we are avoiding this error
                  }.bind(this),
                  50
                );
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.isCollapsed = false;
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.collapseMenuHandler();
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.storeSidebarState();
              } else {
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.collapseUncollapsedLists1();
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.switchListOneOrder();
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.menu.classList.add("collapsed");
                setTimeout(
                  function () {
                    // @ts-expect-error: This control is deprecated, so we are avoiding this error
                    this.repositionIndicatorAfterMenuCollapse();
                    // @ts-expect-error: This control is deprecated, so we are avoiding this error
                  }.bind(this),
                  50
                );
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.isCollapsed = true;
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.collapseMenuHandler();
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.storeSidebarState();
              }
              // @ts-expect-error: This control is deprecated, so we are avoiding this error
              this.menu.classList.remove("collapsing");
              setTimeout(
                function () {
                  // @ts-expect-error: This control is deprecated, so we are avoiding this error
                  this.showIndicator();
                  // @ts-expect-error: This control is deprecated, so we are avoiding this error
                }.bind(this),
                400
              );
              // @ts-expect-error: This control is deprecated, so we are avoiding this error
            }.bind(this),
            setTimeOutDelay
          );
        }.bind(this)
      );
    }

    this.getSidebarCollapsedState();

    /** ****************
    ITEMS TOOLTIP LOGIC
    *******************/
    const itemTooltip = document.createElement("DIV");
    itemTooltip.classList.add("tooltip");
    itemTooltip.style.zIndex = "0";
    this.menu.appendChild(itemTooltip);

    Array.from(items).forEach(
      function (item) {
        const mainContainer = item.shadowRoot.querySelector(".main-container");
        mainContainer.addEventListener(
          "mouseenter",
          function () {
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            if (this.menu.classList.contains("collapsed")) {
              itemTooltip.classList.add("visible");
              itemTooltip.innerHTML = item.childNodes[0].nodeValue;
              const itemTopPosition = item.getBoundingClientRect().y;
              itemTooltip.style.top = itemTopPosition + "px";
            }
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
          }.bind(this)
        );
        mainContainer.addEventListener(
          "mouseleave",
          function () {
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            if (this.menu.classList.contains("collapsed")) {
              itemTooltip.classList.remove("visible");
            }
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
          }.bind(this)
        );
      }.bind(this)
    );

    // REPOSITION INDICATOR ON SCROLL
    this.main.addEventListener(
      "scroll",
      function () {
        // @ts-expect-error: This control is deprecated, so we are avoiding this error
        this.GetCurrentItemIndicatorPos();
      }.bind(this)
    );

    // Calculation of menu top value and height on scroll
    let lastTop: number;
    document.addEventListener(
      "scroll",
      function () {
        const doc = document.documentElement;
        const top: any =
          (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        if (lastTop === undefined) {
          lastTop = 0;
        }
        // make menu.top a number
        // @ts-expect-error: This control is deprecated, so we are avoiding this error
        const menuTop = Number(this.menu.style.top.split("px")[0]);
        if (menuTop > 0) {
          if (menuTop - (top - lastTop) > 0) {
            const scrollTopValue: number = top - lastTop;
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.menu.style.top = menuTop - scrollTopValue + "px";
            lastTop = top;
            /* Set main height*/
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            const mainTop = this.distanceToTop - top;
            const topStr = mainTop + "px";
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.main.style.height = `calc(100vh - ${titleAndFooterHeight} - ${topStr})`;
            // reposition of active item indicator
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.GetCurrentItemIndicatorPos();
          } else {
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.menu.style.top = "0px";
            // reposition of active item indicator
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.GetCurrentItemIndicatorPos();
          }
        } else if (menuTop == 0) {
          // @ts-expect-error: This control is deprecated, so we are avoiding this error
          if (top <= this.distanceToTop) {
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.menu.style.top = this.distanceToTop - top + "px";
            lastTop = top;
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.main.style.height = `calc(100vh - ${titleAndFooterHeight} - ${top})`;
            // reposition of active item indicator
            // @ts-expect-error: This control is deprecated, so we are avoiding this error
            this.GetCurrentItemIndicatorPos();
          }
        }
      }.bind(this)
    );
  } // End of ComponentDidLoad

  handleMatchMedia(q) {
    if (q.matches) {
      this.menu.classList.add("hidden-xs");
    } else {
      this.menu.classList.remove("hidden-xs");
    }
  }

  @ClickOutside({ exclude: ".sidebar__toggle-ico" })
  closeSidebar() {
    // close the sidebar when user clicks outside of component area (only in mobile view - xs media screens).
    const screenSize = window.matchMedia("(max-width: 767px)");
    if (screenSize.matches) {
      // Viewport is less or equal to 767 pixels wide
      this.menu.className = "";
      this.menu.classList.add("hidden-xs");
    }
  }

  // get position of current active item
  GetCurrentItemIndicatorPos() {
    let timer = null;
    const currentActiveItem = document.querySelector(".item--active");
    if (currentActiveItem !== null) {
      const currentActiveItemTopPosition =
        currentActiveItem.getBoundingClientRect().y;
      this.indicator.classList.add("speed-zero");
      this.indicator.style.top = currentActiveItemTopPosition + "px";
      // detect when scrolling has stopped
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(
        function () {
          // @ts-expect-error: This control is deprecated, so we are avoiding this error
          this.indicator.classList.remove("speed-zero");
        }.bind(this),
        50
      );
    }
  }

  // REPOSITION INDICATOR AFTER MENU COLLAPSE
  repositionIndicatorAfterMenuCollapse() {
    const activeItem = this.el.querySelector(".item--active");
    if (activeItem !== null) {
      const closestL1 = activeItem.closest(".list-one__item");
      if (closestL1 !== null) {
        const closestL1MainContainer =
          closestL1.shadowRoot.querySelector(".main-container");
        const topPosition = closestL1MainContainer.getBoundingClientRect().y;
        const height = (closestL1MainContainer as HTMLElement).offsetHeight;
        this.indicator.style.top = topPosition + "px";
        this.indicator.style.height = height + "px";
      } else {
        // else, the active item has no parent l ist. just reposition indicator
        const topPosition = activeItem.getBoundingClientRect().y;
        const height = (activeItem as HTMLElement).offsetHeight;
        this.indicator.style.top = topPosition + "px";
        this.indicator.style.height = height + "px";
      }
    }
  }
  // REPOSITION INDICATOR AFTER MENU UNCOLLAPSE
  repositionIndicatorAfterMenuUncollapse() {
    const activeItem = this.el.querySelector(".item--active");
    if (activeItem !== null) {
      const activeItemMainContainer =
        activeItem.shadowRoot.querySelector(".main-container");
      const activeItemMainContainerTopPosition =
        activeItemMainContainer.getBoundingClientRect().y;
      const activeItemMainContainerHeight = (
        activeItemMainContainer as HTMLElement
      ).offsetHeight;
      this.indicator.style.top = activeItemMainContainerTopPosition + "px";
      this.indicator.style.height = activeItemMainContainerHeight + "px";
    }
  }

  // HIDE INDICATOR
  hideIndicator() {
    this.indicator.classList.add("hide");
  }
  // SHOW INDICATOR
  showIndicator() {
    this.indicator.classList.remove("hide");
  }

  collapseUncollapsedLists1() {
    const uncollapsedLists1Items = document.querySelectorAll(
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
    const uncollapsedLists1Items = document.querySelectorAll(
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
    const listOneItems = document.querySelectorAll(".list-one__item");
    Array.from(listOneItems).forEach(function (item) {
      item.classList.add("switch-order");
    });
  }
  undoSwitchListOneOrder() {
    const listOneItems = document.querySelectorAll(".list-one__item");
    Array.from(listOneItems).forEach(function (item) {
      item.classList.remove("switch-order");
    });
  }

  /* UPDATE LIST ITEM 1 TRANSITION SPEED*/
  updateListItem1TransitionSpeed(item, height) {
    if (height > this.topHeightSpeed) {
      height = this.topHeightSpeed;
    }
    item.style.transitionDuration = height / this.speedDivisionValue + "s";
  }

  /* UPDATE LIST ITEM 1 MAX HEIGHT*/
  updateListItem1MaxHeight(item) {
    const mainContainerHeight =
      item.shadowRoot.querySelector(".main-container").clientHeight;
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

  /* TOGGLE ITEM ICON*/
  toggleIcon(item) {
    if (item.classList.contains("uncollapsed")) {
      item.classList.remove("uncollapsed");
    } else {
      item.classList.add("uncollapsed");
    }
  }

  /* SET ITEM TRANSITION SPEED*/
  setTransitionSpeed(item) {
    let transitionSpeed = 0;
    const childListHeight = item.querySelector(
      "ch-sidebar-menu-list"
    ).clientHeight;
    if (childListHeight > this.topHeightSpeed) {
      transitionSpeed = this.topHeightSpeed;
    } else {
      transitionSpeed = childListHeight;
    }
    item.style.transitionDuration =
      transitionSpeed / this.speedDivisionValue + "s";
  }

  /* COLLAPSE LIST*/
  collapseList(item) {
    const mainContainerHeight =
      item.shadowRoot.querySelector(".main-container").offsetHeight;
    item.style.maxHeight = mainContainerHeight + "px";

    // store the item's collapsed state
    this.storeSidebarCollapsedItem(item);
  }
  /* UNCOLLAPSE LIST*/
  uncollapseList(item) {
    const mainContainerHeight =
      item.shadowRoot.querySelector(".main-container").clientHeight;
    const childListHeight = item.querySelector(
      "ch-sidebar-menu-list"
    ).clientHeight;
    item.style.maxHeight = mainContainerHeight + childListHeight + "px";

    // store the item's uncollapsed state
    this.storeSidebarUncollapsedItem(item);
  }

  /* PRESERVE SIDEBAR STATE */
  storeSidebarActiveItem(item) {
    const storageHelper = new StorageHelper.SessionStorageWorker();
    const sessionItemValue = storageHelper.get("active-item");
    if (sessionItemValue != "" && sessionItemValue != null) {
      storageHelper.remove("active-item");
    }
    storageHelper.add("active-item", item.id);
  }

  storeSidebarUncollapsedItem(item) {
    const storageHelper = new StorageHelper.SessionStorageWorker();
    if (!item.classList.contains("list-three__item")) {
      storageHelper.add(item.id, "uncollapsed");
    }
  }

  storeSidebarCollapsedItem(item) {
    const storageHelper = new StorageHelper.SessionStorageWorker();
    storageHelper.remove(item.id);
  }

  storeSidebarState() {
    const storageHelper = new StorageHelper.SessionStorageWorker();
    const storageItem = storageHelper.get("isCollapsed");
    if (storageItem === "false") {
      storageHelper.add("isCollapsed", "true");
    } else {
      storageHelper.add("isCollapsed", "false");
    }
  }

  /* GET SIDEBAR STATE*/
  getSidebarState() {
    const storageHelper = new StorageHelper.SessionStorageWorker();
    const storageItems = storageHelper.getAllItems();
    for (let i = 0; i < storageItems.length; i++) {
      let item;
      switch (true) {
        case storageItems[i].key === "active-item": {
          item = document.getElementById(storageItems[i].value);
          if (item) {
            item.classList.add("item--active");
            this.activeItem = item.id;
            // fede
            // const itemPos = item.offsetTop;
            /*
            this.main.scroll({
              top: 100, 
              left: 0,
              behavior: 'smooth'
            })*/
            this.main.scrollTop = 100;
          }
          break;
        }

        case storageItems[i].value === "uncollapsed": {
          item = document.getElementById(storageItems[i].key);
          if (item) {
            item.classList.add("uncollapsed");
          }
          break;
        }
      }
    }
  }

  getSidebarCollapsedState() {
    const storageHelper = new StorageHelper.SessionStorageWorker();
    const storageItems = storageHelper.getAllItems();
    for (let i = 0; i < storageItems.length; i++) {
      switch (true) {
        case storageItems[i].key === "isCollapsed": {
          if (storageItems[i].value === "true") {
            this.collapseUncollapsedLists1();
            this.switchListOneOrder();
            this.menu.classList.add("collapsed");
            setTimeout(
              function () {
                // @ts-expect-error: This control is deprecated, so we are avoiding this error
                this.repositionIndicatorAfterMenuCollapse();
              }.bind(this),
              50
            );
            this.isCollapsed = true;
            this.collapseMenuHandler();
          } else {
            this.isCollapsed = false;
          }
        }
      }
    }
  }

  // collapse menu button handler
  collapseMenuHandler() {
    this.collapseBtnClicked.emit({ isCollapsed: this.isCollapsed });
  }

  render() {
    return (
      <Host>
        <nav id="menu" part="menu" ref={el => (this.menu = el as HTMLElement)}>
          <h1 id="title" ref={el => (this.title = el as HTMLElement)}>
            {this.menuTitle}
          </h1>
          <main id="main" ref={el => (this.main = el as HTMLElement)}>
            <slot></slot>
          </main>
          <footer id="footer" ref={el => (this.footer = el as HTMLElement)}>
            <div id="custom-content">
              <slot name="footer" />
            </div>
            {this.collapsible && (
              <div
                id="collapse-menu"
                ref={el => (this.collapseButton = el as HTMLElement)}
              >
                <div part="collapse-menu-icon" class="collapse-icon"></div>
              </div>
            )}
          </footer>
        </nav>
      </Host>
    );
  }
}
