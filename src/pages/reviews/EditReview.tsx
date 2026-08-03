import {
  CustomSelect,
  GoBackButton,
  InputBox,
  Pagination,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  productReviewSchema,
  ProductReviewValues,
  productInitialValues,
} from "../../validationSchemas/productReviewSchema";
import { useEffect, useState } from "react";
import { get, put } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile, getMediaType } from "../../utills/addUrlToFile";
import moment from "moment";

export function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);

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
      values: ProductReviewValues,
      helpers: FormikHelpers<ProductReviewValues>
    ) {
      setLoading(true);

      const newValue = {
        ...values,
        user: values.user?.value,
        product: values.product?.value,
        media: uploadedMedia,
      };

      const apiResponse = await put(`/productReviews/${id}`, newValue);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);

        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: productInitialValues,
    validationSchema: productReviewSchema,
  });

  // get products
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/products?limit=0&status=true", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setProducts(modifiedValue);
      }
    }
    getData();
  }, []);

  // get users
  useEffect(function () {
    async function getData() {
      const apiResponse = await get(`/users?status=true`, true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name || "N/A",
            value: value._id,
          };
        });
        setUsers(modifiedValue);
      }
    }
    getData();
  }, []);

  // get product reviews
  useEffect(
    function () {
      async function getData(id: string) {
        const apiResponse = await get(`/productReviews/${id}`, true);
        if (apiResponse?.status == 200) {
          let body = apiResponse?.body;
          body.user = {
            label: body?.user?.name,
            value: body?.user?._id,
          };

          delete body._id;
          delete body.createdAt;
          delete body.updatedAt;
          delete body.isDeleted;
          delete body.reviewTitle;

          body.product = {
            label: body?.product?.name,
            value: body?.product?._id,
          };

          setUploadedMedia(body.media);

          setValues(body);
        }
      }
      if (id) getData(id);
    },
    [id]
  );

  // Get Media
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/media?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status) url += `&status=${status}`;

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
        setLoading(false);
      }

      getData();
    },
    [pagination.page, pagination.limit, searchQuery, status]
  );

  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];

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
        let images = apiData?.body?.map((item: any) => {
          return item.filename;
        });

        setUploadedMedia((old) => {
          return [...old, ...images];
        });
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
    index: number
  ) {
    event.preventDefault();
    try {
      // const apiResponse = await remove(`/fileUploads/${fileName}`);

      let images = [...uploadedMedia];
      images.splice(index, 1);
      setUploadedMedia(images);

      // if (apiResponse?.status == 200) {
      //   let images = [...uploadedMedia];
      //   images.splice(index, 1);
      //   setUploadedMedia(images);
      // } else {
      //   let images = [...uploadedMedia];
      //   images.splice(index, 1);
      //   setUploadedMedia(images);
      // }
    } catch (error: any) {
      toast.error(error?.message);
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
                <h4 className="font-weight-bold mb-0">Edit Review</h4>
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
              <div className="card rounded-2">
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-6">
                      <CustomSelect
                        label="Select User"
                        placeholder="Select User"
                        name="user"
                        required={true}
                        options={users}
                        value={values.user}
                        error={errors.user}
                        touched={touched.user}
                        handleChange={(value) => {
                          setFieldValue("user", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("user", true);
                        }}
                        isMulti={false}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Display Name"
                        name="displayName"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter display name"
                        value={values.displayName}
                        required={false}
                        touched={touched.displayName}
                        error={errors.displayName}
                      />
                    </div>
                    {/* <div className="form-group col-md-6">
                    <InputBox
                      label="Review Title"
                      name="reviewTitle"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter review title"
                      value={values.reviewTitle}
                      required={true}
                      touched={touched.reviewTitle}
                      error={errors.reviewTitle}
                    />
                  </div> */}

                    <div className="form-group col-md-6">
                      <CustomSelect
                        label="Select Product"
                        placeholder="Select Product"
                        name="product"
                        required={true}
                        options={products}
                        value={values.product}
                        error={errors.product}
                        touched={touched.product}
                        handleChange={(value) => {
                          setFieldValue("product", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("product", true);
                        }}
                        isMulti={false}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Product Rating"
                        name="rating"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="number"
                        placeholder="Enter rating"
                        value={values.rating}
                        required={true}
                        touched={touched.rating}
                        error={errors.rating}
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label htmlFor="">Select Review Status</label>
                      <select
                        className="form-control"
                        style={{ height: "40px" }}
                        value={values?.reviewStatus}
                        onChange={handleChange}
                        name="reviewStatus"
                      >
                        <option value={"PENDING"}>Pending</option>
                        <option value={"ACTIVE"}>Active</option>
                        <option value={"HOLD"}>Hold</option>
                        <option value={"REJECT"}>Reject</option>
                      </select>
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Review Date"
                        name="reviewDate"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="date"
                        value={moment(values.reviewDate).format("YYYY-MM-DD")}
                        required={true}
                        touched={touched.reviewDate}
                        error={errors.reviewDate}
                      />
                    </div>

                    <div className="form-group col-md-12">
                      <TextareaBox
                        label="Write a review"
                        name="reviewText"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        placeholder="Enter meta description"
                        value={values.reviewText}
                        touched={touched.reviewText}
                        error={errors.reviewText}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Media */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-3">Review Media</h5>
                    </div>

                    <div className="form-group col-md-12">
                      <label
                        className="select-product-section"
                        htmlFor={"imagesFile"}
                      >
                        <div className="d-flex gap-2 align-items-center">
                          <button type="button">
                            <label htmlFor={"imagesFile"} style={{ margin: 0 }}>
                              Upload New
                            </label>
                          </button>

                          <button
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#selectMediaModel"
                          >
                            <label style={{ margin: 0 }}>Select Existing</label>
                          </button>
                        </div>
                        <p className="mt-2">Accept Images (png, jpg, jpeg)</p>
                      </label>

                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          name="imagesFile"
                          id="imagesFile"
                          onChange={(evt) => {
                            handleUploadFile(evt);
                          }}
                          className="form-control"
                          multiple={true}
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex gap-4">
                        {uploadedMedia?.map((file: any, index: number) => {
                          return (
                            <div className="p-image">
                              <button
                                type="button"
                                className="btn btn-danger p-image-remove"
                                onClick={(evt) => {
                                  handleDeleteFile(evt, file, index);
                                }}
                              >
                                X
                              </button>
                              {getMediaType(addUrlToFile(file)) == "image" ? (
                                <img src={addUrlToFile(file)} alt="" />
                              ) : getMediaType(addUrlToFile(file)) ==
                                "video" ? (
                                <video controls height={50} width={50}>
                                  <source
                                    src={addUrlToFile(file)}
                                    type="video/mp4"
                                  />
                                </video>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-md-12 mt-4">
                      <SubmitButton loading={false} text="Update Review" />
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
        id="selectMediaModel"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectMediaModelLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="selectMediaModelLabel">
                Select Media
              </h1>
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
                          uploadedMedia?.includes(item.filename)
                            ? "card selected-img"
                            : "card"
                        }
                      >
                        <div
                          onClick={() => {
                            setUploadedMedia((old) => {
                              if (old.includes(item.filename)) {
                                // Remove it
                                return old.filter(
                                  (name) => name !== item.filename
                                );
                              } else {
                                // Add it
                                return [...old, item.filename];
                              }
                            });
                          }}
                        >
                          {getMediaType(addUrlToFile(item.filename)) ==
                          "image" ? (
                            <img src={addUrlToFile(item.filename)} alt="" />
                          ) : getMediaType(addUrlToFile(item.filename)) ==
                            "video" ? (
                            <video controls height={158} width={158}>
                              <source
                                src={addUrlToFile(item.filename)}
                                type="video/mp4"
                              />
                            </video>
                          ) : null}
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
