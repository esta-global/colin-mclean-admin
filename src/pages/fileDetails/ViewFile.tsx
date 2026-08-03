import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get } from "../../utills";
import { toast } from "react-toastify";
import { GoBackButton, OverlayLoading } from "../../components";
import { CgSpinner } from "react-icons/cg";

export function ViewFile() {
  const { fileName } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [file, setFile] = useState<any>(null);

  // Get Data From Database
  useEffect(
    function () {
      try {
        async function getData(fileName: string) {
          setLoading(true);
          let url = `http://localhost:5000/uploads/${fileName}`;
          const apiResponse = await fetch(url);

          if (apiResponse?.status == 200) {
            setFile(true);
          } else {
            setFile(false);
          }
          setLoading(false);
        }
        if (fileName) getData(fileName);
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [fileName]
  );

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Go Back</h4>
            </div>
          </div>
        </div>

        <div className="col-md-12 text-center">
          {loading ? (
            <OverlayLoading />
          ) : file ? (
            <iframe
              src={`http://localhost:5000/uploads/${fileName}`}
              width="600"
              height="400"
              frameBorder="0"
            >
              Your browser does not support iframes.
            </iframe>
          ) : (
            <div className="alert alert-danger">File not found</div>
          )}
        </div>
      </div>
    </div>
  );
}
