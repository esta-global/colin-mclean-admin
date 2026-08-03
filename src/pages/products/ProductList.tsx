import {
  CustomSelect,
  DataTable,
  GoBackButton,
  Pagination,
} from "../../components";
import {
  Column,
  Row,
  TableInstance,
  useFilters,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Link, useSearchParams } from "react-router-dom";
import { deleteConfirmation, get, put, remove } from "../../utills";
import { toast } from "react-toastify";
import Select from "react-select";
import { styles } from "../../constants/selectStyle";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function ProductList() {
  const [searchParams] = useSearchParams();
  let page = Number(searchParams.get("page"));
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<boolean | string>("All");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [types, setDecorSeries] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [showOption, setShowOption] = useState<boolean>(false);

  type SelectValue = {
    label: string;
    value: string;
  };

  const [selectedCategory, setSelectedCategory] = useState<SelectValue | null>(
    null,
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SelectValue | null>(null);
  const [bestSeller, setBestSeller] = useState<boolean>(false);
  const [selectedSizes, setSelectedSizes] = useState<SelectValue[] | null>(
    null,
  );

  const [pagination, setPagination] = useState({
    page: page ? page : 1,
    limit: 30,
    totalRecords: 0,
    totalPages: 0,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/products?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status) url += `&status=${status}`;
        if (selectedCategory?.value)
          url += `&category=${selectedCategory.value}`;
        if (selectedSubCategory?.value)
          url += `&subCategory=${selectedSubCategory.value}`;
        if (bestSeller) url += `&bestSeller=${bestSeller}`;

        if (selectedSizes?.length) {
          for (let size of selectedSizes) {
            url += `&sizes=${size.value}`;
          }
        }

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          let body = apiResponse.body?.map((item: any) => {
            return { ...item, page: apiResponse.page };
          });
          setRecords(body);
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
    [
      pagination.page,
      pagination.limit,
      searchQuery,
      needReload,
      status,
      selectedCategory,
      selectedSubCategory,
      selectedSizes,
      bestSeller,
    ],
  );

  // clearFilterOption
  function handleClearFilter() {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedSizes(null);
    setBestSeller(false);
  }

  // get category
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/categories", true);
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
        let url = `/subCategories`;
        if (selectedCategory?.value) {
          url += `?category=${selectedCategory?.value}`;
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
    [selectedCategory?.value],
  );

  // get Size
  useEffect(function () {
    async function getData() {
      let url = `/sizes`;
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

  type Record = {
    name: string;
    // sku: string;
    category: string;
    image: string;
    price: string;
    createdAt: string;
    status: any;
    bestSeller: any;
    action: any;
  };

  // Extend the TableInstance type
  type TableInstanceWithRowSelect<Record extends object> =
    TableInstance<Record> & {
      selectedFlatRows: Row<Record>[];
    };

  const columns: Column<Record>[] = React.useMemo(
    () => [
      {
        id: "selection",
        disableSortBy: true,
        Header: ({ getToggleAllRowsSelectedProps }: any) => (
          <div>
            <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        Cell: ({ row }: any) => (
          <div>
            <input type="checkbox" {...row.getToggleRowSelectedProps()} />
          </div>
        ),
      },
      {
        Header: "",
        accessor: "image",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          return (
            <div>
              <img className="img" src={value} />
            </div>
          );
        },
      },
      {
        Header: "NAME",
        accessor: "name",
      },
      // {
      //   Header: "SKU",
      //   accessor: "sku",
      // },
      {
        Header: "CATEGORY",
        accessor: "category",
      },

      {
        Header: "CREATED AT",
        accessor: "createdAt",
        Cell: ({ value }: any) => {
          return moment(new Date(value)).format("DD-MM-YYYY");
        },
      },
      // {
      //   Header: "STATUS",
      //   accessor: "status",
      //   Cell: ({ value }: any) => {
      //     const status: boolean = value;
      //     return (
      //       <>
      //         {status ? (
      //           <span className="badge bg-success">Active</span>
      //         ) : (
      //           <span className="badge bg-danger">Disabled</span>
      //         )}
      //       </>
      //     );
      //   },
      // },
      {
        Header: "BEST SELLER",
        accessor: "bestSeller",
        Cell: ({ value }: any) => {
          return (
            // <>
            //   {value === true ? (
            //     <span className="badge bg-success">Active</span>
            //   ) : (
            //     <span className="badge bg-danger">Disabled</span>
            //   )}
            // </>

            <div className="form-check form-switch ms-5">
              <input
                className="form-check-input custom-switch"
                type="checkbox"
                role="switch"
                id="customSwitch"
                checked={value?.bestSeller === true ? true : false}
                style={{ width: "3rem", height: "1.5rem" }}
                onChange={(evt) => {
                  handleUpdateBestSeller(value?._id, evt.target.checked);
                }}
              />
            </div>
          );
        },
      },

      {
        Header: "STATUS",
        accessor: "status",
        Cell: ({ value }: any) => {
          return (
            // <>
            //   {value === true ? (
            //     <span className="badge bg-success">Active</span>
            //   ) : (
            //     <span className="badge bg-danger">Disabled</span>
            //   )}
            // </>

            <div className="form-check form-switch ms-5">
              <input
                className="form-check-input custom-switch"
                type="checkbox"
                role="switch"
                id="customSwitch"
                checked={value?.status === true ? true : false}
                style={{ width: "3rem", height: "1.5rem" }}
                onChange={(evt) => {
                  handleUpdateStatus(value?._id, evt.target.checked);
                }}
              />
            </div>
          );
        },
      },
      {
        Header: "ACTION",
        accessor: "action",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          return (
            <div className="d-flex gap-1">
              <Link
                className="p-2 bg-light"
                to={{
                  pathname: `/products/edit/${value._id}/${value.page}`,
                }}
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <Link
                className="p-2 bg-light"
                to={{
                  pathname: `/products/details/${value._id}`,
                }}
              >
                <span
                  className="fas fa-eye text-warning"
                  aria-hidden="true"
                ></span>
              </Link>

              <button
                type="button"
                className="btn p-2 bg-light"
                data-toggle="modal"
                data-target="#deleteModal"
                onClick={() => {
                  handleDeleteData(value._id);
                }}
              >
                <span
                  className="fas fa-trash-alt text-danger"
                  aria-hidden="true"
                ></span>
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const data = React.useMemo(() => {
    return records.map((data) => {
      return {
        id: data._id,
        name: data.name,
        // sku: data.sku,
        category: data.category?.name,
        price: data,
        image: addUrlToFile(data.image),
        createdAt: data.createdAt,
        status: data,
        bestSeller: data,
        action: data,
      };
    });
  }, [records]);

  const { getTableProps, headerGroups, rows, prepareRow, selectedFlatRows } =
    useTable(
      { columns, data },
      useFilters,
      useSortBy,
      usePagination,
      useRowSelect,
    ) as TableInstanceWithRowSelect<Record>;

  console.log(selectedFlatRows);

  // handleDeleteData
  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) {
      return;
    }

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/products`, recordId);
    } else {
      apiResponse = await remove(`/products/${recordId}`);
    }

    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => {
        return !old;
      });
    } else {
      toast.error(apiResponse?.message);
    }
  }

  function handleSelectedRows(): string[] {
    const selectedData = selectedFlatRows
      .map((row: any) => row?.original?.id || row?.original?._id)
      .filter(Boolean);
    return selectedData;
  }

  // handleSetStatus
  function handleSetStatus(evt: React.ChangeEvent<HTMLInputElement>) {
    setStatus(evt.target.value);
  }

  async function handleUpdateStatus(id: string, value: boolean) {
    let url = `/products/${id}`;

    const apiResponse = await put(url, { status: value });
    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => {
        return !old;
      });
    } else {
      toast.error(apiResponse?.message);
    }
  }

  async function handleUpdateBestSeller(id: string, value: boolean) {
    let url = `/products/${id}`;

    const apiResponse = await put(url, { bestSeller: value });
    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => {
        return !old;
      });
    } else {
      toast.error(apiResponse?.message);
    }
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Products</h4>
            </div>
            <div>
              <Link
                to={"/products/add"}
                type="button"
                className="btn btn-primary text-light"
              >
                Add Product
              </Link>

              <Link
                to={"/products/addViaCsv"}
                type="button"
                className="btn btn-primary text-light"
              >
                Add Via CSV
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card rounded-2">
            <div className="card-body shadow-none">
              <div className="row mb-2 gy-2">
                <div className="col-md-8">
                  <input
                    placeholder="Serach..."
                    className="form-control py-2"
                    type="serach"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(evt.target.value)
                    }
                  />
                </div>
                <div className="col-md-4 d-flex gap-2 justify-content-md-end">
                  {/* <button className="btn p-2 bg-light border">
                    <i className="ti-search"></i>
                  </button> */}
                  {selectedFlatRows.length ? (
                    <button
                      className="btn p-2 bg-light border"
                      onClick={() => {
                        handleDeleteData(handleSelectedRows());
                      }}
                    >
                      <i className="fas fa-trash-alt text-danger"></i>
                    </button>
                  ) : null}

                  <div className="dropdown">
                    <a
                      className="btn p-2 bg-light border"
                      href="#"
                      role="button"
                      id="dropdownMenuLink"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti-filter"></i>
                    </a>

                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuLink"
                    >
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="all"
                          value={"All"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="all">All</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="active"
                          value={"true"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="active">Active</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="disabled"
                          value={"false"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="disabled">Disabled</label>
                      </li>
                    </ul>
                  </div>

                  {showOption ? (
                    <button
                      className="btn p-2 bg-light border"
                      onClick={() => {
                        setShowOption((old) => {
                          return !old;
                        });
                        handleClearFilter();
                      }}
                    >
                      <i className="fas fa-times text-danger"></i>
                    </button>
                  ) : (
                    <button
                      className="btn p-2 bg-light border"
                      onClick={() => {
                        setShowOption((old) => {
                          return !old;
                        });
                      }}
                    >
                      <i className="fas fa-angle-down text-info"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* More filter option */}
              {showOption ? (
                <div className="row">
                  <div className="form-group col-md-3">
                    <Select
                      placeholder="Select Category"
                      options={categories}
                      value={selectedCategory}
                      onChange={(value) => {
                        setSelectedCategory(value);
                      }}
                      styles={styles}
                    />
                  </div>

                  <div className="form-group col-md-3">
                    <Select
                      placeholder="Select Sub Category"
                      options={subCategories}
                      value={selectedSubCategory}
                      onChange={(value) => {
                        setSelectedSubCategory(value);
                      }}
                      styles={styles}
                    />
                  </div>

                  <div className="form-group col-md-4">
                    <Select
                      placeholder="Select Size"
                      options={sizes}
                      value={selectedSizes}
                      onChange={(value: any) => {
                        setSelectedSizes(value);
                      }}
                      styles={styles}
                      isMulti={true}
                    />
                  </div>

                  <div className="form-group col-md-2 d-flex justify-content-center align-items-center gap-2">
                    <input
                      type="checkbox"
                      checked={bestSeller ? true : false}
                      onChange={(evt) => {
                        setBestSeller(evt.target.checked);
                      }}
                      id="bestSellerCheckbox"
                    />
                    <label htmlFor="bestSellerCheckbox" className="p-0 m-0">
                      Best Seller
                    </label>
                  </div>
                </div>
              ) : null}

              <div className="table-responsive">
                {/* Data Table */}
                <DataTable
                  getTableBodyProps={getTableProps}
                  getTableProps={getTableProps}
                  headerGroups={headerGroups}
                  rows={rows}
                  prepareRow={prepareRow}
                />
                {/* Pagination */}
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName={"table-to-xls"}
                  csvFileName={"coupons"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
