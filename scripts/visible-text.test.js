import { describe, expect, it } from "vitest";

import { visibleText } from "./visible-text.js";

describe("visibleText", () => {
  it("keeps what renders and drops scripts, styles and the head", () => {
    const html = '<html><head><title>T</title></head><body><h1>Shop</h1><script>var a = "<b>x</b>"</script><style>p{}</style><p>Mascara &amp; more</p></body></html>';
    expect(visibleText(html)).toBe("Shop Mascara & more");
  });

  it("drops streamed content still waiting in a hidden element", () => {
    const html = '<main><div hidden id="S:0"><ul><li>Mascara</li></ul></div><template id="B:0"></template><p>Loading</p></main>';
    expect(visibleText(html)).toBe("Loading");
  });

  it("does not stop at void or self-closing tags", () => {
    expect(visibleText('<p>One<br>Two<img src="a.png" /><input hidden>Three</p>')).toBe("One Two Three");
  });

  it("reads the hidden attribute itself, not the word in a class", () => {
    const html = '<div class="a hidden b" data-x="hidden">Shown</div><div data-state="open" hidden>Not</div><p HIDDEN="">No</p>';
    expect(visibleText(html)).toBe("Shown");
  });

  it("decodes entities", () => {
    expect(visibleText("<p>&lt;Tom &amp; Jerry&gt; &#39;s &#x27;x&#x27; &quot;q&quot; &#8211;</p>")).toBe("<Tom & Jerry> 's 'x' \"q\" –");
  });
});
