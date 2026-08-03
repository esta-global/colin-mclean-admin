import * as Yup from "yup";

export const programPlanSchema = Yup.object({
  plan: Yup.object().required().label("Plan"),
  salePriceInr: Yup.number().required().label("Sale Price INR"),
  mrpInr: Yup.number().label("MRP INR"),
  planDuration: Yup.number().required().label("Plan Duration"),
  salePriceDollar: Yup.number().required().label("Sale Price Dollar"),
  mrpDollar: Yup.number().required().label("MRP Dollar"),
  ptSession: Yup.number().required().label("PT Sessions"),
  groupSession: Yup.number().required().label("Group Session"),
  shortDescription: Yup.string().label("Short Description"),
  isCancellable: Yup.bool().required().label("Is Cancellable"),
  cancellationPeriod: Yup.number().required().label("Cancellation Period"),
  status: Yup.bool().label("Status"),
});

export const programPlanInitialValues: ProgramPlanValues = {
  plan: null,
  salePriceInr: "",
  mrpInr: "",
  planDuration: "0",
  salePriceDollar: "",
  mrpDollar: "",
  ptSession: "0",
  groupSession: "0",
  shortDescription: "",
  features: "",
  isDefault: "false",
  isCancellable: "false",
  cancellationPeriod: "0",
  status: "true",
};

export interface ProgramPlanValues {
  plan: {
    label: string;
    value: string;
  } | null;
  salePriceInr: string;
  mrpInr: string;
  salePriceDollar: string;
  mrpDollar: string;
  ptSession: string;
  groupSession: string;
  shortDescription: string;
  features: string;
  planDuration: string;
  isDefault: string;
  isCancellable: string;
  cancellationPeriod: string;
  status: string;
}
