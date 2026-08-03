import { GoBackButton, OverlayLoading } from "../../components";

import { useEffect, useState } from "react";
import { get } from "../../utills";
import { Link, useNavigate, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import ReactHelmet from "../../components/ui/ReactHelmet";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [productDetails, setProductDetails] = useState<any>({});

  // get program details
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        const apiResponse = await get(`/products/${id}`, true);

        if (apiResponse?.status == 200) {
          setProductDetails(apiResponse?.body);
        }
        setLoading(false);
      }
      if (id) getData(id);
    },
    [id]
  );

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <ReactHelmet title="Priduct Details" />
              <h4 className="font-weight-bold mb-0">Product Details</h4>
            </div>
            <div>
              <Link
                to={`/products/add`}
                type="button"
                className="btn btn-primary text-light"
              >
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <OverlayLoading />
      ) : (
        <div className="row">
          <div className="col-md-12 ">
            {/* Product Details */}
            <div className="row gy-2">
              {/* Profile Card */}
              <div className="col-md-4">
                {/* Product Image */}
                <div className="card rounded-2">
                  <div className="card-body p-0">
                    <div className="text-center">
                      <img
                        className="img-fluid rounded"
                        style={{ maxHeight: 200 }}
                        src={addUrlToFile(productDetails.image)}
                        alt={productDetails?.name}
                      />
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="card card-body mt-2 rounded py-2">
                  <h5 className="text-center mb-2">{productDetails?.name}</h5>
                  <p className="text-center text-muted mb-1">
                    <strong>Slug:</strong> {productDetails?.slug}
                  </p>

                  <p className="text-center text-success mt-2">
                    {productDetails?.shortDescription}
                  </p>
                </div>
              </div>

              {/* Product Details */}
              <div className="col-md-8">
                <div className="card rounded-2" style={{ height: "100%" }}>
                  <div className="card-body table-responsive">
                    <h5 className="mb-3">Product Details</h5>

                    <table className="table table-striped table-borderless">
                      <tbody>
                        {/* <tr>
                          <td className="py-3">Name</td>
                          <td className="py-3" colSpan={3}>
                            {productDetails?.name}
                          </td>
                        </tr> */}
                        {/* <tr>
                          <td className="py-3">Slug</td>
                          <td className="py-3" colSpan={3}>
                            {productDetails?.slug}
                          </td>
                        </tr> */}
                        <tr>
                          <td className="py-3">Name</td>
                          <td className="py-3" colSpan={3}>
                            <div className="d-flex gap-1">
                              {productDetails?.name}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3">Category</td>
                          <td className="py-3" colSpan={3}>
                            <div className="d-flex gap-1">
                              {productDetails?.category?.name}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3">Sub Category</td>
                          <td className="py-3" colSpan={3}>
                            <div className="d-flex gap-1">
                              {productDetails?.subCategory?.name}
                            </div>
                          </td>
                        </tr>
                        {/* <tr>
                          <td className="py-3">Base Size</td>
                          <td className="py-3" colSpan={3}>
                            <div className="d-flex gap-1">
                              {productDetails?.size?.title}
                            </div>
                          </td>
                        </tr> */}

                        <tr>
                          <td className="py-3">Product SKU</td>
                          <td className="py-3">{productDetails?.sku}</td>
                          <td className="py-3">Status</td>
                          <td className="py-3">
                            {productDetails?.status == true
                              ? "Active"
                              : "Disabled"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants */}
          <div className="col-md-12">
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-2 cursor-hand"
                      data-bs-toggle="collapse"
                      data-bs-target="#productVariants"
                      aria-expanded="false"
                      aria-controls="productVariants"
                    >
                      Product Variants
                    </h5>
                    <button
                      className="btn btn-light p-2"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#productVariants"
                      aria-expanded="false"
                      aria-controls="productVariants"
                    >
                      <i className="fa fa-angle-down text-primary" />
                    </button>
                  </div>

                  <div className="collapse mt-2 show" id="productVariants">
                    <div className="row mt-2">
                      {/* Colors */}
                      <div className="col-md-3">
                        <div className="card shadow-none">
                          <div className="card-body ">
                            <h6>Colors</h6>
                            <ul>
                              {productDetails?.colors?.map((item: any) => {
                                return <li>{item.name}</li>;
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Shapes */}
                      <div className="col-md-3">
                        <div className="card shadow-none">
                          <div className="card-body">
                            <h6>Shapes</h6>
                            <ul>
                              {productDetails?.shapes?.map((item: any) => {
                                return <li>{item.name}</li>;
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Materials */}
                      <div className="col-md-3">
                        <div className="card shadow-none">
                          <div className="card-body">
                            <h6>Materials</h6>
                            <ul>
                              {productDetails?.materials?.map((item: any) => {
                                return <li>{item.name}</li>;
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Sizes */}
                      <div className="col-md-3">
                        <div className="card shadow-none">
                          <div className="card-body">
                            <h6>Sizes</h6>
                            <ul>
                              {productDetails?.sizes?.map((item: any) => {
                                return <li>{item.title}</li>;
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="col-md-12">
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-2 cursor-hand"
                      data-bs-toggle="collapse"
                      data-bs-target="#programDetails"
                      aria-expanded="false"
                      aria-controls="programDetails"
                    >
                      Descriptions
                    </h5>
                    <button
                      className="btn btn-light p-2"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#programDetails"
                      aria-expanded="false"
                      aria-controls="programDetails"
                    >
                      <i className="fa fa-angle-down text-primary" />
                    </button>
                  </div>

                  <div className="collapse mt-2 show" id="programDetails">
                    <div className="row mt-2">
                      <div className="col-md-12">
                        <div
                          className="card card-body rounded shadow-none border-0"
                          style={{ background: "#fafafa" }}
                        >
                          <h6 className="mb-3">Short Descriptions</h6>
                          <div
                            className="program-benifits"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(
                                productDetails.shortDescriptions
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-2">
                      <div className="col-md-12">
                        <div
                          className="card card-body rounded shadow-none border-0"
                          style={{ background: "#fff4e6" }}
                        >
                          <h6 className="mb-3">Long Descriptions</h6>
                          <div
                            className=""
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(
                                productDetails.descriptions
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-2">
                      <div className="col-md-12">
                        <div
                          className="card card-body rounded shadow-none border-0"
                          style={{ background: "#fafafa" }}
                        >
                          <h6 className="mb-3">Specifications</h6>
                          <div
                            className="program-benifits"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(
                                productDetails.specifications
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-2">
                      <div className="col-md-12">
                        <div
                          className="card card-body rounded shadow-none border-0"
                          style={{ background: "#fff4e6" }}
                        >
                          <h6 className="mb-3">Benefits</h6>
                          <div
                            className=""
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(
                                productDetails.benefits
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Ingredients */}
          {/* <div className="col-md-12">
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-2 cursor-hand"
                      data-bs-toggle="collapse"
                      data-bs-target="#productIngredients"
                      aria-expanded="false"
                      aria-controls="productIngredients"
                    >
                      Ingredients
                    </h5>
                    <button
                      className="btn btn-light p-2"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#productIngredients"
                      aria-expanded="false"
                      aria-controls="productIngredients"
                    >
                      <i className="fa fa-angle-down text-primary" />
                    </button>
                  </div>

                  <div className="collapse mt-2 show" id="productIngredients">
                    <div className="row mt-2">
                      {productIngredients?.map((item) => {
                        return (
                          <div className="col-md-3">
                            <div
                              className="card card-body rounded shadow-none border-0 text-center"
                              style={{ background: "#fafafa" }}
                            >
                              <h6 className="mb-3">{item?.name}</h6>
                              <div className="text-center">
                                <img
                                  src={item.image}
                                  alt=""
                                  style={{
                                    height: "80px",
                                    width: "80px",
                                    borderRadius: 40,
                                  }}
                                />
                              </div>
                              <div
                                className="program-benifits mt-2"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    item.shortDescription
                                  ),
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Product Images */}
          <div className="col-md-12">
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-2 cursor-hand"
                      data-bs-toggle="collapse"
                      data-bs-target="#productImages"
                      aria-expanded="false"
                      aria-controls="productImages"
                    >
                      Product Images
                    </h5>
                    <button
                      className="btn btn-light p-2"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#productImages"
                      aria-expanded="false"
                      aria-controls="productImages"
                    >
                      <i className="fa fa-angle-down text-primary" />
                    </button>
                  </div>

                  <div className="collapse mt-2" id="productImages">
                    <div className="row p-2">
                      <div className="col-md-12">
                        <div className="d-flex gap-4">
                          {productDetails?.images?.map((item: string) => {
                            return (
                              <div className="p-image">
                                <img
                                  className="img img-thumbnail"
                                  src={addUrlToFile(item)}
                                  alt=""
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* META Details */}
          <div className="col-md-12">
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-2 cursor-hand"
                      data-bs-toggle="collapse"
                      data-bs-target="#metaDetails"
                      aria-expanded="false"
                      aria-controls="metaDetails"
                    >
                      META Details
                    </h5>
                    <button
                      className="btn btn-light p-2"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#metaDetails"
                      aria-expanded="false"
                      aria-controls="metaDetails"
                    >
                      <i className="fa fa-angle-down text-primary" />
                    </button>
                  </div>

                  <div className="collapse mt-2" id="metaDetails">
                    <div className=" shadow-none p-2 mb-3">
                      <div
                        className="card card-body rounded shadow-none border-0"
                        style={{ background: "#fff4e6" }}
                      >
                        <h6>META Title</h6>
                        <p>{productDetails.metaTitle}</p>
                      </div>

                      <div
                        className="card card-body rounded shadow-none border-0 mt-2"
                        style={{ background: "#fff4e6" }}
                      >
                        <h6>META Description</h6>
                        <p>{productDetails.metaDescription}</p>
                      </div>

                      <div
                        className="card card-body rounded shadow-none border-0 mt-2"
                        style={{ background: "#fff4e6" }}
                      >
                        <h6>META Keywords</h6>
                        <p>{productDetails.metaKeywords}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
