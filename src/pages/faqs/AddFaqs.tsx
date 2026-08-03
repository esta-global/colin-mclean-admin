import { CustomSelect, GoBackButton, SubmitButton } from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  faqsSchema,
  FaqsValue,
  faqsInitialValues,
} from "../../validationSchemas/faqsSchema";

import { useEffect, useState } from "react";
import { get, post } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export function AddFaqs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState([]);

  // get category
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/faqsCategory", true);
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
      values: FaqsValue,
      helpers: FormikHelpers<FaqsValue>
    ) {
      setLoading(true);

      const newValue = {
        ...values,
        faqsCategory: values?.faqsCategory?.value,
      };

      const apiResponse = await post("/faqs", newValue, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: faqsInitialValues,
    validationSchema: faqsSchema,
  });

  return (
    <>
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Add FaQs</h4>
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
                        label="Select Category"
                        placeholder="Select Category"
                        name="faqsCategory"
                        required={true}
                        options={categories}
                        value={values.faqsCategory}
                        error={errors.faqsCategory}
                        touched={touched.faqsCategory}
                        isMulti={false}
                        handleChange={(value) => {
                          setFieldValue("faqsCategory", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("faqsCategory", true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Question*/}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-3">Question & Answer </h5>
                    </div>

                    <div className="col-md-12 form-group">
                      <label htmlFor={"description"} className="mb-2">
                        Question
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values.question || ""}
                        onChange={(__, editor) => {
                          const data = editor.getData();
                          setFieldValue("question", data);
                        }}
                        onBlur={() => {
                          setFieldTouched("question", true);
                        }}
                        onFocus={() => {}}
                        id={"question"}
                      />
                      {errors.question && touched.question ? (
                        <p className="custom-form-error text-danger">
                          {errors.question}
                        </p>
                      ) : null}
                    </div>

                    <div className="col-md-12 form-group">
                      <label htmlFor={"description"} className="mb-2">
                        Answer
                      </label>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={values.answer || ""}
                        onChange={(__, editor) => {
                          const data = editor.getData();
                          setFieldValue("answer", data);
                        }}
                        onBlur={() => {
                          setFieldTouched("answer", true);
                        }}
                        onFocus={() => {}}
                        id={"answer"}
                      />
                      {errors.answer && touched.answer ? (
                        <p className="custom-form-error text-danger">
                          {errors.answer}
                        </p>
                      ) : null}
                    </div>

                    <div className="">
                      <SubmitButton loading={false} text="Add Faq" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
