import * as Yup from "yup";

export const decorSeriesSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  status: Yup.string().required().label("Status"),
});

export const typeInitialValues: DecorSeriesValues = {
  title: "",
  status: "true",
};

export interface DecorSeriesValues {
  title: string;
  status: string;
}
