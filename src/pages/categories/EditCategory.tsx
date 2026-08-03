import {
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  categorySchema,
  CategoryValues,
  categoryInitialValues,
} from "../../validationSchemas/categorySchema";
import { useEffect, useState } from "react";
import { get, post, put, remove, validateTextNumber } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(false);

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
      values: CategoryValues,
      helpers: FormikHelpers<CategoryValues>,
    ) {
      setLoading(true);

      const apiResponse = await put(`/categories/${id}`, values);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: categoryInitialValues,
    validationSchema: categorySchema,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        let url = `/categories/${id}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          apiData.status = `${apiData.status}`;
          delete apiData.isDeleted;
          delete apiData.createdAt;
          delete apiData.updatedAt;
          delete apiData._id;
          delete apiData.__v;
          delete apiData.id;
          setValues(apiData);
        } else {
          toast.error(apiResponse?.message);
        }
      }

      if (id) getData(id);
    },
    [id],
  );

  // handleUploadFile
  async function handleUploadFile(
    event: React.ChangeEvent<HTMLInputElement>,
    source?: "MAIN_IMAGE" | "LISTING_IMAGE" | "MEGAMENU_IMAGE",
  ) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      if (source == "MAIN_IMAGE") {
        setFieldTouched("image", true);
        setFieldError("image", "Image is required field");
        toast.error("Image is required field");
        setTimeout(() => {
          setFieldError("image", "Image is required field");
        }, 100);
        return;
      } else if (source == "LISTING_IMAGE") {
        setFieldTouched("listingImage", true);
        return;
      } else {
        setFieldTouched("megamenuImage", true);
        return;
      }
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      if (source == "MAIN_IMAGE") {
        setFieldError("image", "Must select the valid image file");
        setFieldTouched("image", true);
        toast.error("Must select the valid image file");
        setTimeout(() => {
          setFieldError("image", "Must select a valid image file");
        }, 100);
        return;
      } else if (source == "LISTING_IMAGE") {
        setFieldTouched("listingImage", true);
        setFieldError("listingImage", "Must select the valid image file");
        toast.error("Must select the valid image file");
        setTimeout(() => {
          setFieldError("listingImage", "Must select the valid image file");
        }, 100);
        return;
      } else {
        setFieldTouched("megamenuImage", true);
        setFieldError("megamenuImage", "Must select the valid image file");
        toast.error("Must select the valid image file");
        setTimeout(() => {
          setFieldError("megamenuImage", "Must select the valid image file");
        }, 100);
        return;
      }
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
        if (source == "MAIN_IMAGE") {
          setFieldTouched("image", false);
          setFieldError("image", "");
          setFieldValue("image", apiData.body[0].filename);
        } else if (source == "LISTING_IMAGE") {
          setFieldTouched("listingImage", false);
          setFieldError("listingImage", "");
          setFieldValue("listingImage", apiData.body[0].filename);
        } else {
          setFieldTouched("megamenuImage", false);
          setFieldError("megamenuImage", "");
          setFieldValue("megamenuImage", apiData.body[0].filename);
        }
      } else {
        if (source == "MAIN_IMAGE") {
          setFieldTouched("image", false);
          setFieldError("image", apiData.message);
        } else if (source == "LISTING_IMAGE") {
          setFieldTouched("listingImage", false);
          setFieldError("listingImage", apiData.message);
        } else {
          setFieldTouched("megamenuImage", false);
          setFieldError("megamenuImage", apiData.message);
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
    source?: "MAIN_IMAGE" | "LISTING_IMAGE" | "MEGAMENU_IMAGE",
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        if (source == "MAIN_IMAGE") {
          setFieldError("image", "");
          setFieldValue("image", "");
        } else if (source == "LISTING_IMAGE") {
          setFieldError("listingImage", "");
          setFieldValue("listingImage", "");
        } else {
          setFieldError("megamenuImage", "");
          setFieldValue("megamenuImage", "");
        }
      } else {
        if (source == "MAIN_IMAGE") {
          setFieldError("image", "");
          setFieldValue("image", "");
        } else if (source == "LISTING_IMAGE") {
          setFieldError("listingImage", "");
          setFieldValue("listingImage", "");
        } else {
          setFieldError("megamenuImage", "");
          setFieldValue("megamenuImage", "");
        }
        toast.error(apiResponse?.message);
      }

      if (source == "MAIN_IMAGE") {
        const fileInput = document.getElementById(
          `imageFile`,
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
        }
      } else if (source == "LISTING_IMAGE") {
        const fileInput = document.getElementById(
          `listingImageFile`,
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
        }
      } else {
        const fileInput = document.getElementById(
          `imageFileForMegamenu`,
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
        }
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
              <h4 className="font-weight-bold mb-0">Edit Category</h4>
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
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Category Name"
                      name="name"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "name",
                          validateTextNumber(evt.target.value),
                        );
                      }}
                      type="text"
                      placeholder="Enter category name"
                      value={values.name}
                      required={true}
                      touched={touched.name}
                      error={errors.name}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Category Slug"
                      name="slug"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter category slug"
                      value={values.slug}
                      required={true}
                      touched={touched.slug}
                      error={errors.slug}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Text Over Image"
                      name="textOverImage"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter description"
                      value={values.textOverImage}
                      touched={touched.textOverImage}
                      error={errors.textOverImage}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Button Text"
                      name="buttonText"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Button Text"
                      value={values.buttonText}
                      touched={touched.buttonText}
                      error={errors.buttonText}
                    />
                  </div>

                  <div className="form-group col-md-12">
                    <InputBox
                      label="Short Description"
                      name="shortDescription"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter description"
                      value={values.shortDescription}
                      touched={touched.shortDescription}
                      error={errors.shortDescription}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Priority"
                      name="priority"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="number"
                      placeholder="Enter priority"
                      value={values.priority}
                      touched={touched.priority}
                      error={errors.priority}
                      required={true}
                    />
                  </div>

                  <div className="form-group col-md-6">
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

            {/* Category Image */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-2">Category Image (1080X1080 PX)</h5>
                  </div>

                  <div className="mb-3 col-md-6 d-flex justify-content-center flex-column">
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="imageFile"
                        onChange={(evt) => {
                          handleUploadFile(evt, "MAIN_IMAGE");
                        }}
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

                  <div className="col-md-6 text-center">
                    {values.image ? (
                      <Link to={addUrlToFile(values.image)} target="_blank">
                        <img
                          className="img img-fluid rounded bordered"
                          // height={200}
                          width={200}
                          src={addUrlToFile(values.image)}
                        />
                      </Link>
                    ) : null}
                    {values.image ? (
                      <button
                        type="button"
                        className="btn p-1"
                        onClick={(evt) => {
                          handleDeleteFile(evt, values.image, "MAIN_IMAGE");
                        }}
                      >
                        <i className="fa fa-trash text-danger"></i>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Details */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-2">Listing Details</h5>
                  </div>
                  <div className="form-group col-md-12">
                    <InputBox
                      label="Listing Title"
                      name="listingTitle"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter title"
                      value={values.listingTitle}
                      touched={touched.listingTitle}
                      error={errors.listingTitle}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Listing Description"
                      name="listingDescription"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Enter description"
                      value={values.listingDescription}
                      touched={touched.listingDescription}
                      error={errors.listingDescription}
                    />
                  </div>

                  <div className="mb-3 col-md-6 d-flex justify-content-center flex-column gap-1">
                    <div className="form-group mb-0">
                      <label>Listing Image (1940X520 PX)</label>
                    </div>
                    <div className="input-group">
                      <input
                        type="file"
                        name="listingImageFile"
                        id="listingImageFile"
                        onChange={(evt) => {
                          handleUploadFile(evt, "LISTING_IMAGE");
                        }}
                        className="form-control"
                      />
                      <label
                        className="input-group-text"
                        htmlFor="listingImageFile"
                      >
                        Upload
                      </label>
                    </div>
                    {touched.listingImage && errors.listingImage ? (
                      <p className="custom-form-error text-danger">
                        {errors.listingImage}
                      </p>
                    ) : null}
                  </div>

                  <div className="col-md-6 text-center">
                    {values.listingImage ? (
                      <Link
                        to={addUrlToFile(values.listingImage)}
                        target="_blank"
                      >
                        <img
                          className="img img-fluid rounded bordered"
                          // height={43}
                          width={200}
                          src={addUrlToFile(values.listingImage)}
                        />
                      </Link>
                    ) : null}
                    {values.listingImage ? (
                      <button
                        type="button"
                        className="btn p-1"
                        onClick={(evt) => {
                          handleDeleteFile(
                            evt,
                            values.listingImage,
                            "LISTING_IMAGE",
                          );
                        }}
                      >
                        <i className="fa fa-trash text-danger"></i>
                      </button>
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
                    <SubmitButton loading={false} text="Update Category" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
