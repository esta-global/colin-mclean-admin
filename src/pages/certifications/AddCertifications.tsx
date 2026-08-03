import { GoBackButton, InputBox, SubmitButton } from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  certificatiosSchema,
  CertificationsValues,
  certificationsInitialValues,
} from "../../validationSchemas/certificationsSchema";

import { useState } from "react";
import { generateSlug, post, remove, validateSlug } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function AddCertifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setFieldError,
  } = useFormik({
    onSubmit: async function (
      values: CertificationsValues,
      helpers: FormikHelpers<CertificationsValues>,
    ) {
      setLoading(true);

      const newValue = { ...values };

      const apiResponse = await post("/certifications", newValue, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: certificationsInitialValues,
    validationSchema: certificatiosSchema,
  });

  // handleUploadIconFile
  async function handleUploadIconFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("certificationIcon", true);
      setFieldError("certificationIcon", "Icon is required field");
      toast.error("Icon is required field");
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("certificationIcon", true);
      setFieldError("certificationIcon", "Must select the valid image file");
      toast.error("Must select the valid image file");
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
        setFieldTouched("certificationIcon", false);
        setFieldError("certificationIcon", "");
        setFieldValue("certificationIcon", apiData.body[0].filename);
      } else {
        setFieldTouched("certificationIcon", false);
        setFieldError("certificationIcon", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("certificationFile", true);
      setFieldError(
        "certificationFile",
        "Certification File is required field",
      );
      toast.error("Certification File is required field");
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("certificationFile", true);
      setFieldError("certificationFile", "Must select the valid image file");
      toast.error("Must select the valid image file");
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
        setFieldTouched("certificationFile", false);
        setFieldError("certificationFile", "");
        setFieldValue("certificationFile", apiData.body[0].filename);
      } else {
        setFieldTouched("certificationFile", false);
        setFieldError("certificationFile", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteIconFile
  async function handleDeleteIconFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("certificationIcon", "");
        setFieldValue("certificationIcon", "");
      } else {
        setFieldError("certificationIcon", "");
        setFieldValue("certificationIcon", "");
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        `certificationIconFile`,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear the input field
        setFieldValue("certificationIcon", "");
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("certificationFile", "");
        setFieldValue("certificationFile", "");
      } else {
        setFieldError("certificationFile", "");
        setFieldValue("certificationFile", "");
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        `certificationFile`,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear the input field
        setFieldValue("certificationFile", "");
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
              <h4 className="font-weight-bold mb-0">Add Certifications</h4>
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
          <div className="col-md-12">
            <form className="forms-sample" onSubmit={handleSubmit}>
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    {/* Certifications Title */}
                    <div className="form-group col-md-6">
                      <InputBox
                        label="Certification Title"
                        name="title"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter certification title"
                        value={values.title}
                        required={true}
                        touched={touched.title}
                        error={errors.title}
                      />
                    </div>

                    <div className="form-group col-md-4">
                      <label htmlFor="">Status</label>
                      <div className="d-flex gap-3">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            name="status"
                            id="true"
                            value={"true"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.status == "true"}
                          />
                          <label htmlFor="true" className="mt-2">
                            Active
                          </label>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <input
                            type="radio"
                            name="status"
                            id="false"
                            value={"false"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.status == "false"}
                          />
                          <label htmlFor="false" className="mt-2">
                            Disabled
                          </label>
                        </div>
                      </div>
                      {errors.status && touched.status ? (
                        <p className="custom-form-error text-danger">
                          {errors.status}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Certification Icon */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Certification Icon</h5>
                    </div>

                    <div className="mb-3 col-md-6 d-flex justify-content-center flex-column">
                      <div className="input-group">
                        <input
                          type="file"
                          className="form-control"
                          id="certificationIconFile"
                          onChange={(evt) => {
                            handleUploadIconFile(evt);
                          }}
                        />
                        <label
                          className="input-group-text"
                          htmlFor="certificationIconFile"
                        >
                          Upload
                        </label>
                      </div>

                      {touched.certificationIcon && errors.certificationIcon ? (
                        <p className="custom-form-error text-danger">
                          {errors.certificationIcon}
                        </p>
                      ) : null}
                    </div>

                    <div className="col-md-6 text-center">
                      {values.certificationIcon ? (
                        <Link
                          to={`${values.certificationIcon}`}
                          target="_blank"
                        >
                          <img
                            className="img img-fluid rounded bordered"
                            // height={200}
                            width={200}
                            src={addUrlToFile(values.certificationIcon)}
                          />
                        </Link>
                      ) : null}

                      {values.certificationIcon ? (
                        <button
                          type="button"
                          className="btn p-1"
                          onClick={(evt) => {
                            handleDeleteIconFile(evt, values.certificationIcon);
                          }}
                        >
                          <i className="fa fa-trash text-danger"></i>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Certification File */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Certification File</h5>
                    </div>

                    <div className="mb-3 col-md-6 d-flex justify-content-center flex-column">
                      <div className="input-group">
                        <input
                          type="file"
                          className="form-control"
                          id="certificationFile"
                          onChange={(evt) => {
                            handleUploadFile(evt);
                          }}
                        />
                        <label
                          className="input-group-text"
                          htmlFor="certificationFile"
                        >
                          Upload
                        </label>
                      </div>

                      {touched.certificationFile && errors.certificationFile ? (
                        <p className="custom-form-error text-danger">
                          {errors.certificationFile}
                        </p>
                      ) : null}
                    </div>

                    <div className="col-md-6 text-center">
                      {values.certificationFile ? (
                        <Link
                          to={`${values.certificationFile}`}
                          target="_blank"
                        >
                          <img
                            className="img img-fluid rounded bordered"
                            // height={200}
                            width={200}
                            src={addUrlToFile(values.certificationFile)}
                          />
                        </Link>
                      ) : null}

                      {values.certificationFile ? (
                        <button
                          type="button"
                          className="btn p-1"
                          onClick={(evt) => {
                            handleDeleteFile(evt, values.certificationFile);
                          }}
                        >
                          <i className="fa fa-trash text-danger"></i>
                        </button>
                      ) : null}
                    </div>

                    <div className="">
                      <SubmitButton loading={false} text="Add Certifications" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
