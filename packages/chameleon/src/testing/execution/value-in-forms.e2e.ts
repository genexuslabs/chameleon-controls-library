import "../../components/radio-group/radio-group-render.lit";
import "../../components/slider/slider.lit";
import type { ArgumentTypes } from "../../typings/types";
import { disableAccessibilityReports } from "../../utilities/analysis/reports";
import {
  testValueInForms,
  type ComponentsWithValueProperty
} from "../implementation/value-in-forms";

disableAccessibilityReports();

const testConfiguration = {
  // TODO: Add support to customize the ch-checkbox cases
  "ch-checkbox": [
    "ch-checkbox",
    [
      {
        initialInterfaceValue: "on",
        initialExpectedValue: "on",
        runtimeInterfaceValue: "something",
        runtimeExpectedValue: "something"
      }
    ],
    "input"
  ],

  "ch-slider": [
    "ch-slider",
    [
      {
        initialInterfaceValue: 0,
        initialExpectedValue: 0,
        runtimeInterfaceValue: 3,
        runtimeExpectedValue: 3
      },
      {
        initialInterfaceValue: 3,
        initialExpectedValue: 3,
        runtimeInterfaceValue: 5,
        runtimeExpectedValue: 5
      },
      {
        initialInterfaceValue: 5,
        initialExpectedValue: 5,
        runtimeInterfaceValue: 10,
        runtimeExpectedValue: 5
      },
      {
        initialInterfaceValue: 10,
        initialExpectedValue: 5,
        runtimeInterfaceValue: -1,
        runtimeExpectedValue: 0
      },
      {
        initialInterfaceValue: -1,
        initialExpectedValue: 0,
        runtimeInterfaceValue: -5,
        runtimeExpectedValue: 0
      },
      {
        initialInterfaceValue: -5,
        initialExpectedValue: 0,
        runtimeInterfaceValue: -5,
        runtimeExpectedValue: 0
      },
      {
        initialInterfaceValue: -10,
        initialExpectedValue: 0,
        runtimeInterfaceValue: 0,
        runtimeExpectedValue: 0
      }
    ],
    "input"
  ],

  "ch-progress": ["ch-progress", [], undefined],
  "ch-radio-group-render": ["ch-radio-group-render", [], undefined]
} satisfies {
  [key in ComponentsWithValueProperty]: ArgumentTypes<
    typeof testValueInForms<key>
  >;
};

Object.values(testConfiguration).forEach(testConfig =>
  testValueInForms(testConfig[0], testConfig[1], testConfig[2])
);

