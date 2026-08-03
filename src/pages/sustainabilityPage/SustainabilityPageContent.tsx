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
  sustainabilityPageSchema,
  SustainabilityPageValues,
  sustainabilityPageInitialValues,
} from "../../validationSchemas/sustainabilityPageSchema";
import { useEffect, useState } from "react";
import { get, post, remove } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function SustainabilityPageContent() {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFileFor, setSelectedFileFor] = useState("");

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
    setFieldError,
    setValues,
  } = useFormik({
    onSubmit: async function (
      values: SustainabilityPageValues,
      helpers: FormikHelpers<SustainabilityPageValues>
    ) {
      setUpdating(true);

      const apiResponse = await post("/sustainibilityPage", values, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: sustainabilityPageInitialValues,
    validationSchema: sustainabilityPageSchema,
  });

  // Get Data From Database
  useEffect(function () {
    async function getData() {
      let url = `/sustainibilityPage`;
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
        setUpdating(true);
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
        setUpdating(false);
      }

      getData();
    },
    [pagination.page, pagination.limit, searchQuery]
  );

  function handleSelectImage(img: any) {
    if (selectedFileFor == "firstSectionFirstImage") {
      setFieldValue("firstSectionFirstImage", img.filename);
    }
    if (selectedFileFor == "firstSectionSecondImage") {
      setFieldValue("firstSectionSecondImage", img.filename);
    }

    if (selectedFileFor == "secondSectionImage") {
      setFieldValue("secondSectionImage", img.filename);
    }

    if (selectedFileFor == "thirdSectionImage") {
      setFieldValue("thirdSectionImage", img.filename);
    }

    if (selectedFileFor == "breadcrumbBanner") {
      setFieldValue("breadcrumbBanner", img.filename);
    }
  }

  return (
    <>
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">
                  Sustainability Page Content
                </h4>
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

              {/* First Section */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">First Section</h5>
                    </div>

                    <div className="col-md-6">
                      <div className="row">
                        {/* First Section Title */}
                        <div className="form-group">
                          <InputBox
                            label="First Section Title"
                            name="firstSectionTitle"
                            handleBlur={handleBlur}
                            handleChange={handleChange}
                            type="text"
                            placeholder="Enter title"
                            value={values.firstSectionTitle}
                            required={false}
                            touched={touched.firstSectionTitle}
                            error={errors.firstSectionTitle}
                          />
                        </div>

                        {/* First Section Sub Title */}
                        <div className="form-group">
                          <InputBox
                            label="First Section Sub Title"
                            name="firstSectionSubTitle"
                            handleBlur={handleBlur}
                            handleChange={handleChange}
                            type="text"
                            placeholder="Enter sub title"
                            value={values.firstSectionSubTitle}
                            required={false}
                            touched={touched.firstSectionSubTitle}
                            error={errors.firstSectionSubTitle}
                          />
                        </div>
                      </div>
                    </div>

                    {/* First Section */}
                    <div className="col-md-6">
                      <div className="row">
                        <div className="col-md-5">
                          <div className="p-md-4">
                            {values?.firstSectionFirstImage ? (
                              <button
                                type="button"
                                data-bs-toggle="modal"
                                style={{ width: "100%" }}
                                data-bs-target="#selectImageFileModal"
                                onClick={() => {
                                  setSelectedFileFor("firstSectionFirstImage");
                                }}
                              >
                                <img
                                  src={addUrlToFile(
                                    values?.firstSectionFirstImage
                                  )}
                                  style={{
                                    borderRadius: "0px",
                                    height: "90px",
                                    // width: "100%",
                                  }}
                                />
                              </button>
                            ) : (
                              <button
                                type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#selectImageFileModal"
                                style={{ width: "100%" }}
                                onClick={() => {
                                  setSelectedFileFor("firstSectionFirstImage");
                                }}
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
                            )}
                            <p>600 X 862 PX</p>
                          </div>
                        </div>

                        <div className="col-md-5">
                          <div className="p-md-4 mt-3">
                            {values?.firstSectionSecondImage ? (
                              <button
                                type="button"
                                data-bs-toggle="modal"
                                style={{ width: "100%" }}
                                data-bs-target="#selectImageFileModal"
                                onClick={() => {
                                  setSelectedFileFor("firstSectionSecondImage");
                                }}
                              >
                                <img
                                  src={addUrlToFile(
                                    values?.firstSectionSecondImage
                                  )}
                                  style={{
                                    borderRadius: "0px",
                                    height: "90px",
                                    // width: "100%",
                                  }}
                                />
                              </button>
                            ) : (
                              <button
                                type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#selectImageFileModal"
                                style={{ width: "100%" }}
                                onClick={() => {
                                  setSelectedFileFor("firstSectionSecondImage");
                                }}
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
                            )}
                            <p>600 X 862 PX</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* First Section Content */}
                    <div className="col-md-12 form-group">
                      <label htmlFor={""} className="mb-2">
                        First Section Content
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values.firstSectionContent || ""}
                        onChange={(__, editor) => {
                          const data = editor.getData();
                          setFieldValue("firstSectionContent", data);
                        }}
                        onBlur={() => {
                          setFieldTouched("firstSectionContent", true);
                        }}
                        onFocus={() => {}}
                        id={"firstSectionContent"}
                      />
                      {errors.firstSectionContent &&
                      touched.firstSectionContent ? (
                        <p className="custom-form-error text-danger">
                          {errors.firstSectionContent}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Section */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Second Section</h5>
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Second Section Title"
                        name="secondSectionTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter title"
                        value={values.secondSectionTitle}
                        required={false}
                        touched={touched.secondSectionTitle}
                        error={errors.secondSectionTitle}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Second Section Sub Title"
                        name="secondSectionSubTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter sub title"
                        value={values.secondSectionSubTitle}
                        required={false}
                        touched={touched.secondSectionSubTitle}
                        error={errors.secondSectionSubTitle}
                      />
                    </div>

                    <div className="form-group col-md-12">
                      <label htmlFor={"secondSectionImageFile"}>
                        Second Section Image ()
                        {/* <span className="text-danger"> *</span> */}
                      </label>

                      {values.secondSectionImage ? (
                        <div
                          className="col-md-12 mx-auto text-center"
                          style={{ position: "relative" }}
                        >
                          <button
                            type="button"
                            className="btn btn-danger p-image-remove"
                            onClick={(evt) => {
                              evt.preventDefault();
                              setFieldValue("secondSectionImage", "");
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
                            src={addUrlToFile(values.secondSectionImage)}
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
                              setSelectedFileFor("secondSectionImage");
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

                      {touched.secondSectionImage &&
                      errors.secondSectionImage ? (
                        <p className="custom-form-error text-danger">
                          {errors.secondSectionImage}
                        </p>
                      ) : null}
                    </div>

                    {/* Second Section Content */}
                    <div className="col-md-12 form-group">
                      <label htmlFor={""} className="mb-2">
                        Second Section Content
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values.secondSectionContent || ""}
                        onChange={(__, editor) => {
                          const data = editor.getData();
                          setFieldValue("secondSectionContent", data);
                        }}
                        onBlur={() => {
                          setFieldTouched("secondSectionContent", true);
                        }}
                        onFocus={() => {}}
                        id={"secondSectionContent"}
                      />
                      {errors.secondSectionContent &&
                      touched.secondSectionContent ? (
                        <p className="custom-form-error text-danger">
                          {errors.secondSectionContent}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Third Section */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Third Section</h5>
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Third Section Title"
                        name="thirdSectionTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter title"
                        value={values.thirdSectionTitle}
                        required={false}
                        touched={touched.thirdSectionTitle}
                        error={errors.thirdSectionTitle}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Third Section Sub Title"
                        name="thirdSectionSubTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter sub title"
                        value={values.thirdSectionSubTitle}
                        required={false}
                        touched={touched.thirdSectionSubTitle}
                        error={errors.thirdSectionSubTitle}
                      />
                    </div>

                    <div className="form-group col-md-12">
                      <label htmlFor={"thirdSectionImageFile"}>
                        Third Section Image
                        {/* <span className="text-danger"> *</span> */}
                      </label>

                      {values.thirdSectionImage ? (
                        <div
                          className="col-md-12 mx-auto text-center"
                          style={{ position: "relative" }}
                        >
                          <button
                            type="button"
                            className="btn btn-danger p-image-remove"
                            onClick={(evt) => {
                              evt.preventDefault();
                              setFieldValue("thirdSectionImage", "");
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
                            src={addUrlToFile(values.thirdSectionImage)}
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
                              setSelectedFileFor("thirdSectionImage");
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

                      {touched.thirdSectionImage && errors.thirdSectionImage ? (
                        <p className="custom-form-error text-danger">
                          {errors.thirdSectionImage}
                        </p>
                      ) : null}
                    </div>

                    {/* Third Section Content */}
                    <div className="col-md-12 form-group">
                      <label htmlFor={""} className="mb-2">
                        Third Section Content
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values.thirdSectionContent || ""}
                        onChange={(__, editor) => {
                          const data = editor.getData();
                          setFieldValue("thirdSectionContent", data);
                        }}
                        onBlur={() => {
                          setFieldTouched("thirdSectionContent", true);
                        }}
                        onFocus={() => {}}
                        id={"thirdSectionContent"}
                      />
                      {errors.thirdSectionContent &&
                      touched.thirdSectionContent ? (
                        <p className="custom-form-error text-danger">
                          {errors.thirdSectionContent}
                        </p>
                      ) : null}
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
                      <div className={"card"}>
                        <div
                          onClick={() => {
                            handleSelectImage(item);
                          }}
                          data-bs-dismiss="modal"
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
