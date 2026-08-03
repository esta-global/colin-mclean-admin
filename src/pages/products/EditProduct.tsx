import {
  CustomSelect,
  GoBackButton,
  InputBox,
  OverlayLoading,
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

import { get, put, remove, validateNumber, validateSlug } from "../../utills";

import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../constants";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import ReactHelmet from "../../components/ui/ReactHelmet";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  type PRODUCT_VARIANTS = {
    color: { label: string; value: string } | null;
    sizes: {
      salePrice: string;
      mrp: string;
      stock: string;
      size: { label: string; value: string } | null;
      image: string;
      images: string[];
    }[];
    error?: string;
  };
  const [productVariantInputFields, setProductVariantInputFields] = useState<
    PRODUCT_VARIANTS[]
  >([
    {
      color: null,
      sizes: [
        {
          salePrice: "0",
          mrp: "0",
          stock: "1",
          size: null,
          image: "",
          images: [],
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
      helpers: FormikHelpers<ProductValues>,
    ) {
      const newValue: any = {
        ...values,

        category: values?.category?.value,
        subCategory: values.subCategory?.value,

        taxModel: values?.taxModel?.value,
      };

      let productVariants = [];
      for (let variantFeild of productVariantInputFields) {
        if (variantFeild.color && variantFeild.sizes?.length) {
          productVariants.push({
            color: variantFeild.color?.value,
            sizes: variantFeild.sizes?.map((item) => {
              return {
                size: item.size?.value,
                mrp: item.mrp,
                salePrice: item.salePrice,
                stock: item.stock,
                images: item.images,
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
      let url = `/colors?limit=0&status=true`;
      const apiResponse = await get(url, true);
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

          if (data.taxModel) {
            data.taxModel = {
              label: data.taxModel,
              value: data.taxModel,
            };
          }

          if (data?.variants) {
            if (data.variants?.length) {
              let variants = [];
              for (let item of data.variants) {
                let varient = {
                  color: { label: item.color.name, value: item.color._id },
                  sizes: item?.sizes?.map((sizeValue: any) => {
                    return {
                      size: {
                        label: sizeValue?.size?.title,
                        value: sizeValue?.size?._id,
                      },
                      mrp: sizeValue?.mrp,
                      salePrice: sizeValue?.salePrice,
                      stock: sizeValue?.stock,
                      images: sizeValue?.images,
                    };
                  }),
                };

                variants.push(varient);
              }

              setProductVariantInputFields(variants);
            }
          }

          data.status = `${data.status}`;
          setValues(data);
        }
        setLoading(false);
      }
      if (id) getData(id);
    },
    [id],
  );

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

  const handleAddVariantFields = () => {
    setProductVariantInputFields([
      ...productVariantInputFields,
      {
        color: null,
        sizes: [
          {
            salePrice: "0",
            mrp: "0",
            stock: "1",
            size: null,
            image: "",
            images: [],
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
        salePrice: "0",
        mrp: "0",
        stock: "1",
        size: null,
        image: "",
        images: [],
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
    sizeIndex: number,
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

  // handleUploadFiles
  async function handleUploadFiles(
    event: React.ChangeEvent<HTMLInputElement>,
    colorIndex: number,
    sizeIndex: number,
  ) {
    console.log(colorIndex, sizeIndex);

    const mimeTypes = ["image/jpeg", "image/png", "image/webp"];
    const files = event.target.files;

    if (!files || files.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    const formData = new FormData();

    // Validate and append allowed files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (mimeTypes.includes(file.type)) {
        formData.append("files", file);
      } else {
        toast.error(`File type ${file.type} is not allowed.`);
      }
    }

    try {
      const url = `${API_URL}/fileUploads`;
      const apiResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const apiData = await apiResponse.json();

      if (apiData.status === 200) {
        const newImages = apiData.body.map((item: any) => item.filename);

        // ✅ Update the images array in state
        setProductVariantInputFields((prev) => {
          const updated = [...prev];
          const sizes = [...updated[colorIndex].sizes];
          const currentImages = sizes[sizeIndex].images || [];

          sizes[sizeIndex] = {
            ...sizes[sizeIndex],
            images: [...currentImages, ...newImages],
          };

          updated[colorIndex] = {
            ...updated[colorIndex],
            sizes,
          };

          return updated;
        });

        toast.success("Images uploaded successfully.");
      } else {
        toast.error(apiData.message || "Upload failed.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong.");
    }
  }

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
        // if (inputElementName == "kycFile") {
        //   let kycDocsFiles = [...kycDocuments];
        //   kycDocuments[index]["error"] = "File type is not allowed";
        //   return setKycDocumnets(kycDocsFiles);
        // } else if (inputElementName == "certificateFile") {
        //   let certificateFields = [...faqsInputFields];
        //   certificateFields[index]["error"] = "File type is not allowed";
        //   return setFaqsInputFields(certificateFields);
        // }
      }
    }

    // Append each file to the FormData object
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      let url = `${API_URL}/fileUploads`;
      const apiResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        let images = apiData?.body?.map((item: any) => {
          return item.filename;
        });

        setUploadedImages((old) => {
          return [...old, ...images];
        });
        // if (inputElementName == "kycFile") {
        //   let kycDocsFiles = [...kycDocuments];
        //   kycDocuments[index]["error"] = "";
        //   kycDocuments[index]["file"] = apiData.body[0];
        //   setKycDocumnets(kycDocsFiles);
        // } else if (inputElementName == "certificateFile") {
        //   let certificateFields = [...faqsInputFields];
        //   certificateFields[index]["error"] = "";
        //   certificateFields[index]["file"] = apiData.body[0];
        //   setFaqsInputFields(certificateFields);
        // }
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
      const apiResponse = await remove(`/fileUploads/${fileName}`);

      if (apiResponse?.status == 200) {
        let images = [...uploadedImages];
        images.splice(index, 1);
        setUploadedImages(images);
      } else {
        let images = [...uploadedImages];
        images.splice(index, 1);
        setUploadedImages(images);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleUploadImage
  async function handleUploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("image", true);
      setFieldError("image", "Profile Photo is required field");
      toast.error("Profile Photo is required field");
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list

    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("image", true);
      setFieldError("image", "Must select the valid image file");
      toast.error("Must select the valid image file");
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

  // handleDeleteImage
  async function handleDeleteImage(
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

  //
  async function handleDeleteFiles(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
    colorIndex: number,
    sizeIndex: number,
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);

      if (apiResponse?.status === 200) {
        // Update state by removing the file from images[]
        setProductVariantInputFields((prev) => {
          const updated = [...prev];
          const sizes = [...updated[colorIndex].sizes];
          const currentSize = { ...sizes[sizeIndex] };

          const filteredImages = currentSize.images.filter(
            (img) => img !== fileName,
          );

          sizes[sizeIndex] = {
            ...currentSize,
            images: filteredImages,
          };

          updated[colorIndex] = {
            ...updated[colorIndex],
            sizes,
          };

          return updated;
        });

        toast.success("Image deleted successfully");
      } else {
        setProductVariantInputFields((prev) => {
          const updated = [...prev];
          const sizes = [...updated[colorIndex].sizes];
          const currentSize = { ...sizes[sizeIndex] };

          const filteredImages = currentSize.images.filter(
            (img) => img !== fileName,
          );

          sizes[sizeIndex] = {
            ...currentSize,
            images: filteredImages,
          };

          updated[colorIndex] = {
            ...updated[colorIndex],
            sizes,
          };

          return updated;
        });
        toast.error(apiResponse?.message || "Failed to delete image");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred during deletion");
    }
  }

  return (
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

                  <div className="form-group col-md-6">
                    <label htmlFor="">
                      Product Badge <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="badge"
                          id="badge-best-seller"
                          value={"BEST_SELLER"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.badge == "BEST_SELLER"}
                        />
                        <label htmlFor="badge-best-seller" className="mt-2">
                          Best Seller
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="badge"
                          id="badge-top-selling"
                          value={"TOP_SELLING"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.badge == "TOP_SELLING"}
                        />
                        <label htmlFor="badge-top-selling" className="mt-2">
                          Top Selling
                        </label>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="badge"
                          id="badge-limited-edition"
                          value={"LIMITED_EDITION"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.badge == "LIMITED_EDITION"}
                        />
                        <label htmlFor="badge-limited-edition" className="mt-2">
                          Limited Edition
                        </label>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="badge"
                          id="badge-none"
                          value={""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.badge == ""}
                        />
                        <label htmlFor="badge-none" className="mt-2">
                          None of These
                        </label>
                      </div>
                    </div>
                    {errors.badge && touched.badge ? (
                      <p className="custom-form-error text-danger">
                        {errors.badge}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-3">Tax Information</h5>
                  </div>

                  {/* Tax Percentage */}
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Tax Percentage"
                      name="taxPercent"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "taxPercent",
                          validateNumber(evt.target.value),
                        );
                      }}
                      type="number"
                      placeholder="Enter sale price"
                      value={values.taxPercent}
                      required={true}
                      touched={touched.taxPercent}
                      error={errors.taxPercent}
                    />
                  </div>

                  {/* Tax Model */}
                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Tax Model"
                      placeholder="Tax Model"
                      name="taxModel"
                      required={true}
                      options={[
                        { label: "INCLUDE", value: "INCLUDE" },
                        { label: "EXCLUDE", value: "EXCLUDE" },
                      ]}
                      value={values.taxModel}
                      error={errors.taxModel}
                      touched={touched.taxModel}
                      handleChange={(value) => {
                        setFieldValue("taxModel", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("taxModel", true);
                      }}
                      isMulti={false}
                    />
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
                              updatedInputFields[index]["color"] = value;
                              setProductVariantInputFields(updatedInputFields);
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
                                onClick={() => handleRemoveVariantFields(index)}
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
                                <th>MRP</th>
                                <th>Sale Price</th>
                                <th>
                                  <span>Stock</span>
                                </th>
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
                                console.log(sizeIndex);
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
                                                sizeIndex,
                                              );
                                            }}
                                          >
                                            <i className="fas fa-trash text-danger"></i>
                                          </button>
                                        </div>
                                      ) : null}
                                    </td>
                                    <td style={{ width: "200px" }}>
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
                                            updatedInputFields[index]["sizes"][
                                              sizeIndex
                                            ]["size"] = value;
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
                                      </div>
                                    </td>

                                    <td style={{ width: "100px" }}>
                                      <div className="form-group m-0">
                                        <input
                                          className="form-control"
                                          value={sizeField.mrp}
                                          onChange={(e) => {
                                            const updatedInputFields = [
                                              ...productVariantInputFields,
                                            ];
                                            updatedInputFields[index]["sizes"][
                                              sizeIndex
                                            ]["mrp"] = e.target.value;
                                            setProductVariantInputFields(
                                              updatedInputFields,
                                            );
                                          }}
                                          placeholder="MRP"
                                          style={{
                                            padding: "10px",
                                            borderRadius: "5px",
                                          }}
                                        />
                                      </div>
                                    </td>

                                    <td style={{ width: "100px" }}>
                                      <div className="form-group m-0">
                                        <input
                                          className="form-control"
                                          value={sizeField.salePrice}
                                          onChange={(e) => {
                                            const updatedInputFields = [
                                              ...productVariantInputFields,
                                            ];
                                            updatedInputFields[index]["sizes"][
                                              sizeIndex
                                            ]["salePrice"] = e.target.value;
                                            setProductVariantInputFields(
                                              updatedInputFields,
                                            );
                                          }}
                                          placeholder="Sale Price"
                                          style={{
                                            padding: "10px",
                                            borderRadius: "5px",
                                          }}
                                        />
                                      </div>
                                    </td>

                                    <td style={{ width: "100px" }}>
                                      <div
                                        className="form-group m-0 d-flex gap-1"
                                        style={{ alignItems: "center" }}
                                      >
                                        <div className="">
                                          <input
                                            className="form-control"
                                            value={sizeField.stock}
                                            onChange={(e) => {
                                              const updatedInputFields = [
                                                ...productVariantInputFields,
                                              ];
                                              updatedInputFields[index][
                                                "sizes"
                                              ][sizeIndex]["stock"] =
                                                e.target.value;
                                              setProductVariantInputFields(
                                                updatedInputFields,
                                              );
                                            }}
                                            placeholder="Sale Price"
                                            style={{
                                              padding: "10px",
                                              borderRadius: "5px",
                                            }}
                                          />
                                        </div>

                                        {/* {sizeIndex != 0 ? (
                                                        <div className="">
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
                                                      ) : null} */}
                                      </div>
                                    </td>

                                    {/* <td style={{ width: "100px" }}>
                                                    <div className="">
                                                      {!sizeField.image ? (
                                                        <div className="">
                                                          <input
                                                            type="file"
                                                            id="image"
                                                            style={{ display: "none" }}
                                                            onChange={(evt) => {
                                                              handleUploadImage(
                                                                evt,
                                                                index,
                                                                sizeIndex
                                                              );
                                                            }}
                                                          />
                                                          <label htmlFor="image">
                                                            <img
                                                              src="/images/select-photo.png"
                                                              style={{
                                                                borderRadius: "0px",
                                                              }}
                                                            />
                                                          </label>
                                                        </div>
                                                      ) : null}
            
                                                      {sizeField.image ? (
                                                        <Link
                                                          to={`${sizeField.image}`}
                                                          target="_blank"
                                                        >
                                                          <img
                                                            className="img"
                                                            height={43}
                                                            width={43}
                                                            src={addUrlToFile(
                                                              sizeField.image
                                                            )}
                                                          />
                                                        </Link>
                                                      ) : null}
                                                      {sizeField.image ? (
                                                        <button
                                                          type="button"
                                                          className="btn p-1"
                                                          onClick={(evt) => {
                                                            handleDeleteImage(
                                                              evt,
                                                              sizeField.image,
                                                              index,
                                                              sizeIndex
                                                            );
                                                          }}
                                                        >
                                                          <i className="fa fa-trash text-danger"></i>
                                                        </button>
                                                      ) : null}
                                                    </div>
                                                  </td> */}

                                    <td>
                                      <div className="d-flex align-items-center gap-2">
                                        <div>
                                          <input
                                            type="file"
                                            id={`images-${index}-${sizeIndex}`}
                                            style={{ display: "none" }}
                                            multiple={true}
                                            onChange={(evt) => {
                                              handleUploadFiles(
                                                evt,
                                                index,
                                                sizeIndex,
                                              );
                                            }}
                                          />

                                          <label
                                            htmlFor={`images-${index}-${sizeIndex}`}
                                          >
                                            <img
                                              src="/images/select-photo.png"
                                              style={{ borderRadius: "0px" }}
                                            />
                                          </label>
                                        </div>

                                        {sizeField?.images?.map(
                                          (file: string, fileIndex: number) => {
                                            return (
                                              <div className="p-image d-flex align-items-center">
                                                <button
                                                  type="button"
                                                  className="btn btn-danger p-image-remove"
                                                  onClick={(evt) => {
                                                    handleDeleteFiles(
                                                      evt,
                                                      file,
                                                      index,
                                                      sizeIndex,
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
                                          },
                                        )}
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

            {/* Order & Shipping */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-3">Order & Shipping</h5>
                  </div>

                  {/* Minimum Order Quantity */}
                  <div className="form-group col-md-4">
                    <InputBox
                      label="Minimum Order Quantity"
                      name="minimumOrderQuantity"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "minimumOrderQuantity",
                          validateNumber(evt.target.value),
                        );
                      }}
                      type="text"
                      placeholder="Enter order quantity"
                      value={values.minimumOrderQuantity}
                      required={true}
                      touched={touched.minimumOrderQuantity}
                      error={errors.minimumOrderQuantity}
                    />
                  </div>

                  {/* Shipping Cost */}
                  <div className="form-group col-md-4">
                    <InputBox
                      label="Shipping Cost"
                      name="shippingCost"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "shippingCost",
                          validateNumber(evt.target.value),
                        );
                      }}
                      type="text"
                      placeholder="Enter order quantity"
                      value={values.shippingCost}
                      required={false}
                      touched={touched.shippingCost}
                      error={errors.shippingCost}
                    />
                  </div>

                  <div className="form-group col-md-4">
                    <label htmlFor="">
                      Shipping Multiply With Quantity{" "}
                      {/* <span className="text-danger">*</span> */}
                    </label>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="shippingMultiplyWithQuantity"
                          id="shippingMultiplyWithQuantityTrue"
                          value={"true"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={
                            values.shippingMultiplyWithQuantity == "true"
                          }
                        />
                        <label
                          htmlFor="shippingMultiplyWithQuantityTrue"
                          className="mt-2"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <input
                          type="radio"
                          name="shippingMultiplyWithQuantity"
                          id="shippingMultiplyWithQuantityFalse"
                          value={"false"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={
                            values.shippingMultiplyWithQuantity == "false"
                          }
                        />
                        <label
                          htmlFor="shippingMultiplyWithQuantityFalse"
                          className="mt-2"
                        >
                          No
                        </label>
                      </div>
                    </div>
                    {errors.shippingMultiplyWithQuantity &&
                    touched.shippingMultiplyWithQuantity ? (
                      <p className="custom-form-error text-danger">
                        {errors.shippingMultiplyWithQuantity}
                      </p>
                    ) : null}
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
                  <div className="col-md-12 form-group">
                    <label htmlFor={"descriptions"} className="mb-2">
                      Long Descriptions
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
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

                  <div className="col-md-12 form-group">
                    <label htmlFor={"description"} className="mb-2">
                      Short Description
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
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

                  {/* <div className="col-md-12 form-group">
                    <label htmlFor={"description"} className="mb-2">
                      How To Use
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={values.howToUse}
                      onChange={(__, editor) => {
                        const data = editor.getData();
                        setFieldValue("howToUse", data);
                      }}
                      onBlur={() => {
                        setFieldTouched("howToUse", true);
                      }}
                      onFocus={() => {}}
                      id={"howToUse"}
                    />
                    {errors.howToUse && touched.howToUse ? (
                      <p className="custom-form-error text-danger">
                        {errors.howToUse}
                      </p>
                    ) : null}
                  </div> */}

                  <div className="col-md-12 form-group">
                    <label htmlFor={"description"} className="mb-2">
                      Benefits
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
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
  );
}
