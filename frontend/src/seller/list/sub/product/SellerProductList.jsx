import React, { useContext, useEffect, useReducer } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import axios from "axios";

import photo from "../../../../admin/assets/photo.jpg";
import ReactTimeAgo from "react-time-ago";
import { Context } from "../../../../context/Context";
import { request } from "../../../../base url/BaseUrl";
import { getError } from "../../../../components/utilities/util/Utils";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, products: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return {
        ...state,
        loadingDelete: false,
        successDelete: false,
      };
    case "DELETE_RESET":
      return {
        ...state,
        loadingDelete: false,
        successDelete: false,
      };

    default:
      return state;
  }
};

function ProductList({ rows }) {
  const columns = [
    { field: "_id", headerName: "ID", width: 220 },
    {
      field: "name",
      headerName: "Products",
      width: 400,
      renderCell: (params) => {
        return (
          <>
            <div className="cellWidthImg">
              <img
                src={params.row.image || photo}
                alt="image_banner"
                className="cellImg"
              />
              {params.row.name}
            </div>
          </>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 180,
      renderCell: (params) => {
        return (
          <>
            <div className="cellWidthImg">
              <ReactTimeAgo
                date={Date.parse(params.row.createdAt)}
                locale="en-US"
              />
            </div>
          </>
        );
      },
    },
    { field: "category", headerName: "Category", width: 200 },
  ];

  const { state } = useContext(Context);
  const { userInfo } = state;

  const [
    {
      loading,
      error,
      products,
      pages,
      loadingDelete,
      successDelete,
      errorDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  const { search } = useLocation();

  const sp = new URLSearchParams(search);
  const page = parseInt(sp.get("page") || 1);
  const seller = sp.get("seller") || userInfo._id || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${request}/api/products?seller=${seller}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({
          type: "FETCH_SUCCESS",
          payload: data,
        });
        window.scrollTo(0, 0);
      } catch (err) {
        dispatch({ type: "FETCH_FAIL" });
      }
    };

    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete, seller]);

  const navigate = useNavigate();

  //==============
  //DELETE PRODUCT
  //==============
  const deleteHandler = async (product) => {
    if (window.confirm("Are you sure to delete this product?")) {
      try {
        await axios.delete(`${request}/api/products/${product.id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        toast.success("product deleted successfully", {
          position: "bottom-center",
        });
        dispatch({ type: "DELETE_SUCCESS" });
      } catch (err) {
        toast.error(getError(err), { position: "bottom-center" });
        dispatch({ type: "DELETE_FAIL" });
      }
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 220,
      renderCell: (product) => {
        return (
          <div className="cellAction">
            <Link
              to={`/vendor/product/${product.id}/edit`}
              style={{ textDecoration: "none" }}
            >
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => deleteHandler(product)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];
  console.log(products);

  const getRowId = (row) => {
    // Implement your custom logic to generate a unique id for each row
    return row._id;
  };

  // Check if any row is missing the id property
  const hasMissingId = rows?.some((row) => !row._id);

  if (hasMissingId) {
    // Generate unique ids for rows without an id property
    rows = rows?.map((row, index) => {
      if (!row._id) {
        return {
          ...row,
          id: `row_${index}`, // Replace with your preferred id generation logic
        };
      }
      return row;
    });
  }

  const customTranslations = {
    noRowsLabel: "No product found", // Customize the "No Rows" message here
  };
  return (
    <>
      <Helmet>
        <title>All Products</title>
      </Helmet>
      <div className="container">
        <div className="datatable mtb">
          <span className="c_flex">
            <h2>All Products</h2>
            <i
              onClick={() => {
                navigate(`/vendor/product/new`);
              }}
              className="fa-solid fa-square-plus filterPlus"
            ></i>
          </span>
          {loading || successDelete ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox>{error}</MessageBox>
          ) : (
            <DataGrid
              className="datagrid"
              rows={products}
              localeText={customTranslations}
              getRowId={getRowId}
              columns={columns.concat(actionColumn)}
              autoPageSize
              rowsPerPageOptions={[8]}
              checkboxSelection
            />
          )}
        </div>
      </div>
    </>
  );
}

export default ProductList;
