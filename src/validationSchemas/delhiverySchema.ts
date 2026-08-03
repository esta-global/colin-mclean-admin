import * as Yup from "yup";

export const delhiverySchema = Yup.object({
  breadth: Yup.number().required().label("Breadth"),
  width: Yup.number().required().label("Width"),
  height: Yup.number().required().label("Height"),
  weight: Yup.number().required().label("Weight"),
  id: Yup.string().required().label("Id"),
});

export const deliveryInitialValues: DelhiveryValues = {
  breadth: 0,
  width: 0,
  height: 0,
  weight: 0,
  id: "",
};

export interface DelhiveryValues {
  breadth: number;
  width: number;
  height: number;
  weight: number;
  id: string;
}
