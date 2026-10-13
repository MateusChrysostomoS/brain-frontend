// TASK-056 review F2: the reset token must not outlive the flow. Whoever leaves the
// new-password step (back to /login or to step 1/2) must not be able to come back with
// the browser's Back button and use the token still in module memory. There is no DOM
// in this repo's tests, so the contract is pinned at the source: each of these screens
// forgets the token as it mounts.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const screens = [
  "esqueci_senha/page.tsx",
  "esqueci_senha/codigo/page.tsx",
  "login/page.tsx",
];

describe("reset token lifetime", () => {
  it.each(screens)("%s forgets the reset token when it mounts", (file) => {
    const source = readFileSync(path.join(__dirname, "..", file), "utf8");
    expect(source).toMatch(/useEffect\(\(\) => \{\s*forgetResetToken\(\);/);
  });

  it("the new-password step does not clear on unmount (StrictMode would wipe it)", () => {
    const source = readFileSync(path.join(__dirname, "..", "esqueci_senha/atualizar_senha/page.tsx"), "utf8");
    expect(source).not.toMatch(/return \(\) => (clearResetFlow|forgetResetToken)/);
  });
});
