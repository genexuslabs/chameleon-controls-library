import { storiesOf } from "@storybook/html";
import notes from "./readme.md";
import {
  withKnobs,
  text,
  boolean,
  number,
  select,
  radios,
  color,
} from "@storybook/addon-knobs";

const stories = storiesOf("Components", module);
stories.addDecorator(withKnobs);
stories.addParameters({ layout: "centered" });
stories.add(
  "Sidebar menu",
  () => {
    //Single list open
    const labelSingleListOpen = "Single list open at a time";
    const defaultValueSingleListOpen = false;
    const valueSingleListOpem = boolean(
      labelSingleListOpen,
      defaultValueSingleListOpen
    );
    function singleListOpen() {
      if (valueSingleListOpem) {
        return "single-list-open";
      }
    }

    return `
    <style>
      #selected-menu-item {
        position: fixed;
        left: calc(50% + 120px);
        top: 50%;
        font-family: arial;
        opacity: 1;
        transition: 0.25s opacity;
        transform: translateX(-50%);
        font-size: 20px;
      }
      #selected-menu-item.hidden {
        opacity: 0;
      }
    </style>
    
    <span id="selected-menu-item">Press <code>ctrl + R</code> and select any item</span>
    
    <ch-sidebar-menu style="--item-hover-color:green; --item-active-color: violet" menu-title="${text(
      "Menu title",
      "Foods"
    )}" ${singleListOpen()} id="ch-sidebar-menu">
    <ch-sidebar-menu-list>
      <ch-sidebar-menu-list-item id="meats">
        Meats
        <ch-sidebar-menu-list slot="list">
          <ch-sidebar-menu-list-item id="red">
            Red
            <ch-sidebar-menu-list slot="list">
              <ch-sidebar-menu-list-item id="cow">
                Cow
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="veal">
                Veal
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="pig">
                Pig
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="bull">
                Bull
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="ox">
                Ox
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="duck">
                Duck
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="goose">
                Goose
              </ch-sidebar-menu-list-item>
            </ch-sidebar-menu-list>
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="white">
            White
            <ch-sidebar-menu-list slot="list">
              <ch-sidebar-menu-list-item id="chicken">
                Chicken
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="turkey">
                Turkey
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="rabbit">
                Rabbit
              </ch-sidebar-menu-list-item>
            </ch-sidebar-menu-list>
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="fish">
            Fish
            <ch-sidebar-menu-list slot="list">
            <ch-sidebar-menu-list-item id="hake">
              Hake
            </ch-sidebar-menu-list-item>
            <ch-sidebar-menu-list-item id="rooster">
              Rooster
            </ch-sidebar-menu-list-item>
            <ch-sidebar-menu-list-item id="cod">
              Cod
            </ch-sidebar-menu-list-item>
            <ch-sidebar-menu-list-item id="turbot">
              Turbot
            </ch-sidebar-menu-list-item>
            <ch-sidebar-menu-list-item id="sole">
              Sole
            </ch-sidebar-menu-list-item>
            <ch-sidebar-menu-list-item id="bass">
              Bass
            </ch-sidebar-menu-list-item>
            </ch-sidebar-menu-list>
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="other-meats">
            other meats
          </ch-sidebar-menu-list-item>
        </ch-sidebar-menu-list>
      </ch-sidebar-menu-list-item>
      
      <ch-sidebar-menu-list-item id="vegetables">
        Vegetables
        <ch-sidebar-menu-list slot="list">
          <ch-sidebar-menu-list-item id="leaf">
            Leaf
            <ch-sidebar-menu-list slot="list">
              <ch-sidebar-menu-list-item id="chard">
                Chard
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="celery">
                Celery
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="cole">
                Cole
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="endive">
                Endive
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="spinach">
                Spinach
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="lettuce">
                Lettuce
              </ch-sidebar-menu-list-item>
            </ch-sidebar-menu-list>
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="stem">
            Stem
            <ch-sidebar-menu-list slot="list">
              <ch-sidebar-menu-list-item id="thistle">
                Thistle
              </ch-sidebar-menu-list-item >
              <ch-sidebar-menu-list-item id="asparagus">
                asparagus
              </ch-sidebar-menu-list-item>
            </ch-sidebar-menu-list>
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="inflorescences">
            Inflorescences
            <ch-sidebar-menu-list slot="list">
              <ch-sidebar-menu-list-item id="cauliflower">
                Cauliflower
              </ch-sidebar-menu-list-item >
              <ch-sidebar-menu-list-item id="broccoli">
                Broccoli
              </ch-sidebar-menu-list-item>
            </ch-sidebar-menu-list>
          </ch-sidebar-menu-list-item>
        </ch-sidebar-menu-list>
      </ch-sidebar-menu-list-item>


      <ch-sidebar-menu-list-item id="fruits">
        Fruits
        <ch-sidebar-menu-list slot="list">
          <ch-sidebar-menu-list-item id="apple">
            Apple
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="banana">
            Banana
            <ch-sidebar-menu-list slot="list">
              <ch-sidebar-menu-list-item id="apple-banana">
                Apple banana
              </ch-sidebar-menu-list-item >
              <ch-sidebar-menu-list-item id="cavendish">
                Cavendish
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="lady-finger">
                Lady's Finger
              </ch-sidebar-menu-list-item >
              <ch-sidebar-menu-list-item id="pisang-raja">
                Pisang Raja
              </ch-sidebar-menu-list-item>
            </ch-sidebar-menu-list>
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="orange">
            orange
            <ch-sidebar-menu-list slot="list">
              <ch-sidebar-menu-list-item id="navbel">
                Navbel
              </ch-sidebar-menu-list-item >
              <ch-sidebar-menu-list-item id="seville">
                Seville
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="valencia">
                Valencia
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="mandarin">
                Mandarin
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="tangelo">
                Tangelo
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="clementine">
                Clementine
              </ch-sidebar-menu-list-item>
            </ch-sidebar-menu-list>
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="kiwi">
            Kiwi
            <ch-sidebar-menu-list slot="list">
              <ch-sidebar-menu-list-item id="hardy">
                Hardy
              </ch-sidebar-menu-list-item >
              <ch-sidebar-menu-list-item id="fuzzy">
                Fuzzy
              </ch-sidebar-menu-list-item>
              <ch-sidebar-menu-list-item id="artic">
                Artic
              </ch-sidebar-menu-list-item>
            </ch-sidebar-menu-list>
          </ch-sidebar-menu-list-item>
        </ch-sidebar-menu-list>
      </ch-sidebar-menu-list-item>


      <ch-sidebar-menu-list-item id="condiments">
        Condiments
        <ch-sidebar-menu-list slot="list">
          <ch-sidebar-menu-list-item id="mayonnaise">
            Mayonnaise
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="soy-sauce">
            Soy sauce
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="relish">
            Relish
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="tabasco">
            Tabasco
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="mustard">
            Mustard
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="gochujang">
            Gochujang
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="fish-sauce">
            Fish sauce
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="ketchup">
            Ketchup
          </ch-sidebar-menu-list-item>
          <ch-sidebar-menu-list-item id="wasabi">
            Wasabi
          </ch-sidebar-menu-list-item>
        </ch-sidebar-menu-list>
      </ch-sidebar-menu-list-item>
    </ch-sidebar-menu-list>
    <div slot="footer">put somehting usefull on the footer</div>
  </ch-sidebar-menu>
  
  <script>
  const selectedMenuItem = document.getElementById('selected-menu-item');
  const sidebarMenu = document.getElementById('ch-sidebar-menu');
  sidebarMenu.addEventListener('itemClickedEvent', function(e){
    selectedMenuItem.classList.add('hidden');
    setTimeout(function(){
      selectedMenuItem.innerHTML = e.detail['item-id'];
      selectedMenuItem.classList.remove('hidden');
    }, 250);
  })
  </script>
  `;
  },
  { notes }
);
