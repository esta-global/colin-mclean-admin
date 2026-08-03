import {
  GoBackButton,
  InputBox,
  OverlayLoading,
  Pagination,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  privacyPolicyPageSchema,
  PrivacyPolicyPageValues,
  privacyPolicyInitialValues,
} from "../../validationSchemas/privacyPolicyPageSchema";
import { useEffect, useState } from "react";
import { get, post } from "../../utills";
import { toast } from "react-toastify";
import { API_URL } from "../../constants";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { addUrlToFile } from "../../utills/addUrlToFile";

type MediaRecord = {
  filename: string;
};

type MediaUploadResponse = {
  status?: number;
  body?: MediaRecord[];
};

function getPrivacyPolicyPayload(values: PrivacyPolicyPageValues) {
  const payload = { ...values };

  delete payload.subTitle;
  delete payload._id;
  delete payload.__v;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;

  return payload;
}

export function PrivacyPolicyPageContent() {
  const [updating, setUpdating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFileFor] = useState("");

  const [searchQuery] = useState<string>("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 60,
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
    setFieldValue,
    setFieldTouched,
    setValues,
  } = useFormik({
    onSubmit: async function (
      values: PrivacyPolicyPageValues,
      helpers: FormikHelpers<PrivacyPolicyPageValues>,
    ) {
      setUpdating(true);
      const apiResponse = await post("/privacyPolicy", getPrivacyPolicyPayload(values), true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        // navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: privacyPolicyInitialValues,
    validationSchema: privacyPolicyPageSchema,
  });

  // Get Data From Database
  useEffect(function () {
    async function getData() {
      const url = `/privacyPolicy`;
      setLoading(true);
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setValues(getPrivacyPolicyPayload(apiResponse.body));
      } else {
        // toast.error(apiResponse?.message);
      }
      setLoading(false);
    }

    getData();
  }, [setValues]);

  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/jpeg", "image/png", "image/webp"];

    const files = event.target.files;
    // const inputElementName = event.target.name;

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
        toast.error("Please select at least one file.");
      } else {
        formData.append("files", file);
      }
    }

    try {
      const url = `${API_URL}/media`;
      const token = localStorage.getItem("token");
      const apiResponse = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const apiData = (await apiResponse.json()) as MediaUploadResponse;

      if (apiData.status == 200) {
        setRecords((old) => {
          return [...(apiData.body || []), ...old];
        });
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to upload file");
    }
  }

  // Get Media
  useEffect(
    function () {
      async function getData() {
        setUpdating(true);
        let url = `/media?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body);
          setPagination((current) => ({
            ...current,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          }));
        } else {
          setRecords([]);
          toast.error(apiResponse?.message);
        }
        setUpdating(false);
      }

      getData();
    },
    [pagination.page, pagination.limit, searchQuery],
  );

  function handleSelectImage(img: MediaRecord) {
    if (selectedFileFor == "insightSectionFirstImage") {
      setFieldValue("insightSectionFirstImage", img.filename);
    }
    if (selectedFileFor == "fourthSectiontImage") {
      setFieldValue("fourthSectiontImage", img.filename);
    }

    if (selectedFileFor == "bannerImg") {
      setFieldValue("bannerImg", img.filename);
    }

    if (selectedFileFor == "breadcrumbBanner") {
      setFieldValue("breadcrumbBanner", img.filename);
    }

    if (selectedFileFor == "thirdSectionFirstImage") {
      setFieldValue("thirdSectionFirstImage", img.filename);
    }

    if (selectedFileFor == "thirdSectionSecondImage") {
      setFieldValue("thirdSectionSecondImage", img.filename);
    }

    if (selectedFileFor == "aboutSectionImage") {
      setFieldValue("aboutSectionImage", img.filename);
    }
  }

  return (
    <>
      <div className="content-wrapper terms-admin-page">
        <div className="terms-page-header">
          <div className="terms-page-header__content">
            <div className="terms-page-header__actions">
              <GoBackButton />
              <span className="terms-page-eyebrow">IFMA Admin</span>
            </div>
            <h1>Privacy Policy</h1>
            <p>
              Update the privacy policy content, SEO title, description, and
              search keywords shown on the storefront privacy page.
            </p>
          </div>
          <div className="terms-page-header__meta">
            <span className="terms-status-pill">Live page content</span>
            <span className="terms-status-note">SEO ready</span>
          </div>
        </div>

        {/* Loading */}
        {loading ? <OverlayLoading /> : null}

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <form className="forms-sample" onSubmit={handleSubmit}>
              <div className="terms-editor-layout">
                <div className="terms-editor-main">
                  <div className="card terms-card">
                    <div className="card-body">
                      <div className="terms-card-heading">
                        <div>
                          <span className="terms-section-kicker">Page copy</span>
                          <h2>Privacy policy content</h2>
                        </div>
                        <span className="terms-soft-chip">Primary</span>
                      </div>

                      <div className="form-group">
                        <InputBox
                          label="Title"
                          name="title"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          type="text"
                          placeholder="Enter title"
                          value={values.title}
                          required={false}
                          touched={touched.title}
                          error={errors.title}
                        />
                      </div>

                      <div className="form-group mb-0">
                        <label htmlFor="content" className="mb-2">
                          Content
                        </label>
                        <div className="terms-editor-shell">
                          <CKEditor
                            editor={ClassicEditor as unknown as never}
                            data={values.content || ""}
                            onChange={(__, editor) => {
                              const data = editor.getData();
                              setFieldValue("content", data);
                            }}
                            onBlur={() => {
                              setFieldTouched("content", true);
                            }}
                            onFocus={() => {}}
                            id={"content"}
                          />
                        </div>
                        {errors.content && touched.content ? (
                          <p className="custom-form-error text-danger">
                            {errors.content}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="terms-editor-side">
                  <div className="card terms-card terms-summary-card">
                    <div className="card-body">
                      <span className="terms-section-kicker">Publishing</span>
                      <h2>Content checklist</h2>
                      <ul className="terms-check-list">
                        <li>
                          <i className="ti-check"></i>
                          Clear policy title
                        </li>
                        <li>
                          <i className="ti-check"></i>
                          Updated privacy sections
                        </li>
                        <li>
                          <i className="ti-check"></i>
                          Search metadata
                        </li>
                      </ul>
                      <div className="terms-summary-stat">
                        <span>Content status</span>
                        <strong>{values.content ? "Ready to update" : "Draft"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card terms-card">
                    <div className="card-body">
                      <div className="terms-card-heading">
                        <div>
                          <span className="terms-section-kicker">SEO</span>
                          <h2>Meta details</h2>
                        </div>
                      </div>
                      <div className="form-group">
                        <InputBox
                          label="Meta Title"
                          name="metaTitle"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          type="text"
                          placeholder="Enter meta title"
                          value={values.metaTitle}
                          touched={touched.metaTitle}
                          error={errors.metaTitle}
                        />
                      </div>
                      <div className="form-group">
                        <TextareaBox
                          label="Meta Description"
                          name="metaDescription"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          placeholder="Enter meta description"
                          value={values.metaDescription}
                          touched={touched.metaDescription}
                          error={errors.metaDescription}
                        />
                      </div>

                      <div className="form-group mb-0">
                        <TextareaBox
                          label="Meta Keywords"
                          name="metaKeywords"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          placeholder="Enter meta keywords (comma separated values)"
                          value={values.metaKeywords}
                          touched={touched.metaKeywords}
                          error={errors.metaKeywords}
                        />
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="terms-sticky-actions">
                <div>
                  <strong>Privacy Policy</strong>
                  <span>Changes will update the live page content.</span>
                </div>
                <SubmitButton loading={updating} text="Update Details" />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Select Existing Files */}
      <div
        className="modal fade"
        id="selectImageFileModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectImageFileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5 me-2"
                id="selectImageFileModalLabel"
              >
                Select Image
              </h1>

              <input type="file" onChange={handleUploadFile} />

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row mb-2 gy-2 media-list-section">
                {records?.map((item) => {
                  return (
                    <div className="col-md-2 col-4">
                      <div className={"card"}>
                        <div
                          // className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                          onClick={() => {
                            handleSelectImage(item);
                          }}
                        >
                          <img src={addUrlToFile(item.filename)} alt="" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive px-3">
                  <Pagination
                    pagination={pagination}
                    setPagination={setPagination}
                    tableName={"table-to-xls"}
                    csvFileName={"images"}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary px-3 py-2"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              {/* <button
                type="button"
                className="btn btn-primary px-3 py-2"
                data-bs-dismiss="modal"
                onClick={handleAddImages}
                disabled={selectedImages.length ? false : true}
              >
                Okay
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
