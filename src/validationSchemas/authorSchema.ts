import * as Yup from "yup";

export const authorSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  email: Yup.string().email().label("Email"),
  mobile: Yup.string()
    .matches(/^[6-9]\d{9}$/, {
      excludeEmptyString: true,
      message: "Mobile must be a valid Number",
    })
    .label("Mobile"),
  profilePhoto: Yup.string().required().label("Profile Photo"),
  bio: Yup.string().label("Bio"),
  status: Yup.string().label("Status"),
});

export const authorInitialValues: AuthorValues = {
  name: "",
  email: "",
  mobile: "",
  profilePhoto: "",
  bio: "",
  status: "true",
};

export interface AuthorValues {
  name: string;
  email: string;
  mobile: string;
  profilePhoto: string;
  bio: string;
  status: string;
}
