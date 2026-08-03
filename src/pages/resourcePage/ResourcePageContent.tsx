import {
  GoBackButton,
  InputBox,
  OverlayLoading,
  Pagination,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import { FaFilePdf } from "react-icons/fa";
import {
  resourcePageSchema,
  ResourcePageValues,
  resourcePageInitialValues,
} from "../../validationSchemas/resourcePageSchema";
import { useEffect, useState } from "react";
import { get, post } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function ResourcePageContent() {
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
    setValues,
  } = useFormik({
    onSubmit: async function (
      values: ResourcePageValues,
      helpers: FormikHelpers<ResourcePageValues>
    ) {
      setUpdating(true);

      const apiResponse = await post("/resourcePage", values, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: resourcePageInitialValues,
    validationSchema: resourcePageSchema,
  });

  // Get Data From Database
  useEffect(function () {
    async function getData() {
      let url = `/resourcePage`;
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

  // handleUploadCatalogFile
  async function handleUploadCatalogFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const mimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

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
        setFieldValue("catalogFile", apiData.body[0].filename);
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
    // if (selectedFileFor == "thirdSectionImage") {
    //   setFieldValue("thirdSectionImage", img.filename);
    // }

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
                <h4 className="font-weight-bold mb-0">Resource Page Content</h4>
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
          <div className="col-md-12 grid-margin">
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

              {/* Catalog */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Catalog</h5>
                    </div>

                    <div className="col-md-12">
                      <div className="row">
                        {/* Catalog Title */}
                        <div className="form-group">
                          <InputBox
                            label="Catalog Title"
                            name="catalogTitle"
                            handleBlur={handleBlur}
                            handleChange={handleChange}
                            type="text"
                            placeholder="Enter title"
                            value={values.catalogTitle}
                            required={false}
                            touched={touched.catalogTitle}
                            error={errors.catalogTitle}
                          />
                        </div>
                      </div>

                      <div className="form-group col-md-12">
                        <label htmlFor={"breadcrumbBannerFile"}>
                          Catalogue File
                          {/* <span className="text-danger"> *</span> */}
                        </label>

                        {values.catalogFile ? (
                          <div
                            className="col-md-12 mx-auto text-center"
                            style={{ position: "relative" }}
                          >
                            <button
                              type="button"
                              className="btn btn-danger p-image-remove"
                              onClick={(evt) => {
                                evt.preventDefault();
                                setFieldValue("catalogFile", "");
                              }}
                            >
                              X
                            </button>
                            <a
                              href={addUrlToFile(values.catalogFile)}
                              target="_blank"
                              className="btn btn-info"
                            >
                              <FaFilePdf />
                              Catalog File
                            </a>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              onChange={handleUploadCatalogFile}
                            />
                          </div>
                        )}

                        {touched.catalogFile && errors.catalogFile ? (
                          <p className="custom-form-error text-danger">
                            {errors.catalogFile}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Title */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Page Title</h5>
                    </div>

                    <div className="col-md-12">
                      <div className="row">
                        {/* Enter Title */}
                        <div className="form-group">
                          <InputBox
                            label="Enter Title"
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Us */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Contact Us</h5>
                    </div>

                    <div className="col-md-12">
                      <div className="row">
                        {/* Contact Us Title */}
                        <div className="form-group">
                          <InputBox
                            label="Contact Us Title"
                            name="contactUsTitle"
                            handleBlur={handleBlur}
                            handleChange={handleChange}
                            type="text"
                            placeholder="Enter title"
                            value={values.contactUsTitle}
                            required={false}
                            touched={touched.contactUsTitle}
                            error={errors.contactUsTitle}
                          />
                        </div>

                        {/* Call Us Title */}
                        <div className="form-group">
                          <InputBox
                            label="Call Us Title"
                            name="callUsTitle"
                            handleBlur={handleBlur}
                            handleChange={handleChange}
                            type="text"
                            placeholder="Enter title"
                            value={values.callUsTitle}
                            required={false}
                            touched={touched.callUsTitle}
                            error={errors.callUsTitle}
                          />
                        </div>

                        {/* Call Us Mobile */}
                        <div className="form-group">
                          <InputBox
                            label="Call Us Mobile"
                            name="contactUsMobile"
                            handleBlur={handleBlur}
                            handleChange={handleChange}
                            type="text"
                            placeholder="Enter mobile"
                            value={values.contactUsMobile}
                            required={false}
                            touched={touched.contactUsMobile}
                            error={errors.contactUsMobile}
                          />
                        </div>
                      </div>
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
                Select File
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
