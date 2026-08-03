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
  productSchema,
  ProductValues,
  productInitialValues,
} from "../../validationSchemas/productSchema";

import React, { useEffect, useState } from "react";

import { generateSlug, get, post, validateSlug } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import ReactHelmet from "../../components/ui/ReactHelmet";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function AddProductNew() {
  const navigate = useNavigate();

  const [colors, setColors] = useState([]);
  const [features, setFeatures] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  const [, setLoading] = useState<boolean>(false);

  const [selectedImages, setSelectedImages] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<boolean | string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 60,
    totalRecords: 0,
    totalPages: 0,
  });

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
    [pagination.page, pagination.limit, searchQuery, status],
  );

  type PRODUCT_VARIANTS = {
    shape: { label: string; value: string } | null;
    sizes: {
      size: { label: string; value: string } | null;
    }[];
    error: string;
  };
  const [productVariantInputFields, setProductVariantInputFields] = useState<
    PRODUCT_VARIANTS[]
  >([
    {
      shape: null,
      sizes: [
        {
          size: null,
        },
      ],
      error: "",
    },
  ]);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldTouched,
    setFieldValue,
  } = useFormik({
    onSubmit: async function (
      values: ProductValues,
      helpers: FormikHelpers<ProductValues>,
    ) {
      setLoading(true);

      const newValue: any = {
        ...values,
        category: values?.category?.value,
        subCategory: values.subCategory?.value,
        images: selectedImages,
        features: values.features?.map((item) => {
          return item.value;
        }),
        colors: values?.colors?.map((item) => {
          return item.value;
        }),
        materials: values.materials?.map((item) => {
          return item.value;
        }),
        shapes: values.shapes?.map((item) => {
          return item.value;
        }),
        sizes: values.sizes?.map((item) => {
          return item.value;
        }),
      };

      const apiResponse = await post("/products", newValue, true);

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
    validationSchema: productSchema,
  });

  // get Features
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/features?limitt=0", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setFeatures(modifiedValue);
      }
    }
    getData();
  }, []);

  // get category
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/categories", true);
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

  // get sub category
  useEffect(
    function () {
      async function getData() {
        let url = `/subCategories?limit=100`;

        if (values.category) {
          url += `&category=${values.category?.value}`;
        }

        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const modifiedValue = apiResponse?.body?.map((value: any) => {
            return {
              label: value.name,
              value: value._id,
            };
          });
          setSubCategories(modifiedValue);
        }
      }
      getData();
    },
    [values.category],
  );

  // get Size
  useEffect(function () {
    async function getData() {
      let url = `/sizes?limit=0&status=true`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.title,
            value: value._id,
          };
        });
        setSizes(modifiedValue);
      }
    }
    getData();
  }, []);

  // get Shapes
  useEffect(function () {
    async function getData() {
      let url = `/shapes?limit=0&status=true`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setShapes(modifiedValue);
      }
    }
    getData();
  }, []);

  // get Materials
  useEffect(function () {
    async function getData() {
      let url = `/materials?limit=0&status=true`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setMaterials(modifiedValue);
      }
    }
    getData();
  }, []);

  // get Colors
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/colors?limit=0", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setColors(modifiedValue);
      }
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
        let images = apiData?.body?.map((item: any) => {
          return item.filename;
        });

        setUploadedImages((old) => {
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
    index: number,
  ) {
    event.preventDefault();
    try {
      // const apiResponse = await remove(`/fileUploads/${fileName}`);

      let images = [...uploadedImages];
      images.splice(index, 1);
      setUploadedImages(images);

      // if (apiResponse?.status == 200) {
      //   let images = [...uploadedImages];
      //   images.splice(index, 1);
      //   setUploadedImages(images);
      // } else {
      //   let images = [...uploadedImages];
      //   images.splice(index, 1);
      //   setUploadedImages(images);
      // }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  function handleNameChange(evt: React.ChangeEvent<HTMLInputElement>) {
    let value = evt.target.value;
    let name = evt.target.name;
    setFieldValue(name, value);

    let slug = generateSlug(value);
    setFieldValue("slug", slug);
  }

  const handleAddVariantFields = () => {
    setProductVariantInputFields([
      ...productVariantInputFields,
      {
        shape: null,
        sizes: [
          {
            size: null,
          },
        ],
        error: "",
      },
    ]);
  };

  function handleRemoveSelectedImageForProducts(file: string) {
    setSelectedImages((old) => {
      let afterRemoved = old.filter((item) => item != file);
      return afterRemoved;
    });
  }

  return (
    <>
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <ReactHelmet title="Add Product" />
                <h4 className="font-weight-bold mb-0">Add Product</h4>
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
                {/* Basic Details */}
                <div className="card rounded-2">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="mb-2">Basic Details</h5>
                      </div>

                      {/* Product Name */}
                      <div className="form-group col-md-6">
                        <InputBox
                          label="Product Name"
                          name="name"
                          handleBlur={handleBlur}
                          handleChange={handleNameChange}
                          type="text"
                          placeholder="Enter program name"
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
                            setFieldValue(
                              "slug",
                              validateSlug(evt.target.value),
                            );
                          }}
                          type="text"
                          placeholder="Enter slug"
                          value={values.slug}
                          required={true}
                          touched={touched.slug}
                          error={errors.slug}
                        />
                      </div>

                      {/* Select Category */}
                      <div className="form-group col-md-6">
                        <CustomSelect
                          label="Select Category"
                          placeholder="Select Category"
                          name="category"
                          required={true}
                          options={categories}
                          value={values.category}
                          error={errors.category}
                          touched={touched.category}
                          isMulti={false}
                          handleChange={(value) => {
                            setFieldValue("category", value);
                          }}
                          handleBlur={() => {
                            setFieldTouched("category", true);
                          }}
                        />
                      </div>

                      {/* Select Sub Category */}
                      <div className="form-group col-md-6">
                        <CustomSelect
                          label="Select Sub Category"
                          placeholder="Select Category"
                          name="subCategory"
                          required={false}
                          options={subCategories}
                          value={values.subCategory}
                          error={errors.subCategory}
                          touched={touched.subCategory}
                          isMulti={false}
                          handleChange={(value) => {
                            setFieldValue("subCategory", value);
                          }}
                          handleBlur={() => {
                            setFieldTouched("subCategory", true);
                          }}
                        />
                      </div>

                      {/* Select Features */}
                      <div className="form-group col-md-12">
                        <CustomSelect
                          label="Select Features"
                          placeholder="Select Features"
                          name="features"
                          required={false}
                          options={features}
                          value={values.features}
                          error={errors.features}
                          touched={touched.features}
                          isMulti={true}
                          handleChange={(value) => {
                            setFieldValue("features", value);
                          }}
                          handleBlur={() => {
                            setFieldTouched("features", true);
                          }}
                        />
                      </div>

                      {/* Product SKU */}
                      <div className="form-group col-md-6">
                        <InputBox
                          label="Product SKU"
                          name="sku"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          type="text"
                          placeholder="Enter sku"
                          value={values.sku}
                          required={false}
                          touched={touched.sku}
                          error={errors.sku}
                        />
                      </div>

                      <div className="form-group col-md-6">
                        <label htmlFor="">
                          Status <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex gap-3">
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="radio"
                              name="status"
                              id="statusTrue"
                              value={"true"}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              checked={values.status == "true"}
                            />
                            <label htmlFor="statusTrue" className="mt-2">
                              Active
                            </label>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <input
                              type="radio"
                              name="status"
                              id="statusFalse"
                              value={"false"}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              checked={values.status == "false"}
                            />
                            <label htmlFor="statusFalse" className="mt-2">
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

                {/* Product Media */}
                <div className="card rounded-2 mt-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="mb-3">Product Media</h5>
                      </div>

                      <div className="form-group col-md-12">
                        <label
                          className="select-product-section"
                          htmlFor={"imagesFile"}
                        >
                          <div className="d-flex gap-2 align-items-center">
                            <button type="button">
                              <label
                                htmlFor={"imagesFile"}
                                style={{ margin: 0 }}
                              >
                                Upload New
                              </label>
                            </button>

                            <button
                              type="button"
                              data-bs-toggle="modal"
                              data-bs-target="#staticBackdrop"
                            >
                              <label style={{ margin: 0 }}>
                                Select Existing
                              </label>
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
                          {uploadedImages?.map((file: any, index: number) => {
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
                                <img
                                  className="img img-thumbnail"
                                  src={addUrlToFile(file)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Variants*/}
                <div className="card rounded-2 mt-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12 d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-2">Product Variants</h5>
                      </div>
                      {/* Select Colors */}
                      <div className="form-group col-md-12">
                        <CustomSelect
                          label="Select Colors"
                          placeholder="Select Colors"
                          name="colors"
                          required={false}
                          options={colors}
                          value={values.colors}
                          error={errors.colors}
                          touched={touched.colors}
                          isMulti={true}
                          handleChange={(value) => {
                            setFieldValue("colors", value);
                          }}
                          handleBlur={() => {
                            setFieldTouched("colors", true);
                          }}
                        />
                      </div>

                      {/* Select Shapes */}
                      <div className="form-group col-md-12">
                        <CustomSelect
                          label="Select Shapes"
                          placeholder="Select Shapes"
                          name="shapes"
                          required={false}
                          options={shapes}
                          value={values.shapes}
                          error={errors.shapes}
                          touched={touched.shapes}
                          isMulti={true}
                          handleChange={(value) => {
                            setFieldValue("shapes", value);
                          }}
                          handleBlur={() => {
                            setFieldTouched("shapes", true);
                          }}
                        />
                      </div>

                      {/* Select Sizes */}
                      <div className="form-group col-md-12">
                        <CustomSelect
                          label="Select Sizes"
                          placeholder="Select Sizes"
                          name="sizes"
                          required={false}
                          options={sizes}
                          value={values.sizes}
                          error={errors.sizes}
                          touched={touched.sizes}
                          isMulti={true}
                          handleChange={(value) => {
                            setFieldValue("sizes", value);
                          }}
                          handleBlur={() => {
                            setFieldTouched("sizes", true);
                          }}
                        />
                      </div>

                      {/* Select Materials */}
                      <div className="form-group col-md-12">
                        <CustomSelect
                          label="Select Materials"
                          placeholder="Select Materials"
                          name="materials"
                          required={false}
                          options={materials}
                          value={values.materials}
                          error={errors.materials}
                          touched={touched.materials}
                          isMulti={true}
                          handleChange={(value) => {
                            setFieldValue("materials", value);
                          }}
                          handleBlur={() => {
                            setFieldTouched("materials", true);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* More Details */}
                <div className="card rounded-2 mt-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="mb-2">More Details</h5>
                      </div>

                      {/* Long Description */}
                      <div className="col-md-12 form-group">
                        <label htmlFor={"descriptions"} className="mb-2">
                          Long Descriptions
                        </label>
                        <CKEditor
                          editor={ClassicEditor as any}
                          data=""
                          onChange={(__, editor) => {
                            const data = editor.getData();
                            setFieldValue("descriptions", data);
                          }}
                          onBlur={() => {
                            setFieldTouched("descriptions", true);
                          }}
                          onFocus={() => {}}
                          id={"descriptions"}
                        />
                        {errors.descriptions && touched.descriptions ? (
                          <p className="custom-form-error text-danger">
                            {errors.descriptions}
                          </p>
                        ) : null}
                      </div>

                      {/* Short Description */}
                      <div className="col-md-12 form-group">
                        <label htmlFor={"description"} className="mb-2">
                          Short Descriptions
                        </label>
                        <CKEditor
                          editor={ClassicEditor as any}
                          data=""
                          onChange={(__, editor) => {
                            const data = editor.getData();
                            setFieldValue("shortDescriptions", data);
                          }}
                          onBlur={() => {
                            setFieldTouched("shortDescriptions", true);
                          }}
                          onFocus={() => {}}
                          id={"shortDescriptions"}
                        />
                        {errors.shortDescriptions &&
                        touched.shortDescriptions ? (
                          <p className="custom-form-error text-danger">
                            {errors.shortDescriptions}
                          </p>
                        ) : null}
                      </div>

                      {/* Benefits */}
                      <div className="col-md-12 form-group">
                        <label htmlFor={"benefits"} className="mb-2">
                          Benefits
                        </label>
                        <CKEditor
                          editor={ClassicEditor as any}
                          data={values.benefits}
                          onChange={(__, editor) => {
                            const data = editor.getData();
                            setFieldValue("benefits", data);
                          }}
                          onBlur={() => {
                            setFieldTouched("benefits", true);
                          }}
                          onFocus={() => {}}
                          id={"benefits"}
                        />
                        {errors.benefits && touched.benefits ? (
                          <p className="custom-form-error text-danger">
                            {errors.benefits}
                          </p>
                        ) : null}
                      </div>

                      {/* Specifications */}
                      <div className="col-md-12 form-group">
                        <label htmlFor={"specifications"} className="mb-2">
                          Specifications
                        </label>
                        <CKEditor
                          editor={ClassicEditor as any}
                          data={values?.specifications}
                          onChange={(__, editor) => {
                            const data = editor.getData();
                            setFieldValue("specifications", data);
                          }}
                          onBlur={() => {
                            setFieldTouched("specifications", true);
                          }}
                          onFocus={() => {}}
                          id={"specifications"}
                        />
                        {errors.specifications && touched.specifications ? (
                          <p className="custom-form-error text-danger">
                            {errors.specifications}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Default Image */}
                <div className="card rounded-2 mt-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="mb-2">Default Image </h5>
                      </div>

                      {values.image ? (
                        <div className="col-md-6 mx-auto text-center">
                          <button
                            type="button"
                            className="btn btn-danger p-image-remove"
                            onClick={(evt) => {
                              evt.preventDefault();
                              setFieldValue("image", "");
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
                            src={addUrlToFile(values.image)}
                            alt=""
                          />
                        </div>
                      ) : (
                        <div>
                          <button
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#selectDefaultImageForProduct"
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
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                <div className="card rounded-2 mt-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12 d-flex justify-content-between">
                        <h5 className="mb-2">Product Images</h5>
                        {/* <button type="button">Add Image</button> */}

                        <button
                          type="button"
                          className="btn btn-none p-2 border"
                          data-bs-toggle="modal"
                          data-bs-target="#selectImagesForProduct"
                        >
                          <i className="fas fa-plus text-info"></i> Image
                        </button>
                      </div>

                      <div className="col-md-12">
                        <div className="d-flex gap-4">
                          {selectedImages.length
                            ? selectedImages?.map((item: string) => {
                                return (
                                  <div className="p-image">
                                    <button
                                      type="button"
                                      className="btn btn-danger p-image-remove"
                                      onClick={(evt) => {
                                        evt.preventDefault();
                                        handleRemoveSelectedImageForProducts(
                                          item,
                                        );
                                      }}
                                    >
                                      X
                                    </button>
                                    <img
                                      className="img img-thumbnail"
                                      src={addUrlToFile(item)}
                                      alt=""
                                    />
                                  </div>
                                );
                              })
                            : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Tags */}
                <div className="card rounded-2 mt-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="mb-3">Search Tags</h5>
                      </div>

                      {/* Tags */}
                      <div className="form-group col-md-12">
                        <InputBox
                          label="Tags"
                          name="tags"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          type="text"
                          placeholder="Enter tags"
                          value={values.tags}
                          required={false}
                          touched={touched.tags}
                          error={errors.tags}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Details */}
                <div className="card rounded-2 mt-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="mb-2">Meta Details</h5>
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
                        <SubmitButton loading={false} text="Add Product" />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Select Existing Files */}
      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Select file
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
                          uploadedImages?.includes(item.filename)
                            ? "card selected-img"
                            : "card"
                        }
                      >
                        <div
                          onClick={() => {
                            setUploadedImages((old) => {
                              if (old.includes(item.filename)) {
                                // Remove it
                                return old.filter(
                                  (name) => name !== item.filename,
                                );
                              } else {
                                // Add it
                                return [...old, item.filename];
                              }
                            });
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

      {/* Select Default Image */}
      <div
        className="modal fade"
        id="selectDefaultImageForProduct"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectDefaultImageForProductLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h6
                className="modal-title"
                id="selectDefaultImageForProductLabel"
                style={{ fontSize: "16px" }}
              >
                Select Default Image
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row mb-2 gy-2 media-list-section">
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
                        data-bs-target="#staticBackdrop"
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
                    <div className="row mb-2 gy-2 media-list-section">
                      {uploadedImages?.map((item) => {
                        return (
                          <div className="col-md-2 col-4">
                            <div
                              className={
                                values.image == item
                                  ? "card selected-img"
                                  : "card"
                              }
                            >
                              <div
                                onClick={() => {
                                  setFieldValue("image", item);
                                }}
                              >
                                <img src={addUrlToFile(item)} alt="" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {/* <button
                type="button"
                className="btn btn-secondary px-3 py-2"
                data-bs-dismiss="modal"
              >
                Close
              </button> */}
              <button
                type="button"
                className="btn btn-primary px-3 py-2"
                data-bs-dismiss="modal"
                // onClick={handleAddBanner}
                // disabled={selectedBanner ? false : true}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Select Product Images */}
      <div
        className="modal fade"
        id="selectImagesForProduct"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectImagesForProductLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h6
                className="modal-title"
                id="selectImagesForProductLabel"
                style={{ fontSize: "16px" }}
              >
                Select Product Images
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row mb-2 gy-2 media-list-section">
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
                        data-bs-target="#staticBackdrop"
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
                    <div className="row mb-2 gy-2 media-list-section">
                      {uploadedImages?.map((item) => {
                        return (
                          <div className="col-md-2 col-4">
                            <div
                              className={
                                selectedImages.includes(item)
                                  ? "card selected-img"
                                  : "card"
                              }
                            >
                              <div
                                onClick={() => {
                                  setSelectedImages((old) => {
                                    if (old.includes(item)) {
                                      // Remove it
                                      return old.filter(
                                        (name) => name !== item,
                                      );
                                    } else {
                                      // Add it
                                      return [...old, item];
                                    }
                                  });
                                }}
                              >
                                <img src={addUrlToFile(item)} alt="" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {/* <button
                type="button"
                className="btn btn-secondary px-3 py-2"
                data-bs-dismiss="modal"
              >
                Close
              </button> */}
              <button
                type="button"
                className="btn btn-primary px-3 py-2"
                data-bs-dismiss="modal"
                // onClick={handleAddBanner}
                // disabled={selectedBanner ? false : true}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
