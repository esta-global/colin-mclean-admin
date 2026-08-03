import * as Yup from "yup";

export const trainerLevelSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  status: Yup.string().required().label("Status"),
});

export const trainerLevelInitialValues: TrainerLevelValues = {
  title: "",
  status: "true",
};

export interface TrainerLevelValues {
  title: string;
  status: string;
}
