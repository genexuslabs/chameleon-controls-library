import type { ArgumentTypes } from "../../typings/types";
import { disableAccessibilityReports } from "../../utilities/analysis/reports";
import { testAccessibleNameWithElementInternals } from "../implementation/accessible-name-and-label-variants";

disableAccessibilityReports();

const testConfiguration = {
  "ch-checkbox": ["ch-checkbox", "input"],

  // "ch-progress": ["ch-progress", "input"],

  "ch-slider": ["ch-slider", "input"]
} satisfies {
  [key in "ch-checkbox" | "ch-slider"]: ArgumentTypes<
    typeof testAccessibleNameWithElementInternals<key>
  >;
};

Object.values(testConfiguration).forEach(testConfig =>
  testAccessibleNameWithElementInternals(testConfig[0], testConfig[1])
);
