import * as Yup from "yup";

export const productReviewSchema = Yup.object({
  user: Yup.object().required().label("User"),
  // reviewTitle: Yup.string().required().label("Review Title"),
  product: Yup.object().required().label("Product"),
  displayName: Yup.string().label("Display Name"),
  rating: Yup.string().label("Rating"),
  reviewText: Yup.string().label("Review Text"),

  reviewDate: Yup.string().label("Review Date"),
  reviewStatus: Yup.string().label("Review Status"),
});

export const productInitialValues: ProductReviewValues = {
  user: null,
  // reviewTitle: "",
  product: null,
  displayName: "",
  rating: "",
  reviewText: "",
  reviewDate: "",
  reviewStatus: "ACTIVE",
};

export interface ProductReviewValues {
  user: { label: ""; value: "" } | null;
  // reviewTitle: string;
  product: { label: ""; value: "" } | null;
  displayName: string;
  rating: string;
  reviewText: string;
  reviewDate: string;
  reviewStatus: string;
}
