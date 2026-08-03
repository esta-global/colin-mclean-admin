import { GoBackButton, OverlayLoading } from "../../components";
import { useEffect, useState } from "react";
import { get } from "../../utills";
import { Link, useParams } from "react-router-dom";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function ViewNotifyMe() {
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [notifyMeDetails, setNotifyMeDetails] = useState<any>({});

  useEffect(
    function () {
      async function getData(recordId: string) {
        setLoading(true);
        const apiResponse = await get(`/notifyMe/${recordId}`, true);
        if (apiResponse?.status == 200) {
          setNotifyMeDetails(apiResponse?.body);
        }
        setLoading(false);
      }

      if (id) getData(id);
    },
    [id],
  );

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Notify Me Details</h4>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <OverlayLoading />
      ) : (
        <div className="row">
          <div className="col-md-12">
            <div className="row">
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
                          <span style={{ fontSize: "35px" }}>
                            {notifyMeDetails?.name?.[0] || "N"}
                          </span>
                        </div>
                      </div>
                      <h6 className="px-0 pt-2">{notifyMeDetails?.name}</h6>
                      <p className="mb-2">
                        <span className="badge bg-warning rounded">
                          {notifyMeDetails?.notifyStatus}
                        </span>
                      </p>

                      <div className="d-flex gap-2 justify-content-center mt-3">
                        <Link
                          to={`tel:${notifyMeDetails?.mobile}`}
                          className="btn btn-info text-light py-2"
                        >
                          <i className="fa fa-phone"></i>
                        </Link>

                        <Link
                          to={`mailto:${notifyMeDetails?.email}`}
                          className="btn btn-danger text-light py-2"
                        >
                          <i className="fa fa-envelope"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                <div className="card rounded-2">
                  <div className="card-body table-responsive">
                    <h5 className="mb-2">Personal Details</h5>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td scope="row">Name</td>
                          <td>{notifyMeDetails?.name}</td>
                        </tr>
                        <tr>
                          <td scope="row">Email</td>
                          <td>{notifyMeDetails?.email}</td>
                        </tr>
                        <tr>
                          <td scope="row">Mobile</td>
                          <td>{notifyMeDetails?.mobile}</td>
                        </tr>
                        <tr>
                          <td scope="row">Status</td>
                          <td>{notifyMeDetails?.notifyStatus}</td>
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
                    <h5 className="mb-2">Product Details</h5>
                  </div>

                  <div className="col-md-12">
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      <img
                        src={
                          notifyMeDetails?.product?.image
                            ? addUrlToFile(notifyMeDetails.product.image)
                            : "/images/select-photo.png"
                        }
                        alt=""
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <div>
                        <h6 className="mb-1">{notifyMeDetails?.product?.name}</h6>
                        <p className="mb-1 text-muted">
                          Slug: {notifyMeDetails?.product?.slug || "-"}
                        </p>
                        <p className="mb-0">
                          <span
                            className={`badge ${
                              notifyMeDetails?.product?.status
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {notifyMeDetails?.product?.status
                              ? "Active"
                              : "Disabled"}
                          </span>
                        </p>
                      </div>
                    </div>
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
                    <h5 className="mb-2">Message</h5>
                  </div>

                  <div className="col-md-12">
                    <p className="mb-0">{notifyMeDetails?.message}</p>
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
