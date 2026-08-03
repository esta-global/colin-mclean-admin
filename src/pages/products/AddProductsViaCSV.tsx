import { GoBackButton } from "../../components";

import React, { useEffect, useState } from "react";
import { generateSlug, get, post } from "../../utills";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import Papa from "papaparse";
import { createProduct } from "../../csvHelpers/productCsv";
import { CSVLink } from "react-csv";

export function AddProductViaCSV() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [shapes, setShapes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [thickness, setThickness] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);

  const [uploadedProducts, setUploadedProducts] = useState<any[]>([]);
  const [failedProducts, setFailedProducts] = useState<any[]>([]);

  async function handleSubmit() {
    setLoading(true);

    for (let item of csvData) {
      const newValue: any = {
        name: item.name,
        slug: item.slug,
        category: item.category?._id,
        subCategory: item.subCategory?._id,
        features: Array.isArray(item?.features)
          ? item.features.map((f: any) => f._id)
          : [],
        sku: item.sku,
        status: item.status?.toLowerCase() || "false",

        descriptions: item.descriptions,
        shortDescriptions: item.shortDescriptions,
        specifications: item.specifications,
        benefits: item.benefits,

        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        metaKeywords: item.metaKeywords,
        tags: item.tags,

        image: item.image,
      };

      let productVariants = [];
      for (let variant of item.variants) {
        let obj = {
          sku: variant.sku,
          color: variant.color?._id,
          shape: variant.shape?._id,
          material: variant.material?._id,
          size: variant.size?._id,
          thickness: variant.thickness?._id,
          badges: variant?.badges?.map((badge: any) => {
            return badge._id;
          }),
          descriptions: variant.descriptions,
          images: variant.images,
          status: variant.status,
        };
        productVariants.push(obj);
      }

      newValue.variants = productVariants;

      const apiResponse = await post("/products/createByCsv", newValue, true);

      if (apiResponse?.status == 200) {
        setUploadedProducts((old) => {
          return [...old, apiResponse.body];
        });

        // toast.success(apiResponse?.message);
      } else {
        // toast.error(apiResponse?.message);

        console.log(apiResponse?.errors);

        setFailedProducts((old) => {
          newValue.category = item?.category?.slug;
          newValue.subCategory = item?.subCategory?.slug;

          newValue.errors = [
            apiResponse?.errors?.slug,
            apiResponse?.errors?.name,
          ];

          return [...old, newValue];
        });
      }
    }

    setLoading(false);
  }

  function camelize(str: string) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  }

  const fileChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    let files: any = null;

    if (event?.target?.files) {
      files = event?.target?.files[0];
    }

    if (files) {
      setUploadLoading(true);

      Papa.parse(files, {
        complete: async (results: any) => {
          let keys = results.data[0];

          // I want to remove some óíúáé, blan spaces, etc
          // keys = results.data[0].map((v: any) =>
          //   v
          //     // .toLowerCase()
          //     .replace(/ /g, "_")
          //     .normalize("NFD")
          //     .replace(/[\u0300-\u036f]/g, "")
          //     .toLowerCase()
          // );

          keys = results.data[0].map((v: any) =>
            camelize(
              v
                .toLowerCase()
                // .replace(/ /g, "_")
                .normalize("NFD")
                .replace(/[\u0300-\u036f\*]/g, ""), // Added \* to remove asterisks (*)
            ),
          );

          let values = results.data.slice(1);

          let objects = values.map((array: any) => {
            let object: any = {};
            keys.forEach((key: any, i: number) => (object[key] = array[i]));
            return object;
          });

          let arrayOfData = [];

          let productSlug = "";
          for (let item of objects) {
            if (item.name) {
              if (!item.slug) {
                item.slug = generateSlug(item.name);
              }

              productSlug = item.slug;

              let cats = handleGetCategoryDetails(item.category);
              item.category = cats;

              let subCat = handleGetSubCategoryDetails(item.subCategory);
              item.subCategory = subCat;

              if (item.features) {
                let featuresSlugArray = item.features?.split(",");
                let featuresData = featuresSlugArray.map((item: string) => {
                  return handleGetFeaturesDetails(item);
                });

                item.features = featuresData;
              }

              // Variants
              item.variants = [];
              let variant: any = {};

              variant.sku = item.variantSku;
              variant.status = item?.variantStatus?.toLowerCase() || false;

              if (item?.variantImages) {
                variant.images = item?.variantImages?.split(",");
              }

              let color = handleGetColorDetails(item.variantColor);
              variant.color = color;

              let shape = handleGetShapeDetails(item.variantShape);
              variant.shape = shape;

              let material = handleGetMaterialDetails(item.variantMaterial);
              variant.material = material;

              let size = handleGetSizeDetails(item.variantSize);
              variant.size = size;

              let thickness = handleGetThicknessDetails(item.variantThickness);
              variant.thickness = thickness;

              if (item?.variantBadges) {
                let badgesTitleArray = item?.variantBadges?.split(",");
                variant.badges = badgesTitleArray.map((item: string) => {
                  return handleGetBadgeDetails(item);
                });
              }

              variant.descriptions = item.variantDescriptions;

              item.variants.push(variant);

              // let decor = handleGetDecorSeriesDetails(item.decorSeries);
              // item.decorSeries = decor;

              // submitHandler(item);
              arrayOfData.push(item);
            } else {
              let variant: any = {};

              variant.sku = item.variantSku;
              variant.status = item?.variantStatus?.toLowerCase() || false;

              if (item?.variantImages) {
                variant.images = item?.variantImages?.split(",");
              }

              let color = handleGetColorDetails(item.variantColor);
              variant.color = color;

              let shape = handleGetShapeDetails(item.variantShape);
              variant.shape = shape;

              let material = handleGetMaterialDetails(item.variantMaterial);
              variant.material = material;

              let size = handleGetSizeDetails(item.variantSize);
              variant.size = size;

              let thickness = handleGetThicknessDetails(item.variantThickness);
              variant.thickness = thickness;

              if (item?.variantBadges) {
                let badgesTitleArray = item?.variantBadges?.split(",");
                variant.badges = badgesTitleArray.map((item: string) => {
                  return handleGetBadgeDetails(item);
                });
              }

              variant.descriptions = item.variantDescriptions;

              let product = arrayOfData.find(
                (item) => item.slug === productSlug,
              );
              product.variants.push(variant);
            }
          }

          setCsvData(arrayOfData);
        },
      });
    }
  };

  // Get Categories
  useEffect(function () {
    async function getData() {
      setLoading(true);
      let url = `/categories?limit=0`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setCategories(apiResponse.body);
      } else {
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    }
    getData();
  }, []);

  // Get Sub Categories
  useEffect(function () {
    async function getData() {
      setLoading(true);
      let url = `/subCategories?limit=0`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setSubCategories(apiResponse.body);
      } else {
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    }
    getData();
  }, []);

  // Get Colors
  useEffect(function () {
    async function getData() {
      let url = `/colors?limit=0`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setColors(apiResponse.body);
      } else {
        toast.error(apiResponse?.message);
      }
    }
    getData();
  }, []);

  // Get Shapes
  useEffect(function () {
    async function getData() {
      let url = `/shapes?limit=0`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setShapes(apiResponse.body);
      } else {
        toast.error(apiResponse?.message);
      }
    }
    getData();
  }, []);

  // Get Materials
  useEffect(function () {
    async function getData() {
      let url = `/materials?limit=0`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setMaterials(apiResponse.body);
      } else {
        toast.error(apiResponse?.message);
      }
    }
    getData();
  }, []);

  // Get Sizes
  useEffect(function () {
    async function getData() {
      setLoading(true);
      let url = `/sizes?limit=0`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setSizes(apiResponse.body);
      } else {
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    }
    getData();
  }, []);

  // Get Thickness
  useEffect(function () {
    async function getData() {
      let url = `/thickness?limit=0`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setThickness(apiResponse.body);
      } else {
        toast.error(apiResponse?.message);
      }
    }
    getData();
  }, []);

  // Get Features
  useEffect(function () {
    async function getData() {
      let url = `/features?limit=0`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setFeatures(apiResponse.body);
      } else {
        toast.error(apiResponse?.message);
      }
    }
    getData();
  }, []);

  // Get Badges
  useEffect(function () {
    async function getData() {
      let url = `/badges?limit=0`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        setBadges(apiResponse.body);
      } else {
        toast.error(apiResponse?.message);
      }
    }
    getData();
  }, []);

  function handleGetCategoryDetails(categorySlug: string) {
    return (
      categories.find((category) => category.slug === categorySlug) || null
    );
  }

  function handleGetSubCategoryDetails(categorySlug: string) {
    return (
      subCategories.find((category) => category.slug === categorySlug) || null
    );
  }

  function handleGetColorDetails(colorName: string) {
    return colors.find((item) => item.name === colorName) || null;
  }

  function handleGetShapeDetails(shapeName: string) {
    return shapes.find((item) => item.name === shapeName) || null;
  }

  function handleGetMaterialDetails(materialName: string) {
    return materials.find((item) => item.name === materialName) || null;
  }

  function handleGetSizeDetails(sizeTitle: string) {
    return sizes.find((size) => size.title === sizeTitle) || null;
  }

  function handleGetThicknessDetails(thicknessName: string) {
    return thickness.find((item) => item.name === thicknessName) || null;
  }

  function handleGetFeaturesDetails(featuresSlug: string) {
    return features.find((item) => item.slug === featuresSlug) || null;
  }

  function handleGetBadgeDetails(badgeTitle: string) {
    return badges.find((item) => item.title === badgeTitle) || null;
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Add Product Via CSV</h4>
            </div>
            <div>
              <CSVLink
                className="btn btn-primary text-light"
                data={createProduct.data}
                headers={createProduct.headers}
                filename="product-upload.csv"
              >
                Download CSV
              </CSVLink>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          {/* Basic Details */}
          <div className="card rounded-2">
            <div className="card-body">
              <form className="forms-sample">
                <div className="row">
                  {/* <div className="col-md-12">
                    <h5 className="mb-2">Basic Details</h5>
                  </div> */}

                  {/* Product Name */}
                  <div className="form-group col-md-12">
                    <label htmlFor="">
                      Upload CSV <span className="text-danger">*</span>{" "}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={fileChangeHandler}
                    />
                  </div>

                  <div className="">
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={handleSubmit}
                    >
                      Add Product
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Product Preview */}
        <div className="col-md-12">
          <div className="card rounded-2 my-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 d-flex justify-content-between align-items-center">
                  <h5
                    className="mb-2 cursor-hand"
                    data-bs-toggle="collapse"
                    data-bs-target="#productPreview"
                    aria-expanded="false"
                    aria-controls="productPreview"
                  >
                    Product Preview
                  </h5>
                  <button
                    className="btn btn-light p-2"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#productPreview"
                    aria-expanded="false"
                    aria-controls="productPreview"
                  >
                    <i className="fa fa-angle-down text-primary" />
                  </button>
                </div>

                <div className="collapse mt-2" id="productPreview">
                  <div className=" shadow-none p-2 mb-3">
                    <div className="col-md-12 table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th>NAME</th>
                            <th>SLUG</th>
                            <th>CATEGORY</th>
                            <th>SUB CATEGORY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvData?.map((item: any) => {
                            return (
                              <>
                                <tr>
                                  <td>{item.name}</td>
                                  <td>{item.slug}</td>
                                  <td>
                                    <span>{item.category?.name}</span>
                                  </td>
                                  <td>
                                    <span>{item.subCategory?.name}</span>
                                  </td>
                                </tr>

                                {item?.variants?.map((variant: any) => {
                                  return (
                                    <tr>
                                      <td></td>
                                      <td colSpan={3}>
                                        Color : {variant?.color?.name} | Shape :{" "}
                                        {variant?.shape?.name} | Material:{" "}
                                        {variant?.material?.name} | Size :{" "}
                                        {variant?.size?.title}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Failed Uploading */}
        <div className="col-md-12">
          <div className="card rounded-2 my-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 d-flex justify-content-between align-items-center">
                  <h5
                    className="mb-2 cursor-hand"
                    data-bs-toggle="collapse"
                    data-bs-target="#faildUploadingProducts"
                    aria-expanded="false"
                    aria-controls="faildUploadingProducts"
                  >
                    Failed Uploading
                  </h5>
                  <button
                    className="btn btn-light p-2"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faildUploadingProducts"
                    aria-expanded="false"
                    aria-controls="faildUploadingProducts"
                  >
                    <i className="fa fa-angle-down text-primary" />
                  </button>
                </div>

                <div className="collapse mt-2" id="faildUploadingProducts">
                  <div className=" shadow-none p-2 mb-3">
                    <div className="col-md-12 table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th>NAME</th>
                            <th>SLUG</th>
                            <th>CATEGORY</th>
                            <th>SUB CATEGORY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {failedProducts?.map((item: any) => {
                            return (
                              <tr key={item._id}>
                                <td>{item.name}</td>
                                <td>{item.slug}</td>
                                <td>{item?.category}</td>
                                <td>{item?.subCategory}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="">
                    <CSVLink
                      className="btn btn-primary text-light"
                      data={failedProducts}
                      headers={createProduct.headers}
                      filename="failed-product-uploading.csv"
                    >
                      Export to CSV
                    </CSVLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Products */}
        <div className="col-md-12">
          <div className="card rounded-2 my-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 d-flex justify-content-between align-items-center">
                  <h5
                    className="mb-2 cursor-hand"
                    data-bs-toggle="collapse"
                    data-bs-target="#uploadedProducts"
                    aria-expanded="false"
                    aria-controls="uploadedProducts"
                  >
                    Uploaded Products
                  </h5>
                  <button
                    className="btn btn-light p-2"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#uploadedProducts"
                    aria-expanded="false"
                    aria-controls="uploadedProducts"
                  >
                    <i className="fa fa-angle-down text-primary" />
                  </button>
                </div>

                <div className="collapse mt-2" id="uploadedProducts">
                  <div className=" shadow-none p-2 mb-3">
                    <div className="col-md-12 table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th>NAME</th>
                            <th>SLUG</th>
                            <th>CATEGORY</th>
                            <th>SUB CATEGORY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedProducts?.map((item: any) => {
                            return (
                              <tr key={item._id}>
                                <td>{item.name}</td>
                                <td>{item.slug}</td>
                                <td>{item?.category?.slug}</td>
                                <td>{item?.subCategory?.slug}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
