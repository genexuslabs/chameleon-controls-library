import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const accessibleRoles: HTMLChTextblockElement["accessibleRole"][] = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p"
];

const formats: HTMLChTextblockElement["format"][] = ["text", "HTML"];

describe("[ch-textblock][accessibility]", () => {
  let page: E2EPage;
  let textblockRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-textblock></ch-textblock>`,
      failOnConsoleError: true
    });
    textblockRef = await page.find("ch-textblock");
  });

  it('should have role="paragraph" by default', () =>
    expect(textblockRef.getAttribute("role")).toBe("paragraph"));

  const testRoleByAccessibleRole = (
    accessibleRole: HTMLChTextblockElement["accessibleRole"],
    format: HTMLChTextblockElement["format"]
  ) =>
    it(`[accessibleRole = "${accessibleRole}"][format = "${format}"] should properly set the roles and aria attributes`, async () => {
      textblockRef.setProperty("accessibleRole", accessibleRole);
      textblockRef.setProperty("format", format);
      await page.waitForChanges();
      textblockRef = await page.find("ch-textblock"); // Refresh the reference

      if (accessibleRole === "p") {
        expect(textblockRef.getAttribute("role")).toBe("paragraph");
        expect(textblockRef.getAttribute("aria-level")).toBeNull();
      } else {
        expect(textblockRef.getAttribute("role")).toBe("heading");
        expect(textblockRef.getAttribute("aria-level")).toBe(accessibleRole[1]);
      }
    });

  const testNotRenderAnySemanticElementDependingOnAccessibleRole = (
    accessibleRole: HTMLChTextblockElement["accessibleRole"],
    format: HTMLChTextblockElement["format"]
  ) =>
    it(`[accessibleRole = "${accessibleRole}"][format = "${format}"] should not render any semantic element, since the semantic is set on the ch-textblock tag`, async () => {
      textblockRef.setProperty("accessibleRole", accessibleRole);
      await page.waitForChanges();
      const semanticTag = await page.find(
        `ch-textblock >>> :where(h1, h2, h3, h4, h5, h6, p)`
      );

      expect(semanticTag).toBeFalsy();
    });

  accessibleRoles.forEach(accessibleRole =>
    formats.forEach(format => testRoleByAccessibleRole(accessibleRole, format))
  );
  accessibleRoles.forEach(accessibleRole =>
    formats.forEach(format =>
      testNotRenderAnySemanticElementDependingOnAccessibleRole(
        accessibleRole,
        format
      )
    )
  );
});
