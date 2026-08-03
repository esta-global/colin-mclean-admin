import * as Yup from "yup";

export const trainerDesignationSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  status: Yup.string().required().label("Status"),
});

export const trainerDesignationInitialValues: TrainerDesignationValues = {
  title: "",
  status: "true",
};

export interface TrainerDesignationValues {
  title: string;
  status: string;
}
