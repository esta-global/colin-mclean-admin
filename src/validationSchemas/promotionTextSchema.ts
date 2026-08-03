import * as Yup from "yup";

export const promotionTextSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  link: Yup.string().optional().label("Link"),
  location: Yup.string().required().label("Location"),
  priority: Yup.number().label("Priority"),
  status: Yup.string().required().label("Status"),
});

export const promotionTextInitialValues: PromotionTextValues = {
  title: "",
  link: "",
  location: "",
  priority: 0,
  status: "true",
};

export interface PromotionTextValues {
  title: string;
  link: string;
  location: string;
  priority: number;
  status: string;
}
