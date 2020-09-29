export const responses = {
  positive: {
    responses: {
      IS_EMPLOYED: true,
      HOUSEHOLD_SIZE: 1,
      HOUSEHOLD_INCOME: 1,
      ADULTS_65_PLUS: true,
      CHILDREN_13_17: true,
      CHILDREN_06_12: true,
      CHILDREN_00_05: true,
      IS_PREGNANT: true,
      IS_STUDENT: true,
      IS_DISABLED: true,
      IS_MILITARY: true,
    },
  },
  negative: {
    responses: {
      IS_EMPLOYED: false,
      HOUSEHOLD_SIZE: 0,
      HOUSEHOLD_INCOME: 0,
      ADULTS_65_PLUS: false,
      CHILDREN_13_17: false,
      CHILDREN_06_12: false,
      CHILDREN_00_05: false,
      IS_PREGNANT: false,
      IS_STUDENT: false,
      IS_DISABLED: false,
      IS_MILITARY: false,
    },
  },
  empty: {
    responses: {},
  },
};

Object.freeze(responses);

export default responses.positive;
