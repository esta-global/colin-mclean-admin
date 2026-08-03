import * as Yup from "yup";

export const certificatiosSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  certificationIcon: Yup.string().required().label("Certifications Icon"),
  certificationFile: Yup.string().label("Certifications File"),
  status: Yup.string().label("Status"),
});

export const certificationsInitialValues: CertificationsValues = {
  title: "",
  certificationIcon: "",
  certificationFile: "",
  status: "true",
};

export interface CertificationsValues {
  title: string;
  certificationIcon: string;
  certificationFile: string;
  status: string;
}
