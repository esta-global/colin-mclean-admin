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
  gallerypageSchema,
  GalleryPageValues,
  gallerypageInitialValues,
} from "../../validationSchemas/gallerypageSchema";
import { useEffect, useState } from "react";
import { get, post, remove } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function GalleryPageContent() {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const [categories, setCategories] = useState([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
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
      values: GalleryPageValues,
      helpers: FormikHelpers<GalleryPageValues>
    ) {
      setUpdating(true);

      const apiResponse = await post("/gallerypage", values, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: gallerypageInitialValues,
    validationSchema: gallerypageSchema,
  });

  // Get Data From Database
  useEffect(function () {
    async function getData() {
      let url = `/gallerypage`;
      setLoading(true);
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        const apiData = apiResponse.body;
        delete apiData.isDeleted;
        delete apiData.createdAt;
        delete apiData.updatedAt;
        delete apiData._id;
        setValues(apiData);
      } else {
        // toast.error(apiResponse?.message);
      }
      setLoading(false);
    }

    getData();
  }, []);

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
      let url = `${API_URL}/media`;
      const token = localStorage.getItem("token");
      const apiResponse = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        setRecords((old) => {
          return [...apiData.body, ...old];
        });
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // Get Media
  useEffect(
    function () {
      async function getData() {
        let url = `/media?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body);
          setPagination({
            ...pagination,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          });
        } else {
          setRecords([]);
          toast.error(apiResponse?.message);
        }
      }

      getData();
    },
    [pagination.page, pagination.limit, searchQuery]
  );

  function handleSelectImage(img: string) {
    setSelectedImages((prevSelectedImages) => {
      if (prevSelectedImages.includes(img)) {
        // Remove image if it already exists
        return prevSelectedImages.filter((image) => image !== img);
      } else {
        // Add image if it doesn't exist
        return [...prevSelectedImages, img];
      }
    });
  }

  // get category
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/galleryCategories", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setCategories(modifiedValue);
      }
    }
    getData();
  }, []);

  console.log(values);

  return (
    <>
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Gallery Page Content</h4>
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

        {/* Loading */}
        {loading ? <OverlayLoading /> : null}

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <form className="forms-sample" onSubmit={handleSubmit}>
              {/* Page Section */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Page Content</h5>
                    </div>

                    {/* Page Title */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <InputBox
                          label="Page Title"
                          name="pageTitle"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          type="text"
                          placeholder="Enter title"
                          value={values.pageTitle}
                          required={false}
                          touched={touched.pageTitle}
                          error={errors.pageTitle}
                        />
                      </div>
                    </div>

                    {/* Page Sub Title */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <InputBox
                          label="Page Sub Title"
                          name="pageSubTitle"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          type="text"
                          placeholder="Enter sub title"
                          value={values.pageSubTitle}
                          required={false}
                          touched={touched.pageSubTitle}
                          error={errors.pageSubTitle}
                        />
                      </div>
                    </div>

                    {/* Page Content */}
                    <div className="col-md-12 form-group">
                      <label htmlFor={""} className="mb-2">
                        Page Content
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values.pageContent || ""}
                        onChange={(__, editor) => {
                          const data = editor.getData();
                          setFieldValue("pageContent", data);
                        }}
                        onBlur={() => {
                          setFieldTouched("pageContent", true);
                        }}
                        onFocus={() => {}}
                        id={"pageContent"}
                      />
                      {errors.pageContent && touched.pageContent ? (
                        <p className="custom-form-error text-danger">
                          {errors.pageContent}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Breadcrumb Section */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Breadcrumb Section</h5>
                    </div>

                    <div className="form-group col-md-12">
                      <label htmlFor={"breadcrumbBannerFile"}>
                        Breadcrumb Banner Image (1600 X 583PX)
                        {/* <span className="text-danger"> *</span> */}
                      </label>

                      {values.breadcrumbBanner ? (
                        <div
                          className="col-md-12 mx-auto text-center"
                          style={{ position: "relative" }}
                        >
                          <button
                            type="button"
                            className="btn btn-danger p-image-remove"
                            onClick={(evt) => {
                              evt.preventDefault();
                              setFieldValue("breadcrumbBanner", "");
                            }}
                          >
                            X
                          </button>
                          <img
                            style={{
                              height: "100px",
                              objectFit: "cover",
                              // width: "100%",
                            }}
                            src={addUrlToFile(values.breadcrumbBanner)}
                            alt=""
                          />
                        </div>
                      ) : (
                        <div>
                          <button
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#selectImageFileModal"
                            onClick={() => {
                              setSelectedFileFor("breadcrumbBanner");
                            }}
                            style={{ width: "100%" }}
                          >
                            <img
                              src="/images/select-photo.png"
                              style={{
                                borderRadius: "0px",
                                height: "90px",
                                // width: "100%",
                              }}
                            />
                          </button>
                        </div>
                      )}

                      {touched.breadcrumbBanner && errors.breadcrumbBanner ? (
                        <p className="custom-form-error text-danger">
                          {errors.breadcrumbBanner}
                        </p>
                      ) : null}
                    </div>

                    <div className="form-group col-md-12">
                      <InputBox
                        label="Breadcrumb Title"
                        name="breadcrumbTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter title"
                        value={values.breadcrumbTitle}
                        required={false}
                        touched={touched.breadcrumbTitle}
                        error={errors.breadcrumbTitle}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* META Details */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">META Details</h5>
                    </div>
                    <div className="form-group col-md-12">
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
                    <div className="form-group col-md-12">
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

                    <div className="form-group col-md-12">
                      <TextareaBox
                        label="Meta Keywords"
                        name="metaKeywords"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        placeholder="Enter meta keywords (comma saparated values)"
                        value={values.metaKeywords}
                        touched={touched.metaKeywords}
                        error={errors.metaKeywords}
                      />
                    </div>

                    <div className="">
                      <SubmitButton loading={updating} text="Update Details" />
                    </div>
                  </div>
                </div>
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
                      <div
                        className={
                          values.breadcrumbBanner == item.filename
                            ? "card selected-img"
                            : "card"
                        }
                      >
                        <div
                          onClick={() => {
                            values.breadcrumbBanner == item.filename;
                            setFieldValue("breadcrumbBanner", item.filename);
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
