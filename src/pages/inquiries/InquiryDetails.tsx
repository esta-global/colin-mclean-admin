import { GoBackButton, OverlayLoading } from "../../components";

import { useEffect, useState } from "react";
import { get } from "../../utills";
import { Link, useNavigate, useParams } from "react-router-dom";

export function InquiryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [inquiryDetails, setInquiryDetails] = useState<any>({});

  // get trainer specialities
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        const apiResponse = await get(`/inquiries/${id}`, true);
        if (apiResponse?.status == 200) {
          setInquiryDetails(apiResponse?.body);
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
              <h4 className="font-weight-bold mb-0">Inquiry Details</h4>
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

      {loading ? (
        <OverlayLoading />
      ) : (
        <div className="row">
          <div className="col-md-12 ">
            {/* Personal & Profile Details */}
            <div className="row">
              {/* Profile Card */}
              <div className="col-md-4">
                <div className="card rounded-2">
                  <div className="card-body">
                    <div className="text-center">
                      <div className="d-flex justify-content-center">
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{
                            height: "60px",
                            width: "60px",
                            background: "#1779ba",
                            borderRadius: "30px",
                            color: "#fff",
                          }}
                        >
                          <span className="" style={{ fontSize: "35px" }}>
                            {inquiryDetails?.name[0]}
                          </span>
                        </div>
                      </div>
                      <h6 className="px-0 pt-2">{inquiryDetails?.name}</h6>
                      <p>
                        <span className="badge bg-warning rounded">
                          {inquiryDetails?.gender}
                        </span>
                      </p>
                      {/* <p>{`${inquiryDetails?.address}, ${inquiryDetails?.locality}, ${inquiryDetails?.city}, ${inquiryDetails?.state}, ${inquiryDetails?.pincode}, ${inquiryDetails?.country}`}</p> */}
                      <div className="d-flex gap-2 justify-content-center mt-3">
                        <Link
                          to={`tel:${inquiryDetails?.mobile}`}
                          className="btn btn-info text-light py-2"
                        >
                          <i className="fa fa-phone"></i>
                        </Link>

                        <Link
                          to={`mailto:${inquiryDetails?.email}`}
                          className="btn btn-danger text-light py-2"
                        >
                          <i className="fa fa-envelope"></i>
                        </Link>
                      </div>
                    </div>

                    {/*  */}
                    {/* <div className="mt-3 border-top text-center pt-2">
                      <p className="p-0 m-0">{`${inquiryDetails.address}, ${inquiryDetails.city},`}</p>
                      <p className="p-0 m-0">{`${inquiryDetails.state}, ${inquiryDetails.country}, ${inquiryDetails.pincode}`}</p>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="col-md-8">
                <div className="card rounded-2">
                  <div className="card-body table-responsive">
                    <h5 className="mb-2">Personal Details</h5>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td scope="row">Name</td>
                          <td>{inquiryDetails?.name}</td>
                        </tr>
                        <tr>
                          <td scope="row">Email</td>
                          <td>{inquiryDetails?.email}</td>
                        </tr>
                        <tr>
                          <td scope="row">Mobile</td>
                          <td>{inquiryDetails?.mobile}</td>
                        </tr>
                        <tr>
                          <td scope="row">Position</td>
                          <td>{inquiryDetails?.position}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-2 cursor-hand"
                      data-bs-toggle="collapse"
                      data-bs-target="#inquiryMessage"
                      aria-expanded="false"
                      aria-controls="inquiryMessage"
                    >
                      {inquiryDetails?.position == "BECOME_DEALER_PAGE"
                        ? "Dealer Details"
                        : "Message"}
                    </h5>
                    <button
                      className="btn btn-light"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#inquiryMessage"
                      aria-expanded="false"
                      aria-controls="inquiryMessage"
                    >
                      <i className="fa fa-angle-down text-primary" />
                    </button>
                  </div>

                  <div className="collapse mt-2 show" id="inquiryMessage">
                    <p>{inquiryDetails?.message}</p>
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
