import "../../components/radio-group/radio-group-render.lit";
import "../../components/slider/slider.lit";
import type { ArgumentTypes } from "../../typings/types";
import { disableAccessibilityReports } from "../../utilities/analysis/reports";
import {
  testDisabledReflect,
  type ComponentsWithDisabledProperty
} from "../implementation/reflect-disabled";

disableAccessibilityReports();

const testConfiguration = {
  "ch-slider": ["ch-slider", "input"],

  "ch-radio-group-render": ["ch-radio-group-render", undefined]
} satisfies {
  [key in ComponentsWithDisabledProperty]: ArgumentTypes<
    typeof testDisabledReflect<key>
  >;
};

Object.values(testConfiguration).forEach(testConfig =>
  testDisabledReflect(testConfig[0], testConfig[1])
);

//   it.todo("should not fire the input event if disabled");

//   it.todo("should not fire the change event if disabled");

//   it.todo("should not be focusable if disabled");

