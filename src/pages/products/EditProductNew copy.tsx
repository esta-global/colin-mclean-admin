import {
  CustomSelect,
  GoBackButton,
  InputBox,
  OverlayLoading,
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

import React, { useEffect, useRef, useState } from "react";

import { get, put, validateSlug } from "../../utills";

import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../constants";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import ReactHelmet from "../../components/ui/ReactHelmet";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function EditProductNew() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [edges, setEdges] = useState([]);
  const [features, setFeatures] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [selectedBanner, setSelectedBanner] = useState<string>("");
  const [currentBanner, setCurrentBanner] = useState<
    "FIRST" | "SECOND" | "THIRD"
  >("FIRST");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 60,
    totalRecords: 0,
    totalPages: 0,
  });

  const [currectShapeSize, setCurrectShapeSize] = useState<any>({
    shape: 0,
    size: 0,
  });

  type PRODUCT_VARIANTS = {
    shape: { label: string; value: string } | null;
    sizes: {
      size: { label: string; value: string } | null;
    }[];
    error?: string;
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
    setFieldError,
    setValues,
  } = useFormik({
    onSubmit: async function (
      values: ProductValues,
      helpers: FormikHelpers<ProductValues>
    ) {
      const newValue: any = {
        ...values,

        category: values?.category?.value,
        subCategory: values.subCategory?.value,
        images: selectedImages,
        features: values.features?.map((item) => {
          return item.value;
        }),
        edges: values.edges?.map((item) => {
          return item.value;
        }),
      };

      let productVariants = [];
      for (let variantFeild of productVariantInputFields) {
        if (variantFeild.shape && variantFeild.sizes?.length) {
          productVariants.push({
            shape: variantFeild.shape?.value,
            sizes: variantFeild.sizes?.map((item) => {
              return {
                size: item.size?.value,
              };
            }),
          });
        }
      }

      newValue.variants = productVariants;

      const apiResponse = await put(`/products/${id}`, newValue);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
    },
    initialValues: productInitialValues,
    validationSchema: productSchema,
  });

  // get Colors
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

  // get product details
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        const apiResponse: any = await get(`/products/${id}`, true);
        if (apiResponse?.status == 200) {
          const data: any = apiResponse.body;

          delete data._id;
          delete data.createdAt;
          delete data.updatedAt;

          if (data.category) {
            data.category = {
              label: data?.category?.name,
              value: data.category?._id,
            };
          }

          if (data.subCategory) {
            data.subCategory = {
              label: data?.subCategory?.name,
              value: data.subCategory?._id,
            };
          }

          if (data.features) {
            if (data?.features?.length) {
              data.features = data.features?.map((item: any) => {
                return {
                  label: item.name,
                  value: item._id,
                };
              });
            }
          }

          if (data.edges) {
            if (data?.edges?.length) {
              data.edges = data.edges?.map((item: any) => {
                return {
                  label: item.name,
                  value: item._id,
                };
              });
            }
          }

          if (data?.variants) {
            if (data.variants?.length) {
              let images: any[] = [];
              let variants = [];

              for (let item of data.variants) {
                let varient = {
                  shape: { label: item.shape.name, value: item.shape._id },
                  sizes: item?.sizes?.map((sizeValue: any) => {
                    return {
                      size: {
                        label: sizeValue?.size?.title,
                        value: sizeValue?.size?._id,
                      },
                    };
                  }),
                };

                images = images.concat(
                  ...(item?.sizes?.map(
                    (sizeItem: any) => sizeItem.images || []
                  ) || [])
                );

                variants.push(varient);
              }

              // Deduplicate images
              const uniqueImages = Array.from(new Set(images));
              setUploadedImages(uniqueImages);

              setProductVariantInputFields(variants);
            }
          }

          setSelectedImages(data.images || []);

          data.status = `${data.status}`;
          setValues(data);
        }
        setLoading(false);
      }
      if (id) getData(id);
    },
    [id]
  );

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

  // get Edges
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/edges?limit=0", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setEdges(modifiedValue);
      }
    }
    getData();
  }, []);

  // get category
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/categories?limit=0&status=true", true);
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
    [values.category]
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
  const handleAddSizeVariantFields = (index: number) => {
    setProductVariantInputFields((old) => {
      const updated = [...old]; // shallow copy of the array
      const sizes = [...updated[index].sizes]; // copy sizes array

      sizes.push({
        size: null,
      });

      updated[index] = {
        ...updated[index],
        sizes,
      };

      return updated;
    });
  };

  const handleRemoveSizeVariantField = (
    variantIndex: number,
    sizeIndex: number
  ) => {
    setProductVariantInputFields((old) => {
      const updated = [...old]; // shallow copy of variants
      const sizes = [...updated[variantIndex].sizes]; // shallow copy of sizes array

      sizes.splice(sizeIndex, 1); // remove the size at given index

      updated[variantIndex] = {
        ...updated[variantIndex],
        sizes,
      };

      return updated;
    });
  };

  const handleRemoveVariantFields = (index: number) => {
    const updatedInputFields = [...productVariantInputFields];
    updatedInputFields.splice(index, 1);
    setProductVariantInputFields(updatedInputFields);
  };

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
    index: number
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

  // Get Data From Database
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

  const [shouldSelectModelOpen, setShouldSelectModelOpen] =
    useState<boolean>(false);
  const modalARef = useRef<HTMLDivElement | null>(null);
  const modalBRef = useRef<HTMLDivElement | null>(null);
  let modalA: any;
  let modalB: any;

  useEffect(() => {
    const bootstrap = window.bootstrap;

    if (modalARef.current && modalBRef.current) {
      modalA = new bootstrap.Modal(modalARef.current, {
        backdrop: "static",
        keyboard: false,
      });

      modalB = new bootstrap.Modal(modalBRef.current, {
        backdrop: "static",
        keyboard: false,
      });
    }
  }, []);

  const openModalA = () => {
    modalA?.show();
  };

  const openModalB = () => {
    modalB?.show();
    modalBRef.current?.classList.add("modal-z-top");
  };

  function handleAddImagesToSize() {
    const newImages = selectedImages;
    let shapeIndex = currectShapeSize.color;
    let sizeIndex = currectShapeSize.size;

    // ✅ Update the images array in state
    setProductVariantInputFields((prev) => {
      const updated = [...prev];
      const sizes = [...updated[shapeIndex].sizes];

      sizes[sizeIndex] = {
        ...sizes[sizeIndex],
      };

      updated[shapeIndex] = {
        ...updated[shapeIndex],
        sizes,
      };

      return updated;
    });

    // clear the selected images
    setSelectedImages([]);
  }

  function handleRemoveImagesFromSize(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
    shapeIndex: number,
    sizeIndex: number
  ) {
    event.preventDefault();
    setProductVariantInputFields((prev) => {
      const updated = [...prev];
      const sizes = [...updated[shapeIndex].sizes];
      const currentSize = { ...sizes[sizeIndex] };

      sizes[sizeIndex] = {
        ...currentSize,
      };

      updated[shapeIndex] = {
        ...updated[shapeIndex],
        sizes,
      };

      return updated;
    });
  }

  function handleAddBanner() {
    if (currentBanner == "FIRST") {
      setFieldValue("bannerFirst", selectedBanner);
    } else if (currentBanner == "SECOND") {
      setFieldValue("bannerSecond", selectedBanner);
    } else {
      setFieldValue("bannerThird", selectedBanner);
    }

    // clear the selected banner
    setSelectedBanner("");
  }

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
                <ReactHelmet title="Edit Product" />
                <h4 className="font-weight-bold mb-0">Update Product</h4>
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

        {loading ? <OverlayLoading /> : null}

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
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
                        handleChange={handleChange}
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

                    {/* Sale Price */}
                    {/* <div className="form-group col-md-6">
                    <InputBox
                      label="Sale Price"
                      name="salePrice"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "salePrice",
                          validateNumber(evt.target.value)
                        );
                      }}
                      type="text"
                      placeholder="Enter sale price"
                      value={values.salePrice}
                      required={false}
                      touched={touched.salePrice}
                      error={errors.salePrice}
                    />
                  </div> */}

                    {/* MRP */}
                    {/* <div className="form-group col-md-6">
                    <InputBox
                      label="MRP"
                      name="mrp"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue("mrp", validateNumber(evt.target.value));
                      }}
                      type="text"
                      placeholder="Enter mrp"
                      value={values.mrp}
                      required={false}
                      touched={touched.mrp}
                      error={errors.mrp}
                    />
                  </div> */}

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
                        handleChange={(value) => {
                          setFieldValue("category", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("category", true);
                        }}
                        isMulti={false}
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
                        handleChange={(value) => {
                          setFieldValue("subCategory", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("subCategory", true);
                        }}
                        isMulti={false}
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

                    {/* Select Edges */}
                    <div className="form-group col-md-12">
                      <CustomSelect
                        label="Select Edges"
                        placeholder="Select Edges"
                        name="edges"
                        required={false}
                        options={edges}
                        value={values.edges}
                        error={errors.edges}
                        touched={touched.edges}
                        isMulti={true}
                        handleChange={(value) => {
                          setFieldValue("edges", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("edges", true);
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
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={handleAddVariantFields}
                      >
                        <i className="fas fa-plus text-info"></i>
                      </button>
                    </div>
                    <div className="form-group col-md-12">
                      {productVariantInputFields.map((field, index) => (
                        <div className="mb-2 shadow-sm p-2 border">
                          {/* Select Color */}
                          <div className="form-group col-md-5 d-flex gap-2 m-0 align-items-center">
                            <CustomSelect
                              label=""
                              placeholder="Select Color"
                              name="shape"
                              required={false}
                              options={shapes}
                              value={field.shape}
                              error={field.error}
                              touched={false}
                              handleChange={(value) => {
                                const updatedInputFields = [
                                  ...productVariantInputFields,
                                ];
                                updatedInputFields[index]["shape"] = value;
                                setProductVariantInputFields(
                                  updatedInputFields
                                );
                                // setFieldValue("size", value);
                              }}
                              handleBlur={() => {
                                // setFieldTouched("size", true);
                              }}
                              isMulti={false}
                              padding="0px"
                            />

                            <span>
                              {index != 0 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveVariantFields(index)
                                  }
                                  className="btn btn-light p-1"
                                >
                                  <i className="fas fa-trash text-danger"></i>
                                </button>
                              ) : null}
                            </span>
                          </div>

                          <div
                            className="col-md-12"
                            style={{ paddingLeft: "30px" }}
                          >
                            <table className="table p-0 m-0 table-borderless">
                              <thead>
                                <tr>
                                  <th style={{ width: "40px" }}></th>
                                  <th>Size</th>

                                  {/* <th>Image</th> */}
                                  <th className="d-flex gap-3 align-items-center justify-content-end">
                                    {/* Images */}
                                    <div className="">
                                      <button
                                        type="button"
                                        className="btn btn-none p-2 border"
                                        onClick={() => {
                                          handleAddSizeVariantFields(index);
                                        }}
                                      >
                                        <i className="fas fa-plus text-info"></i>{" "}
                                        Size
                                      </button>
                                    </div>
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {field?.sizes?.map((sizeField, sizeIndex) => {
                                  return (
                                    <tr>
                                      <td>
                                        {sizeIndex != 0 ? (
                                          <div>
                                            <button
                                              type="button"
                                              className="btn btn-light p-1"
                                              onClick={() => {
                                                handleRemoveSizeVariantField(
                                                  index,
                                                  sizeIndex
                                                );
                                              }}
                                            >
                                              <i className="fas fa-trash text-danger"></i>
                                            </button>
                                          </div>
                                        ) : null}
                                      </td>
                                      <td>
                                        <div className="form-group m-0">
                                          <CustomSelect
                                            label=""
                                            placeholder="Select Size"
                                            name="size"
                                            required={false}
                                            options={sizes}
                                            value={sizeField.size}
                                            error={""}
                                            touched={false}
                                            handleChange={(value) => {
                                              const updatedInputFields = [
                                                ...productVariantInputFields,
                                              ];
                                              updatedInputFields[index][
                                                "sizes"
                                              ][sizeIndex]["size"] = value;
                                              setProductVariantInputFields(
                                                updatedInputFields
                                              );
                                              // setFieldValue("size", value);
                                            }}
                                            handleBlur={() => {
                                              // setFieldTouched("size", true);
                                            }}
                                            isMulti={false}
                                            padding="0px"
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="col-md-12">
                            <p className="custom-form-error text-danger">
                              {field?.error}
                            </p>
                          </div>
                        </div>
                      ))}
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

                    {/* Long Descriptions */}
                    <div className="col-md-12 form-group">
                      <label htmlFor={"descriptions"} className="mb-2">
                        Long Descriptions
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values.description}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFieldValue("description", data);
                        }}
                        onBlur={(event, editor) => {
                          setFieldTouched("description", true);
                        }}
                        onFocus={(event, editor) => {}}
                        id={"description"}
                      />
                      {errors.description && touched.description ? (
                        <p className="custom-form-error text-danger">
                          {errors.description}
                        </p>
                      ) : null}
                    </div>

                    {/* Short Description */}
                    <div className="col-md-12 form-group">
                      <label htmlFor={"description"} className="mb-2">
                        Short Description
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values.shortDescription}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFieldValue("shortDescription", data);
                        }}
                        onBlur={(event, editor) => {
                          setFieldTouched("shortDescription", true);
                        }}
                        onFocus={(event, editor) => {}}
                        id={"shortDescription"}
                      />
                      {errors.shortDescription && touched.shortDescription ? (
                        <p className="custom-form-error text-danger">
                          {errors.shortDescription}
                        </p>
                      ) : null}
                    </div>

                    {/* Thikness */}
                    <div className="col-md-12 form-group">
                      <label htmlFor={"thickness"} className="mb-2">
                        Thickness
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values.thickness}
                        onChange={(__, editor) => {
                          const data = editor.getData();
                          setFieldValue("thickness", data);
                        }}
                        onBlur={() => {
                          setFieldTouched("thickness", true);
                        }}
                        onFocus={() => {}}
                        id={"thickness"}
                      />
                      {errors.thickness && touched.thickness ? (
                        <p className="custom-form-error text-danger">
                          {errors.thickness}
                        </p>
                      ) : null}
                    </div>

                    {/* Core */}
                    <div className="col-md-12 form-group">
                      <label htmlFor={"core"} className="mb-2">
                        Core
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values?.core}
                        onChange={(__, editor) => {
                          const data = editor.getData();
                          setFieldValue("core", data);
                        }}
                        onBlur={() => {
                          setFieldTouched("core", true);
                        }}
                        onFocus={() => {}}
                        id={"core"}
                      />
                      {errors.core && touched.core ? (
                        <p className="custom-form-error text-danger">
                          {errors.core}
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
                                        item
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
                      <SubmitButton loading={false} text="Update Product" />
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
        ref={modalARef}
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
                                  (name) => name !== item.filename
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

      {/* Select Default Iamge */}
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
                                        (name) => name !== item
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
