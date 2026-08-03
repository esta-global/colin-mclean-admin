import {
  CustomSelect,
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  addTrainerSchema,
  TrainerValues,
  trainerInitialValues,
} from "../../validationSchemas/trainerSchema";
import React, { useEffect, useState } from "react";
import {
  get,
  post,
  remove,
  validateTextNumber,
  validateText,
  validateUsername,
  validateEmail,
  validateMobile,
  validatePincode,
} from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";

export function AddUser() {
  const navigate = useNavigate();

  const [trainerInterests, setTrainerInterests] = useState([]);
  const [trainerSpecialities, setTrainerSpecialities] = useState([]);
  const [trainerLevels, setTrainerLevels] = useState([]);
  const [kycDocuments, setKycDocumnets] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldTouched,
    setFieldValue,
    setFieldError,
  } = useFormik({
    onSubmit: async function (
      values: TrainerValues,
      helpers: FormikHelpers<TrainerValues>
    ) {
      setLoading(true);

      // certificate
      let certificates = [];
      for (let certificate of certificateInputFields) {
        if (certificate.title && certificate.file.filename) {
          certificates.push({
            title: certificate.title,
            certificateFile: certificate.file.filepath,
          });
        }
      }

      // kycDocuments
      let kycDocs = [];
      let kycErrorCount = 0;
      let requiredDocs = [...kycDocuments];
      for (let i = 0; i < requiredDocs.length; i++) {
        if (requiredDocs[i]?.file?.filename) {
          kycDocs.push({
            title: requiredDocs[i].title,
            documentFile: requiredDocs[i].file.filepath,
          });
        } else {
          requiredDocs[i].error = `${requiredDocs[i].title} is required field`;
          kycErrorCount++;
        }
      }

      if (kycErrorCount != 0) {
        toast.error("Fill all the required fields");
        setKycDocumnets(requiredDocs);
        return;
      }

      const newValue = {
        ...values,
        specialities: values.specialities?.map(({ value }) => value),
        interests: values.interests?.map(({ value }) => value),
        level: values.level?.value,
        certificates,
        profilePhoto: values.profilePhoto?.filepath,
        kycDocuments: kycDocs,
        // couponStatus: values.couponStatus?.value,
      };

      const apiResponse = await post("/trainers", newValue, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: trainerInitialValues,
    validationSchema: addTrainerSchema,
  });

  type Certificate = { title: string; file: any | null; error: string };
  const [certificateInputFields, setCertificateInputFields] = useState<
    Certificate[]
  >([
    {
      title: "",
      file: null,
      error: "",
    },
  ]);
  const handleAddCertificateFields = () => {
    setCertificateInputFields([
      ...certificateInputFields,
      { title: "", file: null, error: "" },
    ]);
  };
  const handleRemoveCertificateFields = (index: number) => {
    const updatedInputFields = [...certificateInputFields];
    updatedInputFields.splice(index, 1);
    setCertificateInputFields(updatedInputFields);
  };

  // get trainer specialities
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/trainerSpecialities", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.title,
            value: value._id,
          };
        });
        setTrainerSpecialities(modifiedValue);
      }
    }

    getData();
  }, []);

  // get trainer interests
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/trainerInterests", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.title,
            value: value._id,
          };
        });
        setTrainerInterests(modifiedValue);
      }
    }

    getData();
  }, []);

  // get trainer interests
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/trainerLevels", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.title,
            value: value._id,
          };
        });
        setTrainerLevels(modifiedValue);
      }
    }

    getData();
  }, []);

  // get kyc documents
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/kycDocuments", true);
      if (apiResponse?.status == 200) {
        setKycDocumnets(apiResponse.body);
        // const kyc = apiResponse?.body?.map(({ _id, title, formats }: any) => {
        //   return { _id, title, formats, file: "", error: "" };
        // });

        // setSelectedKycDocuments(kyc);
      }
    }

    getData();
  }, []);

  // handleUploadFile
  async function handleUploadFile(
    event: React.ChangeEvent<HTMLInputElement>,
    acceptType: any,
    index: number
  ) {
    const mimeTypes = acceptType?.map((value: any) => value.mimeType) || [
      "application/pdf",
    ];

    const files = event.target.files;
    const inputElementName: "certificateFile" | "kycFile" = event.target
      .name as "certificateFile" | "kycFile";

    if (!files || files.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    const formData = new FormData();

    // Validate MIME type and append valid files to FormData
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check if the file's MIME type is in the allowed list
      if (!mimeTypes.includes(file.type)) {
        if (inputElementName == "kycFile") {
          let kycDocsFiles = [...kycDocuments];
          kycDocuments[index]["error"] = "File type is not allowed";
          return setKycDocumnets(kycDocsFiles);
        } else if (inputElementName == "certificateFile") {
          let certificateFields = [...certificateInputFields];
          certificateFields[index]["error"] = "File type is not allowed";
          return setCertificateInputFields(certificateFields);
        }
      }
    }

    // Append each file to the FormData object
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      let url = `${API_URL}/fileUploads`;
      const apiResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        if (inputElementName == "kycFile") {
          let kycDocsFiles = [...kycDocuments];
          kycDocuments[index]["error"] = "";
          kycDocuments[index]["file"] = apiData.body[0];
          setKycDocumnets(kycDocsFiles);
        } else if (inputElementName == "certificateFile") {
          let certificateFields = [...certificateInputFields];
          certificateFields[index]["error"] = "";
          certificateFields[index]["file"] = apiData.body[0];
          setCertificateInputFields(certificateFields);
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
    index: number,
    deleteFile?: "kycFile" | "certificateFile"
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        if (deleteFile == "kycFile") {
          let kycDocsFiles = [...kycDocuments];
          kycDocuments[index]["error"] = "";
          kycDocuments[index]["file"] = null;
          setKycDocumnets(kycDocsFiles);
        } else if (deleteFile == "certificateFile") {
          let certificateFields = [...certificateInputFields];
          certificateFields[index]["error"] = "";
          certificateFields[index]["file"] = null;
          setCertificateInputFields(certificateFields);
        }
      } else {
        toast.error(apiResponse?.message);
      }

      // Clear the input field value after the file is deleted successfully
      if (deleteFile == "kycFile") {
        const fileInput = document.getElementById(
          `kycInputFile${index}`
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
        }
      } else if (deleteFile == "certificateFile") {
        const fileInput = document.getElementById(
          `certificateInputFile${index}`
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleUploadProfilePic
  async function handleUploadProfilePic(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("profilePhoto", true);
      setFieldError("profilePhoto", "Profile Photo is required field");
      toast.error("Profile Photo is required field");
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("profilePhoto", true);
      setFieldError("profilePhoto", "Must select the valid image file");
      toast.error("Must select the valid image file");
      console.log("error");
      return;
    }

    const formData = new FormData();

    formData.append("files", file);

    try {
      let url = `${API_URL}/fileUploads`;
      const apiResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        setFieldTouched("profilePhoto", false);
        setFieldError("profilePhoto", "");
        setFieldValue("profilePhoto", apiData.body[0]);
      } else {
        setFieldTouched("profilePhoto", false);
        setFieldError("profilePhoto", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteFile
  async function handleDeleteProfilePic(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("profilePhoto", "");
        setFieldValue("profilePhoto", "");
      } else {
        setFieldError("profilePhoto", "");
        setFieldValue("profilePhoto", "");
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        `profilePhotoFile`
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear the input field
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Add Trainer</h4>
            </div>
            {/* <div>
              <button
                type="button"
                className="btn btn-primary btn-icon-text btn-rounded"
              >
                <i className="ti-clipboard btn-icon-prepend"></i>Report
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <form className="forms-sample" onSubmit={handleSubmit}>
            {/* Personal Details */}
            <div className="card rounded-2">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-2">Personal Details</h5>
                  </div>
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Trainer Name"
                      name="name"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue("name", validateText(evt.target.value));
                      }}
                      type="text"
                      placeholder="Enter trainer name"
                      value={values.name}
                      required={true}
                      touched={touched.name}
                      error={errors.name}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Trainer User Name"
                      name="userName"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "userName",
                          validateUsername(evt.target.value)
                        );
                      }}
                      type="text"
                      placeholder="Enter trainer username"
                      value={values.userName}
                      required={true}
                      touched={touched.userName}
                      error={errors.userName}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Trainer Designation"
                      name="designation"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter Designation"
                      value={values.designation}
                      required={true}
                      touched={touched.designation}
                      error={errors.designation}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="DOB"
                      name="dob"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="date"
                      placeholder="Enter DOB"
                      value={values.dob}
                      required={true}
                      touched={touched.dob}
                      error={errors.dob}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="">
                      Gender <span className="text-danger">*</span>{" "}
                    </label>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          id="male"
                          value={"MALE"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.gender == "MALE"}
                        />
                        <label htmlFor="male" className="mt-2">
                          MALE
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <input
                          type="radio"
                          name="gender"
                          id="female"
                          value={"FEMALE"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.gender == "FEMALE"}
                        />
                        <label htmlFor="female" className="mt-2">
                          FEMALE
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <input
                          type="radio"
                          name="gender"
                          id="other"
                          value={"OTHER"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.gender == "OTHER"}
                        />
                        <label htmlFor="other" className="mt-2">
                          OTHER
                        </label>
                      </div>
                    </div>
                    {errors.gender && touched.gender ? (
                      <p className="custom-form-error text-danger">
                        {errors.gender}
                      </p>
                    ) : null}
                  </div>

                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Trainer Level"
                      placeholder="Select Level"
                      name="level"
                      required={true}
                      options={trainerLevels}
                      value={values.level}
                      error={errors.level}
                      touched={touched.level}
                      handleChange={(value) => {
                        setFieldValue("level", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("level", true);
                      }}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Email"
                      name="email"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue("email", validateEmail(evt.target.value));
                      }}
                      type="email"
                      placeholder="Enter email"
                      value={values.email}
                      required={true}
                      touched={touched.email}
                      error={errors.email}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Mobile"
                      name="mobile"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "mobile",
                          validateMobile(evt.target.value)
                        );
                      }}
                      type="text"
                      placeholder="Enter mobile"
                      value={values.mobile}
                      required={true}
                      touched={touched.mobile}
                      error={errors.mobile}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Password"
                      name="password"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter password"
                      value={values.password}
                      required={true}
                      touched={touched.password}
                      error={errors.password}
                    />
                  </div>

                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Bio"
                      name="bio"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Trainer bio"
                      value={values.bio}
                      touched={touched.bio}
                      error={errors.bio}
                    />
                  </div>

                  <div className="form-group col-md-8">
                    <label htmlFor={"profilePhotoFile"}>
                      Profile Photo <span className="text-danger"> *</span>
                    </label>
                    <div className="d-flex gap-2">
                      <input
                        type="file"
                        name="profilePhotoFile"
                        id="profilePhotoFile"
                        onChange={(evt) => {
                          handleUploadProfilePic(evt);
                        }}
                        className="form-control"
                      />
                      {values.profilePhoto ? (
                        <Link
                          to={`${values.profilePhoto.filepath}`}
                          target="_blank"
                        >
                          <img
                            className="img"
                            height={43}
                            width={43}
                            src={`${values.profilePhoto.filepath}`}
                          />
                        </Link>
                      ) : null}
                      {values.profilePhoto ? (
                        <button
                          type="button"
                          className="btn p-1"
                          onClick={(evt) => {
                            handleDeleteProfilePic(
                              evt,
                              values?.profilePhoto?.filename as string
                            );
                          }}
                        >
                          <i className="fa fa-trash text-danger"></i>
                        </button>
                      ) : null}
                    </div>
                    {touched.profilePhoto && errors.profilePhoto ? (
                      <p className="custom-form-error text-danger">
                        {errors.profilePhoto}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Other Details */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-2">Other Details</h5>
                  </div>

                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Trainer Interests"
                      placeholder="Select Interests"
                      name="interests"
                      required={true}
                      options={trainerInterests}
                      value={values.interests}
                      error={errors.interests}
                      touched={touched.level}
                      handleChange={(value) => {
                        setFieldValue("interests", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("interests", true);
                      }}
                      isMulti={true}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Trainer Speciality"
                      placeholder="Select Speciality"
                      name="specialities"
                      required={true}
                      options={trainerSpecialities}
                      value={values.specialities}
                      error={errors.specialities}
                      touched={touched.level}
                      handleChange={(value) => {
                        setFieldValue("specialities", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("specialities", true);
                      }}
                      isMulti={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trainer Certificates */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h5 className="mb-2">Trainer Certificates</h5>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={handleAddCertificateFields}
                    >
                      <i className="fas fa-plus text-info"></i>
                    </button>
                  </div>
                  <div className="form-group col-md-12">
                    {certificateInputFields.map((feild, index) => (
                      <div className="row mb-2">
                        <div className="mb-1 form-group col-md-5" key={index}>
                          <label htmlFor={""}>Certificate Title</label>
                          <input
                            className="form-control"
                            value={feild.title}
                            onChange={(e) => {
                              const updatedInputFields = [
                                ...certificateInputFields,
                              ];
                              updatedInputFields[index]["title"] =
                                validateTextNumber(e.target.value);
                              setCertificateInputFields(updatedInputFields);
                            }}
                            placeholder="Cretificate title"
                          />
                        </div>

                        <div className="mb-1 form-group col-md-6">
                          <label htmlFor={""}>Certificate PDF</label>
                          <div className="d-flex gap-1">
                            <input
                              className="form-control"
                              type="file"
                              accept=".pdf"
                              name="certificateFile"
                              // value={feild.file}
                              id={`certificateInputFile${index}`}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                handleUploadFile(event, null, index);
                              }}
                              placeholder="Cretificate title"
                            />

                            <div className="d-flex gap-2 align-items-center">
                              {feild?.file ? (
                                <Link
                                  target="_blank"
                                  to={`/fileDetails/${feild?.file?.filename}`}
                                  className="btn bg-light border"
                                >
                                  <i className="fa fa-check-circle text-success"></i>
                                </Link>
                              ) : null}
                              {feild?.file ? (
                                <button
                                  className="btn bg-light border"
                                  type="button"
                                  onClick={(event) => {
                                    handleDeleteFile(
                                      event,
                                      feild?.file?.filename,
                                      index,
                                      "certificateFile"
                                    );
                                  }}
                                >
                                  <i className="fa fa-trash text-danger"></i>
                                </button>
                              ) : null}
                            </div>

                            {index != 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveCertificateFields(index)
                                }
                                className="btn bg-light border"
                              >
                                <i className="fas fa-close text-danger"></i>
                              </button>
                            ) : null}
                          </div>

                          <p className="custom-form-error text-danger">
                            {feild?.error}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trainer KYC Details */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-2">Trainer KYC Details</h5>
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Address"
                      name="address"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter address"
                      value={values.address}
                      required={true}
                      touched={touched.address}
                      error={errors.address}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Locality"
                      name="locality"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter locality"
                      value={values.locality}
                      required={true}
                      touched={touched.locality}
                      error={errors.locality}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <InputBox
                      label="City"
                      name="city"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter city"
                      value={values.city}
                      required={true}
                      touched={touched.city}
                      error={errors.city}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Pincode"
                      name="pincode"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter pincode"
                      value={values.pincode}
                      required={true}
                      touched={touched.pincode}
                      error={errors.pincode}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Country"
                      name="country"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter country"
                      value={values.country}
                      required={true}
                      touched={touched.country}
                      error={errors.country}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <InputBox
                      label="State"
                      name="state"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter state"
                      value={values.state}
                      required={true}
                      touched={touched.state}
                      error={errors.state}
                    />
                  </div>

                  <div className="form-group col-md-12">
                    {kycDocuments?.map((kycDocument: any, index: number) => {
                      const extensions = kycDocument?.formats
                        ?.map((value: any) => {
                          return `.${value.format}`;
                        })
                        .join(",");

                      return (
                        <div className="row mb-2">
                          <div className="mb-1 form-group col-md-5 d-flex gap-2">
                            <div className="">
                              <label htmlFor={""}>
                                {kycDocument.title}{" "}
                                <span className="text-danger">*</span>{" "}
                              </label>
                              <input
                                className="form-control"
                                type="file"
                                name="kycFile"
                                accept={extensions}
                                onChange={(event) => {
                                  handleUploadFile(
                                    event,
                                    kycDocument.formats,
                                    index
                                  );
                                }}
                                id={`kycInputFile${index}`}
                              />
                              {kycDocument.error ? (
                                <p className="custom-form-error text-danger">
                                  {kycDocument.error}
                                </p>
                              ) : null}
                            </div>
                            <div className="d-flex gap-2 align-items-center pt-4">
                              {kycDocument?.file ? (
                                <Link
                                  target="_blank"
                                  to={`/fileDetails/${kycDocument?.file?.filename}`}
                                  className="btn p-1"
                                >
                                  <i
                                    className="fa fa-check-circle text-success"
                                    style={{ fontSize: "20px" }}
                                  ></i>
                                </Link>
                              ) : null}
                              {kycDocument?.file ? (
                                <button
                                  className="btn p-1"
                                  type="button"
                                  onClick={(event) => {
                                    handleDeleteFile(
                                      event,
                                      kycDocument?.file?.filename,
                                      index,
                                      "kycFile"
                                    );
                                  }}
                                >
                                  <i
                                    className="fa fa-trash text-danger"
                                    style={{ fontSize: "20px" }}
                                  ></i>
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Details */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-3">Social Links</h5>
                  </div>
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Facebook"
                      name="facebook"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="url"
                      placeholder="Enter facebook url"
                      value={values.facebook}
                      touched={touched.facebook}
                      error={errors.facebook}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Instagram"
                      name="instagram"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="url"
                      placeholder="Enter instagram url"
                      value={values.instagram}
                      required={false}
                      touched={touched.instagram}
                      error={errors.instagram}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Twitter (X)"
                      name="x"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="url"
                      placeholder="Enter twitter url"
                      value={values.x}
                      required={false}
                      touched={touched.x}
                      error={errors.x}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Linkedin"
                      name="linkedin"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="url"
                      placeholder="Enter linkedin url"
                      value={values.linkedin}
                      required={false}
                      touched={touched.linkedin}
                      error={errors.linkedin}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Youtube"
                      name="youtube"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="url"
                      placeholder="Enter youtube url"
                      value={values.youtube}
                      required={false}
                      touched={touched.youtube}
                      error={errors.youtube}
                    />
                  </div>
                </div>

                <SubmitButton loading={false} text="Add Trainer" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
