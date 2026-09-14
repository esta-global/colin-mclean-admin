import { GoBackButton, InputBox, Pagination, SubmitButton } from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  authorSchema,
  AuthorValues,
  authorInitialValues,
} from "../../validationSchemas/authorSchema";
import { useEffect, useState } from "react";
import { get, put } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

type MediaRecord = { _id?: string; filename: string };

export function EditAuthor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 36,
    totalRecords: 0,
    totalPages: 0,
  });

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setValues,
    setFieldError,
    setFieldTouched,
    setFieldValue,
  } = useFormik({
    onSubmit: async function (
      values: AuthorValues,
      helpers: FormikHelpers<AuthorValues>
    ) {
      setLoading(true);

      const apiResponse = await put(`/authors/${id}`, values);

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

  useEffect(
    function () {
      async function getData(id: string) {
        let url = `/authors/${id}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          apiData.status = `${apiData.status}`;
          delete apiData.isDeleted;
          delete apiData.createdAt;
          delete apiData.updatedAt;
          delete apiData._id;
          setValues(apiData);
        } else {
          toast.error(apiResponse?.message);
        }
      }

      if (id) getData(id);
    },
    [id]
  );

  useEffect(
    function () {
      async function fetchMedia() {
        let url = `/media?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body || []);
          setPagination((oldPagination) => ({
            ...oldPagination,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          }));
        } else {
          setRecords([]);
        }
      }

      fetchMedia();
    },
    [pagination.page, pagination.limit, searchQuery]
  );

  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const uploaded = await uploadFiles(Array.from(event.target.files || []));
    if (uploaded[0]?.filename) setFieldValue("profilePhoto", uploaded[0].filename);
    event.target.value = "";
  }

  async function uploadFiles(files: File[]) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((file) => {
      if (!mimeTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WEBP images are allowed.");
        return;
      }
      formData.append("files", file);
    });

    if (!formData.has("files")) return [];

    try {
      setUploadingPhoto(true);
      const token = localStorage.getItem("token");
      const apiResponse = await fetch(`${API_URL}/media`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        setFieldTouched("profilePhoto", false);
        setFieldError("profilePhoto", "");
        setRecords((oldRecords) => [...apiData.body, ...oldRecords]);
        toast.success(apiData.message || "Image uploaded successfully");
        return apiData.body as MediaRecord[];
      }

      toast.error(apiData?.message || "Failed to upload image");
      return [];
    } catch (error: any) {
      toast.error(error?.message);
      return [];
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handlePasteImage(event: React.ClipboardEvent<HTMLButtonElement>) {
    const pastedImages = Array.from(event.clipboardData.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (!pastedImages.length) return;

    event.preventDefault();
    const uploaded = await uploadFiles(pastedImages.slice(0, 1));
    if (uploaded[0]?.filename) setFieldValue("profilePhoto", uploaded[0].filename);
  }

  function handleSelectImage(img: MediaRecord) {
    setFieldTouched("profilePhoto", false);
    setFieldError("profilePhoto", "");
    setFieldValue("profilePhoto", img.filename);
  }

  function handleDeleteFile(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setFieldError("profilePhoto", "");
    setFieldValue("profilePhoto", "");
  }

  return (
    <div className="content-wrapper author-form-page" onPaste={handlePasteImage}>
      <div className="author-form-header">
        <div className="author-form-header__content">
          <div className="author-form-header__actions">
            <GoBackButton />
            <span className="author-page-eyebrow">Blog authors</span>
          </div>
          <h1>Edit Author</h1>
          <p>
            Update this author profile, publishing status, and profile photo for
            blog attribution.
          </p>
        </div>
        <div className="author-form-header__meta">
          <span className="author-form-pill">Editing author</span>
          <span className="author-form-note">
            {values.status == "true" ? "Currently active" : "Currently hidden"}
          </span>
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
                        </span>
                      </label>
                    </div>
                    {errors.status && touched.status ? (
                      <p className="custom-form-error text-danger">
                        {errors.status}
                      </p>
                    ) : null}
                  </div>
                  <div className="col-md-12">
                    <div className="author-form-inline-actions">
                      <SubmitButton loading={loading} text="Update Author" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </main>

          <aside className="author-form-side">
            <div className="card author-form-card author-form-preview-card">
              <div className="card-body">
                <span className="author-form-side-kicker">Preview</span>
                <div className="author-form-preview-photo-wrap">
                  <button
                    aria-label="Select profile photo"
                    className="author-form-preview-photo author-form-preview-photo--action"
                    data-bs-target="#selectAuthorPhotoModal"
                    data-bs-toggle="modal"
                    disabled={uploadingPhoto}
                    onClick={() => setFieldTouched("profilePhoto", true)}
                    onPaste={handlePasteImage}
                    type="button"
                  >
                    {values.profilePhoto ? (
                      <img src={addUrlToFile(values.profilePhoto)} alt="" />
                    ) : (
                      <i className="fa fa-user"></i>
                    )}
                    <span className="author-photo-action-hint">
                      <i className={uploadingPhoto ? "fa fa-spinner fa-spin" : "fa fa-images"}></i>
                    </span>
                  </button>
                  {values.profilePhoto ? (
                    <button
                      type="button"
                      className="author-photo-remove"
                      aria-label="Remove profile photo"
                      onClick={(evt) => {
                        handleDeleteFile(evt);
                      }}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  ) : null}
                </div>
                {touched.profilePhoto && errors.profilePhoto ? (
                  <p className="custom-form-error text-danger mt-2">
                    {errors.profilePhoto}
                  </p>
                ) : null}
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
      </form>

      <div
        className="modal fade"
        id="selectAuthorPhotoModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectAuthorPhotoModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectAuthorPhotoModalLabel">
                Select Profile Photo
              </h1>
              <input
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingPhoto}
                onChange={handleUploadFile}
                type="file"
              />
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="about-page-media-toolbar">
                <input
                  className="form-control"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search media"
                  type="search"
                  value={searchQuery}
                />
              </div>
              <div className="row mb-2 gy-2 media-list-section">
                {records.map((item) => (
                  <div className="col-md-2 col-4" key={item._id || item.filename}>
                    <button
                      className="about-page-media-card"
                      data-bs-dismiss="modal"
                      onClick={() => handleSelectImage(item)}
                      type="button"
                    >
                      <img src={addUrlToFile(item.filename)} alt="" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-3">
              <Pagination
                pagination={pagination}
                setPagination={setPagination}
                tableName="table-to-xls"
                csvFileName="images"
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary px-3 py-2" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
