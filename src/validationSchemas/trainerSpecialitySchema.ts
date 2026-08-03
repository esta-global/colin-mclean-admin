import * as Yup from "yup";

export const trainerSpecialitySchema = Yup.object({
  title: Yup.string().required().label("Title"),
  status: Yup.string().required().label("Status"),
});

export const trainerSpecialityInitialValues: TrainerSpecialityValues = {
  title: "",
  status: "true",
};

export interface TrainerSpecialityValues {
  title: string;
  status: string;
}
