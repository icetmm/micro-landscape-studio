import { describe, expect, it } from "vitest";

import { decodeSharePayload, encodeSharePayload } from "../lib/utils/share";

describe("share payload helpers", () => {
  it("encodes and decodes a project snapshot", () => {
    const payload = {
      title: "Spring Awakening Copy",
      templateSeason: "spring" as const,
      container: "jar" as const,
      themeMode: "light" as const,
      items: [
        {
          id: "item-1",
          assetId: "flora-blossom-tree",
          name: "樱树",
          kind: "tree" as const,
          category: "flora" as const,
          color: "#f3bfd2",
          accent: "#66494c",
          scale: 1,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
        },
      ],
    };

    const token = encodeSharePayload(payload);
    const decoded = decodeSharePayload(token);

    expect(decoded).toEqual(payload);
  });

  it("returns null for an invalid token", () => {
    expect(decodeSharePayload("not-a-valid-token")).toBeNull();
  });
});
