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

import React, { useEffect, useState } from "react";

import { get, put, remove, validateSlug } from "../../utills";

import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../constants";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import ReactHelmet from "../../components/ui/ReactHelmet";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function EditProductNew() {
  const navigate = useNavigate();
  const { id, page } = useParams();
  const [currentVarientIndex, setCurrentVarientIndex] = useState(0);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [colors, setColors] = useState([]);
  const [thickness, setThickness] = useState([]);
  const [features, setFeatures] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [exploreProducts, setExploreProducts] = useState<any[]>([]);
  const [sizes, setSizes] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [badges, setBadges] = useState([]);

  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedImages, setSelectedImages] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 60,
    totalRecords: 0,
    totalPages: 0,
  });

  const [productVariantInputFields, setProductVariantInputFields] =
    useState<any>([]);

  const handleAddVariantFields = () => {
    setProductVariantInputFields([
      ...productVariantInputFields,
      {
        sku: "",
        color: null,
        shape: null,
        size: null,
        material: null,
        thickness: null,
        badges: null,
        images: [],
        descriptions: "",
        status: true,

        error: "",
      },
    ]);
  };

  const handleRemoveVariantFields = (index: number) => {
    const updatedInputFields = [...productVariantInputFields];
    updatedInputFields.splice(index, 1);
    setProductVariantInputFields(updatedInputFields);
  };

  function handleRemoveImage(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
    index: number,
  ) {
    event.preventDefault();
    setProductVariantInputFields((old: any) => {
      let allData = [...old];
      const currentImages = allData[index].images;

      const filteredImages = currentImages.filter(
        (img: any) => img !== fileName,
      );
      allData[index].images = filteredImages;
      return allData;
    });
  }

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
      helpers: FormikHelpers<ProductValues>,
    ) {
      const newValue: any = {
        ...values,

        category: values?.category?.value,
        subCategory: values.subCategory?.value,

        features: values.features?.map((item) => {
          return item.value;
        }),

        certifications: values.certifications?.map((item) => {
          return item.value;
        }),

        exploreProducts: values.exploreProducts?.map((item) => {
          return item.value;
        }),
      };

      let productVariants = [];
      for (let variantFeild of productVariantInputFields) {
        let obj = {
          sku: variantFeild.sku,
          color: variantFeild.color?.value,
          shape: variantFeild.shape?.value,
          material: variantFeild.material?.value,
          size: variantFeild.size?.value,
          thickness: variantFeild.thickness?.value,
          badges: variantFeild.badges?.map((item: any) => {
            return item.value;
          }),
          descriptions: variantFeild.descriptions,
          images: variantFeild.images,

          // added for e commerce
          salePrice: variantFeild.salePrice,
          mrp: variantFeild.mrp,
          stock: variantFeild.stock,
          status: variantFeild.status,
        };
        productVariants.push(obj);
      }

      newValue.variants = productVariants;

      const apiResponse = await put(`/products/${id}`, newValue);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(`/products?page=${page}`);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
    },
    initialValues: productInitialValues,
    validationSchema: productSchema,
  });

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

  // get product details
  useEffect(() => {
    if (!id) return;

    const getData = async (id: string) => {
      setLoading(true);
      try {
        const apiResponse: any = await get(`/products/${id}`, true);

        if (apiResponse?.status !== 200) return;

        const rawData = apiResponse.body;

        const data: any = {
          ...rawData,
        };

        // remove unwanted fields
        delete data._id;
        delete data.createdAt;
        delete data.updatedAt;

        // category
        if (rawData?.category) {
          data.category = {
            label: rawData.category.name,
            value: rawData.category._id,
          };
        }

        // subCategory
        if (rawData?.subCategory) {
          data.subCategory = {
            label: rawData.subCategory.name,
            value: rawData.subCategory._id,
          };
        }

        // features
        if (Array.isArray(rawData?.features)) {
          data.features = rawData.features.map((item: any) => ({
            label: item.name,
            value: item._id,
          }));
        }

        console.log("rawData.certifications", rawData.certifications);

        // certifications
        if (Array.isArray(rawData?.certifications)) {
          data.certifications = rawData.certifications.map((item: any) => ({
            label: item?.title,
            value: item?._id,
          }));
        }

        // exploreProducts
        if (Array.isArray(rawData?.exploreProducts)) {
          data.exploreProducts = rawData.exploreProducts.map((item: any) => ({
            label: item.name,
            value: item._id,
            image: addUrlToFile(item.image),
          }));
        }

        // variants
        if (Array.isArray(rawData?.variants)) {
          const allVariants = rawData.variants.map((variant: any) => ({
            sku: variant.sku,
            descriptions: variant.descriptions,
            images: variant.images,
            status: variant.status,
            color: variant.color
              ? { label: variant.color.name, value: variant.color._id }
              : null,
            shape: variant.shape
              ? { label: variant.shape.name, value: variant.shape._id }
              : null,
            material: variant.material
              ? { label: variant.material.name, value: variant.material._id }
              : null,
            size: variant.size
              ? { label: variant.size.title, value: variant.size._id }
              : null,
            thickness: variant.thickness
              ? { label: variant.thickness.name, value: variant.thickness._id }
              : null,
            badges: variant.badges
              ? variant?.badges?.map((badge: any) => {
                  return {
                    label: badge.title,
                    value: badge._id,
                  };
                })
              : null,

            // added for e commerce
            salePrice: variant.salePrice,
            mrp: variant.mrp,
            stock: variant.stock,
          }));

          setProductVariantInputFields(allVariants);
        }

        // images (main product image + variant images only)
        const variantImages = Array.isArray(rawData?.variants)
          ? rawData.variants.flatMap((variant: any) =>
              Array.isArray(variant.images) ? variant.images : [],
            )
          : [];

        const images = [
          rawData.image, // main product image
          ...variantImages, // variant images
        ].filter(Boolean);

        // remove duplicates
        const uniqueImages = [...new Set(images)];

        setUploadedImages(uniqueImages);

        setSelectedImages(rawData.images || []);

        data.status = String(rawData.status);
        data.bestSeller = String(rawData.bestSeller);

        setValues(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    getData(id);
  }, [id]);

  // get Features
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/features?limit=0", true);
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

  // get certifications
  useEffect(function () {
    async function getData() {
      let url = `/certifications?limit=0&status=true`;

      const apiResponse = await get(url, true);

      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.title,
            value: value._id,
          };
        });
        setCertifications(modifiedValue);
      }
    }
    getData();
  }, []);

  // get Products for Explore Section
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/products?limit=10000", true);

      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
            image: addUrlToFile(value.image),
          };
        });
        setExploreProducts(modifiedValue);
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

  // get Thickness
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/thickness?limit=0", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setThickness(modifiedValue);
      }
    }
    getData();
  }, []);

  // get Badges
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/badges?limit=0", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.title,
            value: value._id,
          };
        });
        setBadges(modifiedValue);
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

  // Get media From Database
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

  // handleUploadVideo
  async function handleUploadVideo(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime", // .mov
      "video/x-msvideo", // .avi
      "video/x-matroska", // .mkv
    ];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("video", true);
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldError("video", "Must select the valid video file");
      setFieldTouched("video", true);
      toast.error("Must select the valid video file");
      setTimeout(() => {
        setFieldError("video", "Must select a valid video file");
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
        setFieldTouched("video", false);
        setFieldError("video", "");
        setFieldValue("video", apiData.body[0].filename);
      } else {
        setFieldTouched("video", false);
        setFieldError("video", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteVideo
  async function handleDeleteVideo(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("video", "");
        setFieldValue("video", "");
      } else {
        setFieldError("video", "");
        setFieldValue("video", "");
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        `videoFile`,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear the input field
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  function handleAddImagesToProduct() {
    const newImages = selectedImages;
    let index = currentVarientIndex;

    // ✅ Update the images array in state
    setProductVariantInputFields((prev: any) => {
      const updated = [...prev];
      const currentImages = updated[index].images || [];

      updated[index].images = [...currentImages, ...newImages];

      return updated;
    });

    // clear the selected images
    setSelectedImages([]);
  }

  const CustomOption = (props: any) => {
    const { data, innerRef, innerProps, isFocused } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 10px",
          backgroundColor: isFocused ? "#f5f5f5" : "#fff",
          cursor: "pointer",
        }}
      >
        <img
          src={data.image}
          alt={data.label}
          style={{
            width: 35,
            height: 35,
            objectFit: "cover",
            borderRadius: 6,
            marginRight: 10,
          }}
        />

        <span>{data.label}</span>
      </div>
    );
  };

  const CustomMultiValueLabel = (props: any) => {
    const { data } = props;

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={data.image}
          alt={data.label}
          style={{
            width: 20,
            height: 20,
            objectFit: "cover",
            borderRadius: 4,
            marginRight: 5,
          }}
        />
        <span>{data.label}</span>
      </div>
    );
  };

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
          <div className="col-md-12 grid-margin">
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

                    {/* Select Certifications */}
                    <div className="form-group col-md-12">
                      <CustomSelect
                        label="Select Certifications"
                        placeholder="Select Certifications"
                        name="certifications"
                        required={false}
                        options={certifications}
                        value={values.certifications}
                        error={errors.certifications}
                        touched={touched.certifications}
                        isMulti={true}
                        handleChange={(value) => {
                          setFieldValue("certifications", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("certifications", true);
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

                    <div className="form-group col-md-3">
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

                    <div className="form-group col-md-3">
                      <label htmlFor="">
                        Best Seller <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-3">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            name="bestSeller"
                            id="bestSellerTrue"
                            value={"true"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.bestSeller == "true"}
                          />
                          <label htmlFor="bestSellerTrue" className="mt-2">
                            Yes
                          </label>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <input
                            type="radio"
                            name="bestSeller"
                            id="bestSellerFalse"
                            value={"false"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.bestSeller == "false"}
                          />
                          <label htmlFor="bestSellerFalse" className="mt-2">
                            No
                          </label>
                        </div>
                      </div>
                      {errors.bestSeller && touched.bestSeller ? (
                        <p className="custom-form-error text-danger">
                          {errors.bestSeller}
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
                    <div className="form-group col-md-12 table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <td style={{ width: "150px" }}>SKU</td>
                            <td style={{ width: "150px" }}>Color</td>
                            <td>Shape</td>
                            <td>Material</td>
                            <td>Size</td>
                            <td>Thickness</td>
                            <td>Status</td>
                          </tr>
                        </thead>

                        <tbody>
                          {productVariantInputFields.map(
                            (field: any, index: any) => {
                              return (
                                <>
                                  <tr>
                                    {/* SKU */}
                                    <td>
                                      <input
                                        type="text"
                                        name="sku"
                                        className="form-control"
                                        value={field["sku"]}
                                        onChange={(evt) => {
                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index]["sku"] =
                                            evt.target.value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                        }}
                                        style={{
                                          padding: "10px",
                                          borderRadius: "5px",
                                        }}
                                        placeholder="SKU"
                                      />
                                    </td>

                                    {/* Color */}
                                    <td>
                                      <CustomSelect
                                        label=""
                                        placeholder="Color"
                                        name="color"
                                        required={false}
                                        options={colors}
                                        value={field.color}
                                        error={field.error}
                                        touched={false}
                                        handleChange={(value) => {
                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index]["color"] =
                                            value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                          // setFieldValue("size", value);
                                        }}
                                        handleBlur={() => {
                                          // setFieldTouched("size", true);
                                        }}
                                        isMulti={false}
                                        padding="0px"
                                      />
                                    </td>

                                    {/* Shape */}
                                    <td>
                                      <CustomSelect
                                        label=""
                                        placeholder="Shape"
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
                                          updatedInputFields[index]["shape"] =
                                            value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                          // setFieldValue("size", value);
                                        }}
                                        handleBlur={() => {
                                          // setFieldTouched("size", true);
                                        }}
                                        isMulti={false}
                                        padding="0px"
                                      />
                                    </td>

                                    {/* Material */}
                                    <td>
                                      <CustomSelect
                                        label=""
                                        placeholder="Material"
                                        name="material"
                                        required={false}
                                        options={materials}
                                        value={field.material}
                                        error={field.error}
                                        touched={false}
                                        handleChange={(value) => {
                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index][
                                            "material"
                                          ] = value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                          // setFieldValue("size", value);
                                        }}
                                        handleBlur={() => {
                                          // setFieldTouched("size", true);
                                        }}
                                        isMulti={false}
                                        padding="0px"
                                      />
                                    </td>

                                    {/* Size */}
                                    <td>
                                      <CustomSelect
                                        label=""
                                        placeholder="Size"
                                        name="size"
                                        required={false}
                                        options={sizes}
                                        value={field.size}
                                        error={field.error}
                                        touched={false}
                                        handleChange={(value) => {
                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index]["size"] =
                                            value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                          // setFieldValue("size", value);
                                        }}
                                        handleBlur={() => {
                                          // setFieldTouched("size", true);
                                        }}
                                        isMulti={false}
                                        padding="0px"
                                      />
                                    </td>

                                    {/* Thickness */}
                                    <td>
                                      <CustomSelect
                                        label=""
                                        placeholder="Thickness"
                                        name="thickness"
                                        required={false}
                                        options={thickness}
                                        value={field.thickness}
                                        error={field.error}
                                        touched={false}
                                        handleChange={(value) => {
                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index][
                                            "thickness"
                                          ] = value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                          // setFieldValue("thickness", value);
                                        }}
                                        handleBlur={() => {
                                          // setFieldTouched("thickness", true);
                                        }}
                                        isMulti={false}
                                        padding="0px"
                                      />
                                    </td>

                                    {/* Status */}
                                    <td>
                                      <div className="d-flex gap-2 align-items-center">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          onChange={(evt) => {
                                            const updatedInputFields = [
                                              ...productVariantInputFields,
                                            ];
                                            updatedInputFields[index][
                                              "status"
                                            ] = evt.target.checked;
                                            setProductVariantInputFields(
                                              updatedInputFields,
                                            );
                                          }}
                                          checked={field.status}
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
                                    </td>
                                  </tr>

                                  <tr>
                                    <td colSpan={2}>
                                      <input
                                        type="number"
                                        name="mrp"
                                        className="form-control"
                                        value={field["mrp"]}
                                        onChange={(evt) => {
                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index]["mrp"] =
                                            evt.target.value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                        }}
                                        style={{
                                          padding: "10px",
                                          borderRadius: "5px",
                                        }}
                                        placeholder="Enter MRP"
                                      />
                                    </td>

                                    <td colSpan={2}>
                                      <input
                                        type="number"
                                        name="salePrice"
                                        className="form-control"
                                        value={field["salePrice"]}
                                        onChange={(evt) => {
                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index][
                                            "salePrice"
                                          ] = evt.target.value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                        }}
                                        style={{
                                          padding: "10px",
                                          borderRadius: "5px",
                                        }}
                                        placeholder="Enter Sale Price"
                                      />
                                    </td>

                                    <td colSpan={3}>
                                      <input
                                        type="number"
                                        name="stock"
                                        className="form-control"
                                        value={field["stock"]}
                                        onChange={(evt) => {
                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index]["stock"] =
                                            evt.target.value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                        }}
                                        style={{
                                          padding: "10px",
                                          borderRadius: "5px",
                                        }}
                                        placeholder="Enter Stock"
                                      />
                                    </td>
                                  </tr>

                                  {/* Badges */}
                                  <tr>
                                    <td colSpan={7}>
                                      <CustomSelect
                                        label=""
                                        placeholder="Badges"
                                        name="badges"
                                        required={false}
                                        options={badges}
                                        value={field.badges}
                                        error={field.error}
                                        touched={false}
                                        handleChange={(value: any) => {
                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index]["badges"] =
                                            value;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                          // setFieldValue("badge", value);
                                        }}
                                        handleBlur={() => {
                                          // setFieldTouched("badge", true);
                                        }}
                                        isMulti={true}
                                        padding="0px"
                                      />
                                    </td>
                                  </tr>

                                  <tr>
                                    <td colSpan={7}>
                                      {/* Long Description */}
                                      {/* <div className="col-md-12 form-group"> */}
                                      <label
                                        htmlFor={"descriptions"}
                                        className="mb-2"
                                      >
                                        Long Descriptions
                                      </label>
                                      <CKEditor
                                        editor={ClassicEditor as any}
                                        data={field.descriptions || ""}
                                        onChange={(__, editor) => {
                                          const data = editor.getData();

                                          const updatedInputFields = [
                                            ...productVariantInputFields,
                                          ];
                                          updatedInputFields[index][
                                            "descriptions"
                                          ] = data;
                                          setProductVariantInputFields(
                                            updatedInputFields,
                                          );
                                        }}
                                        onBlur={() => {
                                          // setFieldTouched("descriptions", true);
                                        }}
                                        onFocus={() => {}}
                                        // id={"descriptions"}
                                      />
                                      {errors.descriptions &&
                                      touched.descriptions ? (
                                        <p className="custom-form-error text-danger">
                                          {errors.descriptions}
                                        </p>
                                      ) : null}
                                      {/* </div> */}
                                    </td>
                                  </tr>

                                  <tr>
                                    <td colSpan={7}>
                                      <div className="d-flex align-items-center gap-2">
                                        <div>
                                          <button
                                            // htmlFor={`images-${index}-${sizeIndex}`}
                                            type="button"
                                            data-bs-toggle="modal"
                                            data-bs-target="#selectImageForProduct"
                                            onClick={() => {
                                              setCurrentVarientIndex(index);
                                            }}
                                          >
                                            <img
                                              src="/images/select-photo.png"
                                              style={{
                                                borderRadius: "0px",
                                              }}
                                            />
                                          </button>
                                        </div>

                                        {field?.images?.map((file: string) => {
                                          return (
                                            <div className="p-image d-flex align-items-center">
                                              <button
                                                type="button"
                                                className="btn btn-danger p-image-remove"
                                                onClick={(evt) => {
                                                  handleRemoveImage(
                                                    evt,
                                                    file,
                                                    index,
                                                  );
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
                                    </td>
                                  </tr>
                                </>
                              );
                            },
                          )}
                        </tbody>
                      </table>
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
                        data={values.descriptions}
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
                        data={values.shortDescriptions}
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
                      {errors.shortDescriptions && touched.shortDescriptions ? (
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

              {/* Product Video */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Product Video (1080X1920 PX)</h5>
                    </div>

                    <div className="mb-3 col-md-6 d-flex justify-content-center flex-column">
                      <div className="input-group">
                        <input
                          type="file"
                          className="form-control"
                          id="videoFile"
                          onChange={(evt) => {
                            handleUploadVideo(evt);
                          }}
                          accept="video/*"
                        />
                        <label className="input-group-text" htmlFor="videoFile">
                          Upload
                        </label>
                      </div>

                      {touched.video && errors.video ? (
                        <p className="custom-form-error text-danger">
                          {errors.video}
                        </p>
                      ) : null}
                    </div>

                    <div className="col-md-6 text-center">
                      {values.video ? (
                        // <Link to={values.video} target="_blank">
                        <video
                          className="img img-fluid rounded bordered"
                          width={200}
                          controls
                          preload="metadata"
                        >
                          <source
                            src={addUrlToFile(values.video)}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      ) : // </Link>
                      null}
                      {values.video ? (
                        <button
                          type="button"
                          className="btn p-1"
                          onClick={(evt) => {
                            handleDeleteVideo(evt, values.video);
                          }}
                        >
                          <i className="fa fa-trash text-danger"></i>
                        </button>
                      ) : null}
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

              {/* Explore Range Products */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-3">Explore Range Products</h5>
                    </div>

                    {/* Select Explore Range Products */}
                    {/* Select Explore Range Products */}
                    <div className="form-group col-md-12">
                      <CustomSelect
                        label="Select Products"
                        placeholder="Select Products"
                        name="exploreProducts"
                        required={false}
                        options={exploreProducts}
                        value={values.exploreProducts}
                        error={errors.exploreProducts}
                        touched={touched.exploreProducts}
                        isMulti={true}
                        components={{
                          Option: CustomOption,
                          MultiValueLabel: CustomMultiValueLabel,
                        }}
                        handleChange={(value) => {
                          setFieldValue("exploreProducts", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("exploreProducts", true);
                        }}
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
        // ref={modalARef}
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

      {/* Select Image */}
      <div
        className="modal fade"
        id="selectImageForProduct"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectImageForProductLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h6
                className="modal-title"
                id="selectImageForProductLabel"
                style={{ fontSize: "16px" }}
              >
                Select Image
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
                                selectedImages?.includes(item)
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
              <button
                type="button"
                className="btn btn-secondary px-3 py-2"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary px-3 py-2"
                data-bs-dismiss="modal"
                onClick={handleAddImagesToProduct}
                disabled={selectedImages.length ? false : true}
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
