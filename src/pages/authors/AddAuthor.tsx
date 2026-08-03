import { GoBackButton, InputBox, SubmitButton } from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  authorSchema,
  AuthorValues,
  authorInitialValues,
} from "../../validationSchemas/authorSchema";
import { useState } from "react";
import { post, remove } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function AddAuthor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);

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
      values: AuthorValues,
      helpers: FormikHelpers<AuthorValues>
    ) {
      setLoading(true);

      const apiResponse = await post("/authors", { ...values }, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: authorInitialValues,
    validationSchema: authorSchema,
  });

  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("profilePhoto", true);
      setFieldError("profilePhoto", "Profile Photo is required field");
      toast.error("Profile Photo is required field");
      return;
    }

    const file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("profilePhoto", true);
      setFieldError("profilePhoto", "Must select the valid Profile Photo file");
      toast.error("Must select the valid Profile Photo file");
      return;
    }

    const formData = new FormData();
    formData.append("files", file);

    try {
      setUploadingPhoto(true);
      const apiResponse = await fetch(`${API_URL}/fileUploads`, {
        method: "POST",
        body: formData,
      });
      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        setFieldTouched("profilePhoto", false);
        setFieldError("profilePhoto", "");
        setFieldValue("profilePhoto", apiData.body[0].filename);
        toast.success("Profile photo uploaded");
      } else {
        toast.error(apiData?.message || "Failed to upload profile photo");
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("profilePhoto", "");
        setFieldValue("profilePhoto", "");
        toast.success("Profile photo removed");
      }

      const fileInput = document.getElementById(
        "imageFile"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
        setFieldValue("profilePhoto", "");
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  return (
    <div className="content-wrapper author-form-page">
      <div className="author-form-header">
        <div className="author-form-header__content">
          <div className="author-form-header__actions">
            <GoBackButton />
            <span className="author-page-eyebrow">Blog authors</span>
          </div>
          <h1>Add Author</h1>
          <p>
            Create an author profile with contact details, publishing status,
            and a clear square profile photo.
          </p>
        </div>
        <div className="author-form-header__meta">
          <span className="author-form-pill">New author</span>
          <span className="author-form-note">Profile photo required</span>
        </div>
      </div>

      <form className="forms-sample author-form" onSubmit={handleSubmit}>
        <div className="author-form-layout">
          <main className="author-form-main">
            <div className="card author-form-card">
              <div className="card-body">
                <div className="author-form-section-heading">
                  <div>
                    <span>Profile</span>
                    <h2>Author details</h2>
                  </div>
                </div>

                <div className="row">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Author Name"
                      name="name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter name"
                      value={values.name}
                      required={true}
                      touched={touched.name}
                      error={errors.name}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Author Email"
                      name="email"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
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
                      label="Author Mobile"
                      name="mobile"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter mobile"
                      value={values.mobile}
                      required={true}
                      touched={touched.mobile}
                      error={errors.mobile}
                    />
                  </div>

                  <div className="form-group col-md-12">
                    <InputBox
                      label="Author Bio"
                      name="bio"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter description"
                      value={values.bio}
                      touched={touched.bio}
                      error={errors.bio}
                    />
                  </div>

                  <div className="form-group col-md-6 mb-0">
                    <label className="author-form-field-label">Status</label>
                    <div className="author-form-status-options">
                      <label className="author-form-status-option">
                        <input
                          type="radio"
                          name="status"
                          value={"true"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "true"}
                        />
                        <span>
                          <strong>Active</strong>
                          <small>Can be assigned to posts</small>
                        </span>
                      </label>
                      <label className="author-form-status-option">
                        <input
                          type="radio"
                          name="status"
                          value={"false"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "false"}
                        />
                        <span>
                          <strong>Disabled</strong>
                          <small>Hide from author lists</small>
                        </span>
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

            <div className="card author-form-card">
              <div className="card-body">
                <div className="author-form-section-heading">
                  <div>
                    <span>Photo</span>
                    <h2>Profile photo</h2>
                  </div>
                  <span className="author-form-chip">1080 x 1080 px</span>
                </div>

                <label htmlFor="imageFile" className="author-photo-uploader">
                  <span className="author-photo-uploader__icon">
                    <i className="fa fa-cloud-arrow-up"></i>
                  </span>
                  <strong>
                    {uploadingPhoto ? "Uploading photo..." : "Upload photo"}
                  </strong>
                  <p className="mb-0">JPG, PNG, or WEBP square image.</p>
                  <span className="author-photo-uploader__button">
                    Choose file
                  </span>
                </label>

                <input
                  type="file"
                  className="d-none"
                  id="imageFile"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleUploadFile}
                  disabled={uploadingPhoto}
                />

                {touched.profilePhoto && errors.profilePhoto ? (
                  <p className="custom-form-error text-danger mt-2">
                    {errors.profilePhoto}
                  </p>
                ) : null}
              </div>
            </div>
          </main>

          <aside className="author-form-side">
            <div className="card author-form-card author-form-preview-card">
              <div className="card-body">
                <span className="author-form-side-kicker">Preview</span>
                <div className="author-form-preview-photo">
                  {values.profilePhoto ? (
                    <Link to={`${values.profilePhoto}`} target="_blank">
                      <img src={addUrlToFile(values.profilePhoto)} alt="" />
                    </Link>
                  ) : (
                    <i className="fa fa-user"></i>
                  )}
                  {values.profilePhoto ? (
                    <button
                      type="button"
                      className="author-photo-remove"
                      aria-label="Remove profile photo"
                      onClick={(evt) => {
                        handleDeleteFile(evt, values.profilePhoto);
                      }}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  ) : null}
                </div>
                <h2>{values.name || "Author name"}</h2>
                <p>{values.bio || "Author bio preview will appear here."}</p>
                <div className="author-form-preview-meta">
                  <span>{values.email || "email@example.com"}</span>
                  <strong>
                    {values.status == "true" ? "Active" : "Disabled"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="card author-form-card">
              <div className="card-body">
                <span className="author-form-side-kicker">Checklist</span>
                <ul className="author-form-check-list">
                  <li>
                    <i className="fa fa-check"></i>
                    Author contact details
                  </li>
                  <li>
                    <i className="fa fa-check"></i>
                    Short bio for posts
                  </li>
                  <li>
                    <i className="fa fa-check"></i>
                    Square profile photo
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        <div className="author-form-sticky-actions">
          <div>
            <strong>Add Author</strong>
            <span>Save this profile for blog post attribution.</span>
          </div>
          <SubmitButton loading={loading} text="Add Author" />
        </div>
      </form>
    </div>
  );
}
