import {
  CustomSelect,
  GoBackButton,
  Pagination,
  SubmitButton,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  galleryImageSchema,
  GalleryImageValues,
  galleryImageInitialValues,
} from "../../validationSchemas/galleryImageSchema";

import { useEffect, useState } from "react";
import { generateSlug, get, post } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function AddGalleryImage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 60,
    totalRecords: 0,
    totalPages: 0,
  });

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

  const {
    values,
    errors,
    touched,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
  } = useFormik({
    onSubmit: async function (
      values: GalleryImageValues,
      helpers: FormikHelpers<GalleryImageValues>
    ) {
      setLoading(true);

      const newValue = {
        galleryCategory: values?.galleryCategory?.value,
        images: selectedImages,
      };

      const apiResponse = await post("/galleryImages", newValue, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: galleryImageInitialValues,
    validationSchema: galleryImageSchema,
  });

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
        setLoading(true);
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
        setLoading(false);
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

  // Get Iamges for specified category
  useEffect(
    function () {
      async function getData(catId: string) {
        let url = `/galleryImages?galleryCategory=${catId}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;

          if (apiData.length) {
            setSelectedImages(apiData[0]?.images || []);
          } else {
            setSelectedImages([]);
          }
        } else {
          toast.error(apiResponse?.message);
        }
      }

      if (values.galleryCategory?.value) getData(values.galleryCategory?.value);
    },
    [values.galleryCategory?.value]
  );

  return (
    <>
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Add Gallery Image </h4>
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
          <div className="col-md-12 ">
            <form className="forms-sample" onSubmit={handleSubmit}>
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    {/* Select Category */}
                    <div className="form-group col-md-12">
                      <CustomSelect
                        label="Select Gallery Category"
                        placeholder="Select Category"
                        name="galleryCategory"
                        required={true}
                        options={categories}
                        value={values.galleryCategory}
                        error={errors.galleryCategory}
                        touched={touched.galleryCategory}
                        isMulti={false}
                        handleChange={(value) => {
                          setFieldValue("galleryCategory", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("galleryCategory", true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-3">Gallery Images (1024 X 1024 PX)</h5>
                    </div>

                    <div className="form-group col-md-12">
                      <label
                        className="select-product-section"
                        data-bs-toggle="modal"
                        data-bs-target="#selectImageFileModal"
                      >
                        <div className="d-flex gap-2 align-items-center">
                          <button
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#selectImageFileModal"
                          >
                            <label style={{ margin: 0 }}>Select Image</label>
                          </button>
                        </div>
                        <p className="mt-2">Accept Images (png, jpg, jpeg)</p>
                      </label>
                    </div>

                    {selectedImages?.map((item: any) => {
                      return (
                        <div
                          className="col-md-3 text-center mb-2"
                          style={{ position: "relative" }}
                        >
                          <div className="card">
                            <div className="card-body p-1">
                              <button
                                type="button"
                                style={{
                                  height: "30px",
                                  width: "30px",
                                  borderRadius: "15px",
                                  right: 20,
                                  top: 5,
                                }}
                                className="btn btn-danger p-image-remove"
                                onClick={(evt) => {
                                  evt.preventDefault();
                                  handleSelectImage(item);
                                }}
                              >
                                X
                              </button>
                              <img
                                style={{
                                  width: "100%",
                                  objectFit: "cover",
                                  // width: "100%",
                                }}
                                src={addUrlToFile(item)}
                                alt=""
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="">
                      <SubmitButton loading={false} text="Add Image" />
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
                          selectedImages.includes(item.filename)
                            ? "card selected-img"
                            : "card"
                        }
                      >
                        <div
                          onClick={() => {
                            handleSelectImage(item.filename);
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
