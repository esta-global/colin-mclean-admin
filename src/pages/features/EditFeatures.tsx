import {
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  featuresSchema,
  FeaturesValues,
  featuresInitialValues,
} from "../../validationSchemas/featuresSchema";
import { useEffect, useState } from "react";
import {
  get,
  post,
  put,
  remove,
  validateSlug,
  validateTextNumber,
} from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function EditFeatures() {
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
      values: FeaturesValues,
      helpers: FormikHelpers<FeaturesValues>,
    ) {
      setLoading(true);

      const apiResponse = await put(`/features/${id}`, values);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: featuresInitialValues,
    validationSchema: featuresSchema,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        let url = `/features/${id}`;
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
    [id],
  );

  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("image", true);
      setFieldError("image", "Image is required field");
      toast.error("Image is required field");
      setTimeout(() => {
        setFieldError("image", "Image is required field");
      }, 100);
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldError("image", "Must select the valid image file");
      setFieldTouched("image", true);
      toast.error("Must select the valid image file");
      setTimeout(() => {
        setFieldError("image", "Must select a valid image file");
      }, 100);
      return;
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

  // handleDeleteFile
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
        `imageFile`,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear the input field
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
              <h4 className="font-weight-bold mb-0">Edit Features</h4>
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
                    <div className="form-group col-md-6">
                      <InputBox
                        label="Features Name"
                        name="name"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter Features name"
                        value={values.name}
                        required={true}
                        touched={touched.name}
                        error={errors.name}
                      />
                    </div>

                    {/* Slug */}
                    <div className="form-group col-md-6">
                      <InputBox
                        label="Product Slug"
                        name="slug"
                        handleBlur={handleBlur}
                        handleChange={(evt) => {
                          setFieldValue("slug", validateSlug(evt.target.value));
                        }}
                        type="text"
                        placeholder="Enter slug"
                        value={values.slug}
                        required={true}
                        touched={touched.slug}
                        error={errors.slug}
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

                    {/* <div className="form-group col-md-6">
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
                    </div> */}

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
                  </div>
                </div>
              </div>

              {/* Features Image */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Features Image</h5>
                    </div>

                    <div className="mb-3 col-md-6 d-flex justify-content-center flex-column">
                      <div className="input-group">
                        <input
                          type="file"
                          className="form-control"
                          id="imageFile"
                          onChange={(evt) => {
                            handleUploadFile(evt);
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
                        <Link to={`${values.image}`} target="_blank">
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
                            handleDeleteFile(evt, values.image);
                          }}
                        >
                          <i className="fa fa-trash text-danger"></i>
                        </button>
                      ) : null}
                    </div>

                    <div className="">
                      <SubmitButton loading={false} text="Update Features" />
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
