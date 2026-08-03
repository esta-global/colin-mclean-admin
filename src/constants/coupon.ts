export const COUPON_USERS = {
  NEW_USER: "New User",
  EXISTING_USER: "Existing User",
  ALL_USER: "All User",
};
export const COUPON_DISCOUNT = { AMOUNT: "Amount", PERCENTAGE: "Percentage" };
export const COUPON_STATUS = {
  PENDING: "Pending",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  HOLD: "Hold",
};

export const COUPON_LEVEL = {
  PRODUCT: "Product",
  CATEGORY: "Category",
  ALL: "All",
};

export type CouponLevelTypes = "ALL" | "PRODUCT" | "CATEGORY" | "";
export type CoponUserTypes = "NEW_USER" | "EXISTING_USER" | "ALL_USER" | "";
export type CouponDiscountTypes = "AMOUNT" | "PERCENTAGE" | "";
export type CouponStatusTypes = "PENDING" | "ACTIVE" | "EXPIRED" | "HOLD" | "";

export const couponStatusOption: any[] = Object.entries(COUPON_STATUS).map(
  ([key, value]) => {
    return { value: key, label: value };
  }
);

export const applyForOption: any[] = Object.entries(COUPON_USERS).map(
  ([key, value]) => {
    return { value: key, label: value };
  }
);

export const discountTypeOption: any[] = Object.entries(COUPON_DISCOUNT).map(
  ([key, value]) => {
    return { value: key, label: value };
  }
);

export const couponLevelOption: any[] = Object.entries(COUPON_LEVEL).map(
  ([key, value]) => {
    return { value: key, label: value };
  }
);
