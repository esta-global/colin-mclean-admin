import * as Yup from "yup";

/* =======================
   Yup Validation Schema
======================= */
export const privacyPolicyPageSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .label("Title"),
  content: Yup.string()
    .required("Content is required")
    .label("Content"),

  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),

  status: Yup.boolean().label("Status"),
});

/* =======================
   Initial Values
======================= */
export const privacyPolicyInitialValues: PrivacyPolicyPageValues = {
  title: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  status: false,
};

/* =======================
   TypeScript Interface
======================= */
export interface PrivacyPolicyPageValues {
  _id?: string;
  __v?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  subTitle?: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: boolean;
}
