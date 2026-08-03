import {
  CustomSelect,
  GoBackButton,
  InputBox,
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
import { generateSlug, get, post, put } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

export function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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

          body.product = {
            label: body?.product?.name,
            value: body?.product?._id,
          };

          setValues(body);
        }
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
          <div className="card rounded-2">
            <div className="card-body">
              <form className="forms-sample" onSubmit={handleSubmit}>
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
                  <div className="form-group col-md-6">
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
                  </div>

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

                <SubmitButton loading={false} text="Update Review" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
