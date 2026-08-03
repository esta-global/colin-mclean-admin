import * as Yup from "yup";

export const addTrainerSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  userName: Yup.string().required().label("User Name"),
  designation: Yup.string().required().label("Designation"),
  dob: Yup.string().required().label("DOB"),
  gender: Yup.string().required().label("Gender"),
  level: Yup.object().required().label("Level"),
  profilePhoto: Yup.object().required().label("Profile Photo"),
  video: Yup.string().url().label("Video"),
  email: Yup.string().email().required().label("Email"),
  mobile: Yup.string().required().label("Mobile"),
  bio: Yup.string().label("Bio"),
  specialities: Yup.array()
    .required("Specialities are required.")
    .label("Specialities"),
  interests: Yup.array().required("Interests are required.").label("Interests"),
  // certificates: Yup.array().label("Certificates"),

  meetingLink: Yup.string().label("Meeting Link"),

  address: Yup.string().required().label("Address"),
  locality: Yup.string().required().label("Locality"),
  city: Yup.string().required().label("City"),
  state: Yup.string().required().label("State"),
  country: Yup.string().required().label("Country"),
  pincode: Yup.string().length(6).required().label("Pincode"),

  facebook: Yup.string().url().label("Facebook"),
  instagram: Yup.string().url().label("Instagram"),
  twitter: Yup.string().url().label("Twitter"),
  x: Yup.string().url().label("X"),
  youtube: Yup.string().url().label("Youtube"),
  password: Yup.string().required().label("Password"),
});

export const trainerInitialValues: TrainerValues = {
  name: "",
  userName: "",
  designation: "",
  dob: "",
  gender: "",
  level: null,
  profilePhoto: null,
  video: "",
  email: "",
  mobile: "",
  bio: "",
  specialities: null,
  interests: null,
  certificates: null,
  meetingLink: "",
  address: "",
  locality: "",
  city: "",
  pincode: "",
  state: "",
  country: "",
  facebook: "",
  instagram: "",
  x: "",
  youtube: "",
  linkedin: "",
  password: "",
};

export interface TrainerValues {
  name: string;
  userName: string;
  designation: string;
  dob: string;
  gender: string;
  level: {
    label: string;
    value: string;
  } | null;
  profilePhoto: FileType | null;
  video: string;
  email: string;
  mobile: string;
  bio: string;
  specialities:
    | {
        label: string;
        value: string;
      }[]
    | null;
  interests:
    | {
        label: string;
        value: string;
      }[]
    | null;
  certificates: any[] | null;
  meetingLink: string;
  address: string;
  locality: string;
  city: string;
  pincode: string;
  country: string;
  state: string;
  facebook: string;
  instagram: string;
  x: string;
  youtube: string;
  linkedin: string;
  password: string;
}

export type FileType = {
  fieldname: string;
  encoding: string;
  originalname: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: string;
  filepath: string;
};

// Update
export const updateTrainerSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  userName: Yup.string().required().label("User Name"),
  designation: Yup.string().required().label("Designation"),
  dob: Yup.string().required().label("DOB"),
  gender: Yup.string().required().label("Gender"),
  level: Yup.object().required().label("Level"),
  profilePhoto: Yup.string().required().label("Profile Photo"),
  video: Yup.string().url().label("Video"),
  email: Yup.string().email().required().label("Email"),
  mobile: Yup.string().required().label("Mobile"),
  bio: Yup.string().label("Bio"),
  specialities: Yup.array()
    .required("Specialities are required.")
    .label("Specialities"),
  interests: Yup.array().required("Interests are required.").label("Interests"),
  // certificates: Yup.array().label("Certificates"),
  meetingLink: Yup.string().required().label("Meeting Link"),
  address: Yup.string().required().label("Address"),
  locality: Yup.string().required().label("Locality"),
  city: Yup.string().required().label("City"),
  state: Yup.string().required().label("State"),
  country: Yup.string().required().label("Country"),
  pincode: Yup.string().length(6).required().label("Pincode"),

  facebook: Yup.string().url().label("Facebook"),
  instagram: Yup.string().url().label("Instagram"),
  twitter: Yup.string().url().label("Twitter"),
  x: Yup.string().url().label("X"),
  youtube: Yup.string().url().label("Youtube"),
  password: Yup.string().optional().label("Password"),
});
