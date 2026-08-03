import * as Yup from "yup";

export const badgeSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  status: Yup.string().required().label("Status"),
});

export const badgeInitialValues: BadgeValues = {
  title: "",
  status: "true",
};

export interface BadgeValues {
  title: string;
  status: string;
}
