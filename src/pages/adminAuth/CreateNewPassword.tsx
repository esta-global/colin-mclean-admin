import { ReactNode, useState } from "react";
import { useFormik } from "formik";
import {
  createPasswordSchema,
  initialValues,
} from "../../validationSchemas/createPasswordSchema";
import { Link, useNavigate } from "react-router-dom";
import { put } from "../../utills";
import { SubmitButton } from "../../components";
import { toast } from "react-toastify";
import { Metadata } from "../../components";

export function CreateNewPassword(): ReactNode {
  const logoSrc = "/images/ifma-logo.png";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useFormik({
      initialValues,
      onSubmit: async (value, helpers) => {
        setLoading(true);
        let resetToken = localStorage.getItem("resetToken") as string;
        const apiResponse = await put(
          "/admins/createNewPassword",
          value,
          resetToken
        );

        if (apiResponse?.status == 200) {
          toast.success(apiResponse?.message);

          // remove email and resetToken from localstorage
          localStorage.removeItem("resetToken");
          localStorage.removeItem("email");

          navigate("/login");
        } else {
          helpers.setErrors(apiResponse?.errors);
          toast.error(apiResponse?.message);
        }
        setLoading(false);
      },
      validationSchema: createPasswordSchema,
    });

  return (
    <>
      {/* Meta Details */}
      <Metadata title="Create new Password" description="Create new Password" />

      <div className="container-scroller">
        <div className="container-fluid page-body-wrapper full-page-wrapper">
          <div className="content-wrapper d-flex align-items-center auth px-0">
            <div className="row w-100 mx-0">
              <div className="col-lg-4 mx-auto">
                <div className="auth-form-light text-left py-5 px-4 px-sm-5">
                  <div className="brand-logo text-center authpage-logo">
                    <img className="ifma-auth-logo" src={logoSrc} alt="IFMA logo" />
                  </div>
                  {/* <h4>Hello! let's get started</h4> */}
                  <h6 className="font-weight-light">Create new password</h6>
                  <form className="pt-3" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <input
                        type="password"
                        name="password"
                        autoComplete="off"
                        className="form-control"
                        id="password"
                        placeholder="Password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.password && errors.password ? (
                        <p className="text-danger custom-form-error">
                          {errors.password}
                        </p>
                      ) : null}
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        name="cPassword"
                        autoComplete="off"
                        className="form-control"
                        id="cPassword"
                        placeholder="Confirm password"
                        value={values.cPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.cPassword && errors.cPassword ? (
                        <p className="text-danger custom-form-error">
                          {errors.cPassword}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <SubmitButton text="Create Password" loading={loading} />
                    </div>
                    <div className="text-center mt-4 font-weight-light">
                      Already have an Account?{" "}
                      <Link to="/login" className="auth-link text-black">
                        Login
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* content-wrapper ends */}
        </div>
        {/* page-body-wrapper ends */}
        {/*  */}
      </div>
    </>
  );
}
