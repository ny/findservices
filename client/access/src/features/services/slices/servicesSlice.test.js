import "@testing-library/jest-dom/extend-expect";
import reduceServices, {
  selectRank,
  selectService,
  selectServices,
  selectRankedMatchingServiceKeys,
  selectRankedNoFormulaServiceKeys,
  updateServices,
} from "features/services/slices/servicesSlice";

describe("The services slice", () => {
  it("has an empty initial state", () => {
    expect(reduceServices(undefined, { type: undefined })).toEqual({});
  });

  describe("with initial state", () => {
    const data = { services: {} };
    it("selects empty rank list", () => {
      expect(selectRank(data)).toEqual([]);
    });

    it("selects empty services", () => {
      expect(selectServices(data)).toEqual({});
    });

    it("selects single service that doesn't exist", () => {
      expect(selectService(data, "SNAP")).toBeUndefined();
    });

    it("selects empty ranked matching services", () => {
      expect(selectRankedMatchingServiceKeys(data)).toEqual([]);
    });

    it("selects empty ranked no formula services", () => {
      expect(selectRankedNoFormulaServiceKeys(data)).toEqual([]);
    });
  });

  describe("with empty services", () => {
    const data = { services: { rank: [], services: {} } };
    it("selects empty rank list", () => {
      expect(selectRank(data)).toEqual([]);
    });

    it("selects empty services", () => {
      expect(selectServices(data)).toEqual({});
    });

    it("selects single service that doesn't exist", () => {
      expect(selectService(data, "SNAP")).toBeUndefined();
    });

    it("selects empty ranked matching services", () => {
      expect(selectRankedMatchingServiceKeys(data)).toEqual([]);
    });

    it("selects empty ranked no formula services", () => {
      expect(selectRankedNoFormulaServiceKeys(data)).toEqual([]);
    });
  });

  describe("with service data", () => {
    const serviceData = {
      serviceData: {
        services: {
          DOL_UA: {
            formula: "=NOT(IS_EMPLOYED)",
          },
          HEAP: {
            formula: "",
          },
          DOL_PUA: {
            formula: "",
          },
          EAF: {
            formula: "=IS_EMPLOYED",
          },
          EAA: {
            formula: "=ADULTS_65_PLUS",
          },
        },
        rank: ["EAA", "DOL_PUA", "DOL_UA", "HEAP", "EAF"],
      },
    };
    const data = {
      serviceData: serviceData.serviceData,
      responses: {
        ADULTS_65_PLUS: true,
        IS_EMPLOYED: false,
      },
    };

    it("updates services", () => {
      expect(
        reduceServices(
          {},
          {
            type: updateServices.type,
            payload: serviceData.serviceData,
          }
        )
      ).toEqual(serviceData.serviceData);
    });

    it("selects rank list", () => {
      expect(selectRank(data)).toEqual([
        "EAA",
        "DOL_PUA",
        "DOL_UA",
        "HEAP",
        "EAF",
      ]);
    });

    it("selects services", () => {
      expect(selectServices(data)).toEqual({
        DOL_UA: { formula: "=NOT(IS_EMPLOYED)" },
        HEAP: { formula: "" },
        DOL_PUA: { formula: "" },
        EAF: { formula: "=IS_EMPLOYED" },
        EAA: { formula: "=ADULTS_65_PLUS" },
      });
    });

    it("selects single service", () => {
      expect(selectService(data, "HEAP")).toEqual(
        data.serviceData.services.HEAP
      );
    });

    it("selects single service that doesn't exist", () => {
      expect(selectService(data, "SNAP")).toBeUndefined();
    });

    it("selects ranked no formula services", () => {
      expect(selectRankedNoFormulaServiceKeys(data)).toEqual([
        "DOL_PUA",
        "HEAP",
      ]);
    });

    it("selects ranked matching services", () => {
      expect(selectRankedMatchingServiceKeys(data)).toEqual(["EAA", "DOL_UA"]);
    });
  });
});
