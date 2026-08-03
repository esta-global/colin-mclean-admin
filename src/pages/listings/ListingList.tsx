import {
  DataTable,
  GoBackButton,
  OverlayLoading,
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
import { Link } from "react-router-dom";
import { deleteConfirmation, get, remove } from "../../utills";
import { toast } from "react-toastify";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function ListingList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("All");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  function shortenText(text: string, maxLength = 28) {
    if (!text) return "-";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  function formatPrice(value: any) {
    if (value === "" || value === null || value === undefined) return "-";
    const price = Number(value);
    if (Number.isNaN(price)) return "-";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  type Record = {
    images: string[];
    price: number;
    title: string;
    user: any;
    category: string;
    createdAt: string;
    status: any;
    id: string;
  };

  type TableInstanceWithRowSelect<T extends object> = TableInstance<T> & {
    selectedFlatRows: Row<T>[];
  };

  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/listings?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status) url += `&status=${status}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body);
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
    [pagination.page, pagination.limit, searchQuery, needReload, status],
  );

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
        accessor: "images",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          const imageUrl = Array.isArray(value) ? value[0] : value;
          if (!imageUrl) return null;
          return (
            <div className="listing-product-cell">
              <img
                className="listing-product-image"
                src={imageUrl}
                alt="Listing"
              />
            </div>
          );
        },
      },
      {
        Header: "TITLE",
        accessor: "title",
        Cell: ({ value }: any) => {
          const fullTitle = value || "";
          return (
            <div
              className="marketplace-name-cell listing-title-cell"
              title={fullTitle}
            >
              <strong>{shortenText(fullTitle)}</strong>
            </div>
          );
        },
      },
      {
        Header: "PRICE",
        accessor: "price",
        Cell: ({ value }: any) => (
          <strong className="listing-price-text">{formatPrice(value)}</strong>
        ),
      },
      {
        Header: "USER",
        accessor: "user",
        Cell: ({ value }: any) => {
          const userName =
            typeof value === "object" ? value?.name || "-" : value || "-";
          const userEmail =
            typeof value === "object" ? value?.email || "" : "";

          return (
            <div className="marketplace-name-cell listing-user-cell">
              <strong>{userName}</strong>
              {userEmail ? <span>{userEmail}</span> : null}
            </div>
          );
        },
      },
      {
        Header: "CATEGORY",
        accessor: "category",
        Cell: ({ value }: any) => (
          <span className="listing-category-text" title={value || ""}>
            {shortenText(value || "", 24)}
          </span>
        ),
      },
      {
        Header: "CREATED AT",
        accessor: "createdAt",
        Cell: ({ value }: any) => moment(new Date(value)).format("DD-MM-YYYY"),
      },
      {
        Header: "STATUS",
        accessor: "status",
        Cell: ({ value }: any) => (
          <span
            className={`marketplace-status-pill ${
              value ? "is-active" : "is-disabled"
            }`}
          >
            {value ? "Active" : "Disabled"}
          </span>
        ),
      },
      {
        Header: "ACTION",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }: any) => (
          <div className="marketplace-action-cell">
            <Link
              className="marketplace-icon-action"
              to={`/listings/details/${value}`}
              title="View listing"
            >
              <span className="fas fa-eye" aria-hidden="true"></span>
            </Link>

            <button
              type="button"
              className="btn marketplace-icon-action marketplace-icon-action--danger"
              data-toggle="modal"
              data-target="#deleteModal"
              title="Delete listing"
              onClick={() => {
                handleDeleteData(value);
              }}
            >
              <span
                className="fas fa-trash-alt text-danger"
                aria-hidden="true"
              ></span>
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const data = React.useMemo(() => {
    return records.map((item) => {
      const images = Array.isArray(item.images) ? item.images : [];
      return {
        images: images.map((image) => addUrlToFile(image)),
        price: item.price,
        title: item.title,
        user: item.user,
        category: item.category,
        createdAt: item.createdAt,
        status: item.status,
        id: item._id,
      };
    });
  }, [records]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
  } = useTable(
    { columns, data },
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect,
  ) as TableInstanceWithRowSelect<Record>;

  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) return;

    const apiResponse = Array.isArray(recordId)
      ? await remove("/listings", recordId)
      : await remove(`/listings/${recordId}`);

    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => !old);
    } else {
      toast.error(apiResponse?.message);
    }
  }

  function handleSelectedRows(): string[] {
    return selectedFlatRows.map((row: any) => row?.original?.id);
  }

  return (
    <div className="content-wrapper marketplace-admin-page listing-admin-page">
      {loading ? <OverlayLoading /> : null}

      <div className="marketplace-page-header">
        <div>
          <div className="marketplace-page-header__actions">
            <GoBackButton />
            <span className="marketplace-page-eyebrow">
              IFMA Workspace
            </span>
          </div>
          <h1>Listings</h1>
          <p>Review seller listings, categories, and publishing status.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card marketplace-table-card listing-table-card">
            <div className="marketplace-toolbar listing-toolbar">
              <div className="marketplace-search-wrap">
                <i className="ti-search"></i>
                <input
                  placeholder="Search listings, category, seller"
                  className="form-control"
                  type="search"
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(evt.target.value)
                  }
                />
              </div>
              <div className="marketplace-toolbar-actions">
                {selectedFlatRows.length ? (
                  <button
                    type="button"
                    className="marketplace-bulk-delete"
                    title="Delete selected"
                    onClick={() => handleDeleteData(handleSelectedRows())}
                  >
                    <i className="fas fa-trash-alt text-danger"></i>
                  </button>
                ) : null}

                <select
                  className="form-control marketplace-status-select"
                  value={status}
                  onChange={(evt) => setStatus(evt.target.value)}
                  aria-label="Filter listings by status"
                >
                  <option value="All">All status</option>
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
            <div className="card-body shadow-none">
              <div className="table-responsive marketplace-table-wrap listing-table-wrap">
                <DataTable
                  getTableBodyProps={getTableBodyProps}
                  getTableProps={getTableProps}
                  headerGroups={headerGroups}
                  rows={rows}
                  prepareRow={prepareRow}
                />
              </div>
              <div className="marketplace-pagination-wrap listing-pagination-wrap">
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName="table-to-xls"
                  csvFileName="listings"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
