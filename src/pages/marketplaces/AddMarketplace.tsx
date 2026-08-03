import {
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  marketplaceSchema,
  MarketplaceValues,
  marketplaceInitialValues,
} from "../../validationSchemas/marketplaceSchema";
import { useState } from "react";
import { generateSlug, post, remove } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function AddMarketplace() {
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
      values: MarketplaceValues,
      helpers: FormikHelpers<MarketplaceValues>,
    ) {
      setLoading(true);

      const newValue = { ...values };

      const apiResponse = await post("/marketplaces", newValue, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: marketplaceInitialValues,
    validationSchema: marketplaceSchema,
  });

  function handleTitleChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const value = evt.target.value;
    const name = evt.target.name;

    setFieldValue(name, value);
    setFieldValue("slug", generateSlug(value));
  }

  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("image", true);
      setFieldError("image", "Must select the valid image file");
      toast.error("Must select the valid image file");
      return;
    }

    const formData = new FormData();
    formData.append("files", file);

    try {
      const apiResponse = await fetch(`${API_URL}/fileUploads`, {
        method: "POST",
        body: formData,
      });

      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        setFieldTouched("image", false);
        setFieldError("image", "");
        setFieldValue("image", apiData.body[0].filename);
      } else {
        setFieldTouched("image", false);
        setFieldError("image", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("image", "");
        setFieldValue("image", "");
      } else {
        setFieldError("image", "");
        setFieldValue("image", "");
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        "imageFile",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  return (
    <div className="content-wrapper marketplace-form-page">
      <div className="row user-page-header">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2 align-items-center">
              <GoBackButton />
              <div>
                <h4 className="font-weight-bold mb-1">Add Marketplace</h4>
                <p className="user-page-subtitle mb-0">
                  Create marketplace details, slug, status, and brand image.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <form className="forms-sample w-100" onSubmit={handleSubmit}>
            <div className="card user-panel marketplace-form-card">
              <div className="card-body">
                <div className="user-section-title">
                  <div>
                    <h5 className="mb-1">Marketplace Details</h5>
                    <p className="mb-0">
                      Add the public title, URL slug, and short description.
                    </p>
                  </div>
                </div>

                <div className="row marketplace-form-grid">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Marketplace Title"
                      name="title"
                      handleBlur={handleBlur}
                      handleChange={handleTitleChange}
                      type="text"
                      placeholder="Enter marketplace title"
                      value={values.title}
                      required={true}
                      touched={touched.title}
                      error={errors.title}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Marketplace Slug"
                      name="slug"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter marketplace slug"
                      value={values.slug}
                      required={true}
                      touched={touched.slug}
                      error={errors.slug}
                    />
                  </div>

                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Description"
                      name="description"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Enter marketplace description"
                      value={values.description}
                      touched={touched.description}
                      error={errors.description}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="">Status</label>
                    <div className="user-status-options">
                      <label
                        className={`user-status-option ${
                          values.status == "true" ? "active" : ""
                        }`}
                        htmlFor="marketplace-add-active"
                      >
                        <input
                          type="radio"
                          name="status"
                          id="marketplace-add-active"
                          value={"true"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "true"}
                        />
                        <span className="status-dot"></span>
                        <span>Active</span>
                      </label>
                      <label
                        className={`user-status-option ${
                          values.status == "false" ? "active" : ""
                        }`}
                        htmlFor="marketplace-add-disabled"
                      >
                        <input
                          type="radio"
                          name="status"
                          id="marketplace-add-disabled"
                          value={"false"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "false"}
                        />
                        <span className="status-dot disabled"></span>
                        <span>Disabled</span>
                      </label>
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

            <div className="card user-panel marketplace-upload-card mt-4">
              <div className="card-body">
                <div className="user-section-title">
                  <div>
                    <h5 className="mb-1">Marketplace Image</h5>
                    <p className="mb-0">
                      Upload an optional PNG, JPG, JPEG, or WEBP image.
                    </p>
                  </div>
                </div>

                <div className="row align-items-center">
                  <div className="mb-3 col-md-6 d-flex justify-content-center flex-column">
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="imageFile"
                        onChange={handleUploadFile}
                      />
                      <label className="input-group-text" htmlFor="imageFile">
                        Upload
                      </label>
                    </div>

                    {touched.image && errors.image ? (
                      <p className="custom-form-error text-danger">
                        {errors.image}
                      </p>
                    ) : null}
                  </div>

                  <div className="col-md-6">
                    <div className="marketplace-image-preview">
                      {values.image ? (
                        <Link to={addUrlToFile(values.image)} target="_blank">
                          <img
                            className="img img-fluid"
                            src={addUrlToFile(values.image)}
                            alt="Marketplace preview"
                          />
                        </Link>
                      ) : (
                        <div className="marketplace-image-empty">
                          <i className="ti-image"></i>
                          <span>No image selected</span>
                        </div>
                      )}
                      {values.image ? (
                        <button
                          type="button"
                          className="btn marketplace-image-delete"
                          onClick={(evt) => {
                            handleDeleteFile(evt, values.image);
                          }}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="marketplace-form-actions">
              <SubmitButton loading={loading} text="Add Marketplace" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
