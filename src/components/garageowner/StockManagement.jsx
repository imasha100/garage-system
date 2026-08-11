import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Bell,
  Menu,
  PackageSearch,
  Plus,
  Boxes,
  AlertTriangle,
  TrendingUp,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function StockManagement({
  toggleSidebar,
}) {
  // ======================================================
  // STATES
  // ======================================================

  const [searchText, setSearchText] =
    useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [stockItems, setStockItems] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(false);

  const [batchLoading, setBatchLoading] =
    useState(false);

  // OWNER / GARAGE
  const [ownerData, setOwnerData] =
    useState(null);

  const [ownerLoading, setOwnerLoading] =
    useState(true);

  const [ownerError, setOwnerError] =
    useState("");

  // STOCK
  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [formData, setFormData] =
    useState({
      itemName: "",
      categoryId: "",
      categoryName: "",
      batchNumber: "",
      purchasePrice: "",
      sellingPrice: "",
      receivedQuantity: "",
      reorderLevel: "",
      purchaseDate: "",
      expiryDate: "",
    });

  // ======================================================
  // LOAD LOGGED-IN OWNER PROFILE
  // ======================================================

  useEffect(() => {
    let isMounted = true;

    const loadOwnerProfile = async () => {
      try {
        setOwnerLoading(true);
        setOwnerError("");

        const storedStaffUser =
          sessionStorage.getItem(
            "staffUser"
          );

        if (!storedStaffUser) {
          throw new Error(
            "Logged-in garage owner details were not found."
          );
        }

        const staffUser =
          JSON.parse(
            storedStaffUser
          );

        const loginId =
          Number(
            staffUser?.loginId
          );

        if (
          !Number.isInteger(
            loginId
          ) ||
          loginId <= 0
        ) {
          throw new Error(
            "A valid garage owner login ID was not found."
          );
        }

        const response =
          await fetch(
            `${API_BASE}/api/owners/profile/${loginId}`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load the garage owner profile."
          );
        }

        if (isMounted) {
          setOwnerData(
            result.data
          );
        }
      } catch (error) {
        console.error(
          "Owner profile loading error:",
          error
        );

        if (isMounted) {
          setOwnerData(null);

          setOwnerError(
            error.message ||
              "Unable to load the garage owner profile."
          );
        }
      } finally {
        if (isMounted) {
          setOwnerLoading(false);
        }
      }
    };

    loadOwnerProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // ======================================================
  // OWNER / GARAGE DISPLAY DATA
  // ======================================================

  const ownerName =
    ownerData?.owner?.fullName ||
    (ownerLoading
      ? "Loading Owner..."
      : "Garage Owner");

  const garageName =
    ownerData?.garage?.garageName ||
    (ownerLoading
      ? "Loading Garage..."
      : "Garage Not Available");

  const garageId =
    Number(
      ownerData?.garage?.garageId
    );

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("") || "GO";

  // ======================================================
  // OWNER PROFILE PHOTO
  // ======================================================

  const profilePhotoPath =
    ownerData?.owner?.profilePhoto ??
    ownerData?.owner?.profile_photo ??
    "";

  const ownerProfilePhoto =
    profilePhotoPath
      ? String(profilePhotoPath).startsWith("http")
        ? profilePhotoPath
        : `${API_BASE}${profilePhotoPath}`
      : null;

  // ======================================================
  // LOAD ADMIN-CREATED CATEGORIES
  // ======================================================

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);

      const response = await fetch(
        `${API_BASE}/api/stock/categories`
      );

      const result = await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to load categories."
        );
      }

      setCategories(
        Array.isArray(result.categories)
          ? result.categories
          : []
      );
    } catch (error) {
      console.error(
        "Load categories error:",
        error
      );

      setFormError(
        error.message ||
          "Unable to load categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadNextBatchNumber = useCallback(
    async (categoryId) => {
      const numericCategoryId =
        Number(categoryId);

      if (
        !Number.isInteger(
          numericCategoryId
        ) ||
        numericCategoryId <= 0
      ) {
        setFormData((previous) => ({
          ...previous,
          batchNumber: "",
        }));

        return;
      }

      try {
        setBatchLoading(true);

        const response = await fetch(
          `${API_BASE}/api/stock/next-batch-number/${numericCategoryId}`
        );

        const result = await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to generate batch number."
          );
        }

        setFormData((previous) => ({
          ...previous,
          batchNumber:
            result.batchNumber || "",
        }));
      } catch (error) {
        console.error(
          "Generate batch number error:",
          error
        );

        setFormError(
          error.message ||
            "Unable to generate batch number."
        );
      } finally {
        setBatchLoading(false);
      }
    },
    []
  );

  // ======================================================
  // LOAD STOCK
  // ======================================================

  const loadStock =
    useCallback(
      async (
        selectedGarageId,
        initialLoad = false
      ) => {
        if (
          !Number.isInteger(
            selectedGarageId
          ) ||
          selectedGarageId <= 0
        ) {
          return;
        }

        try {
          if (initialLoad) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setLoadError("");

          const response =
            await fetch(
              `${API_BASE}/api/stock/garage/${selectedGarageId}`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            result.success === false
          ) {
            throw new Error(
              result.message ||
                "Unable to load garage stock."
            );
          }

          const items =
            Array.isArray(
              result.items
            )
              ? result.items
              : [];

          setStockItems(
            items
          );
        } catch (error) {
          console.error(
            "Load stock error:",
            error
          );

          setLoadError(
            error.message ||
              "Unable to load stock."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  // ======================================================
  // INITIAL LOAD + AUTO REFRESH
  // ======================================================

  useEffect(() => {
    if (
      !Number.isInteger(
        garageId
      ) ||
      garageId <= 0
    ) {
      return undefined;
    }

    loadStock(
      garageId,
      true
    );

    const interval =
      setInterval(() => {
        loadStock(
          garageId,
          false
        );
      }, 10000);

    return () => {
      clearInterval(
        interval
      );
    };
  }, [
    garageId,
    loadStock,
  ]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ======================================================
  // FILTER STOCK
  // ======================================================

  const filteredStock =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      if (!query) {
        return stockItems;
      }

      return stockItems.filter(
        (item) =>
          `
            ${item.itemName}
            ${item.categoryName}
            ${item.batchNumber}
            ${item.purchasePrice}
            ${item.sellingPrice}
            ${item.availableQuantity}
            ${item.reorderLevel}
          `
            .toLowerCase()
            .includes(query)
      );
    }, [
      stockItems,
      searchText,
    ]);

  // ======================================================
  // SUMMARY
  // ======================================================

  const totalStockItems =
    stockItems.length;

  const lowStockItems =
    stockItems.filter(
      (item) =>
        Number(
          item.availableQuantity
        ) <=
        Number(
          item.reorderLevel
        )
    ).length;

  const totalStockValue =
    stockItems.reduce(
      (total, item) =>
        total +
        Number(
          item.purchasePrice ||
            0
        ) *
          Number(
            item.availableQuantity ||
              0
          ),
      0
    );

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      if (name === "categoryId") {
        const selectedCategory =
          categories.find(
            (category) =>
              String(
                category.categoryId
              ) === String(value)
          );

        setFormData(
          (previous) => ({
            ...previous,
            categoryId: value,
            categoryName:
              selectedCategory?.name || "",
            batchNumber: "",
          })
        );

        setFormError("");
        loadNextBatchNumber(value);
        return;
      }

      setFormData(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

      setFormError("");
  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = () => {
    setFormData({
      itemName: "",
      categoryId: "",
      categoryName: "",
      batchNumber: "",
      purchasePrice: "",
      sellingPrice: "",
      receivedQuantity: "",
      reorderLevel: "",
      purchaseDate: "",
      expiryDate: "",
    });

    setFormError("");
  };

  // ======================================================
  // ADD STOCK
  // ======================================================

  const handleAddStock =
    async (event) => {
      event.preventDefault();

      try {
        setSaving(true);
        setFormError("");
        setSuccessMessage("");

        // ----------------------------------------------
        // GARAGE VALIDATION
        // ----------------------------------------------

        if (
          !Number.isInteger(
            garageId
          ) ||
          garageId <= 0
        ) {
          throw new Error(
            "Garage could not be identified."
          );
        }

        // ----------------------------------------------
        // TEXT VALUES
        // ----------------------------------------------

        const itemName =
          formData.itemName.trim();

        const categoryId =
          Number(formData.categoryId);

        const categoryName =
          formData.categoryName.trim();

        const batchNumber =
          formData.batchNumber.trim();

        // ----------------------------------------------
        // NUMERIC VALUES
        // ----------------------------------------------

        const purchasePrice =
          parseFloat(
            formData.purchasePrice
          );

        const sellingPrice =
          parseFloat(
            formData.sellingPrice
          );

        const receivedQuantity =
          parseInt(
            formData.receivedQuantity,
            10
          );

        const reorderLevel =
          parseInt(
            formData.reorderLevel,
            10
          );

        // ----------------------------------------------
        // VALIDATION
        // ----------------------------------------------

        if (!itemName) {
          throw new Error(
            "Item name is required."
          );
        }

        if (
          !Number.isInteger(categoryId) ||
          categoryId <= 0
        ) {
          throw new Error(
            "Please select a category."
          );
        }

        if (!categoryName) {
          throw new Error(
            "Category is required."
          );
        }

        if (!batchNumber) {
          throw new Error(
            "Batch number is being generated. Please wait."
          );
        }

        if (
          !Number.isFinite(
            purchasePrice
          ) ||
          purchasePrice < 0
        ) {
          throw new Error(
            "Enter a valid purchase price."
          );
        }

        if (
          !Number.isFinite(
            sellingPrice
          ) ||
          sellingPrice < 0
        ) {
          throw new Error(
            "Enter a valid selling price."
          );
        }

        if (
          !Number.isInteger(
            receivedQuantity
          ) ||
          receivedQuantity <= 0
        ) {
          throw new Error(
            "Received quantity must be a whole number greater than 0."
          );
        }

        if (
          !Number.isInteger(
            reorderLevel
          ) ||
          reorderLevel < 0
        ) {
          throw new Error(
            "Reorder level must be 0 or greater."
          );
        }

        if (
          !formData.purchaseDate
        ) {
          throw new Error(
            "Purchase date is required."
          );
        }

        // ----------------------------------------------
        // PAYLOAD
        // ----------------------------------------------

        const payload = {
          garageId,

          itemName,

          categoryId,

          categoryName,

          purchasePrice:
            Number(
              purchasePrice.toFixed(
                2
              )
            ),

          sellingPrice:
            Number(
              sellingPrice.toFixed(
                2
              )
            ),

          receivedQuantity,

          reorderLevel,

          purchaseDate:
            formData.purchaseDate,

          expiryDate:
            formData.expiryDate ||
            null,
        };

        // DEBUG
        console.log(
          "STOCK PAYLOAD:",
          payload
        );

        // ----------------------------------------------
        // SEND TO BACKEND
        // ----------------------------------------------

        const response =
          await fetch(
            `${API_BASE}/api/stock`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const result =
          await response.json();

        console.log(
          "STOCK API RESPONSE:",
          result
        );

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to add stock."
          );
        }

        // ----------------------------------------------
        // SUCCESS
        // ----------------------------------------------

        setSuccessMessage(
          "Stock added successfully."
        );

        resetForm();

        setShowAddModal(
          false
        );

        await loadStock(
          garageId,
          false
        );

        window.setTimeout(
          () => {
            setSuccessMessage(
              ""
            );
          },
          3000
        );
      } catch (error) {
        console.error(
          "Add stock error:",
          error
        );

        setFormError(
          error.message ||
            "Unable to add stock."
        );
      } finally {
        setSaving(false);
      }
    };

  // ======================================================
  // FORMAT MONEY
  // ======================================================

  const formatMoney =
    (value) =>
      Number(
        value || 0
      ).toLocaleString(
        "en-LK",
        {
          minimumFractionDigits:
            2,
          maximumFractionDigits:
            2,
        }
      );

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white font-sans">
      {/* ==================================================
          HEADER
      =================================================== */}

      <div className="min-h-16 border-b border-white/10 bg-[#191922] flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 md:px-8 py-4 md:py-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={
              toggleSidebar
            }
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center"
          >
            <Menu size={20} />
          </button>

          <div className="w-full md:w-80 h-10 border border-white/20 rounded-xl flex items-center gap-3 px-4 bg-[#0b0b12]">
            <Search
              size={15}
              className="text-gray-500"
            />

            <input
              type="text"
              value={
                searchText
              }
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search stock..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
            />

            {searchText && (
              <button
                type="button"
                onClick={() =>
                  setSearchText(
                    ""
                  )
                }
                className="text-gray-500 hover:text-white text-xs"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* OWNER HEADER */}

        <div className="flex w-full min-w-0 items-center gap-3 md:w-auto md:justify-end md:gap-5">
          <Bell
            size={18}
            className="shrink-0 text-gray-300"
          />

          <div className="h-8 w-px shrink-0 bg-white/10" />

          <div className="min-w-0 flex-1 text-right md:flex-none">
            <p className="truncate text-xs font-bold tracking-widest">
              {ownerName}
            </p>

            <p className="max-w-full truncate text-[10px] uppercase text-gray-500 md:max-w-[260px]">
              {garageName}
            </p>
          </div>

          <div className="h-9 w-9 min-h-9 min-w-9 shrink-0 overflow-hidden rounded-full border border-indigo-400 bg-[#0b0b12] text-xs font-bold flex items-center justify-center">
            {ownerProfilePhoto ? (
              <img
                src={ownerProfilePhoto}
                alt={`${ownerName} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              ownerInitials
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          MAIN
      =================================================== */}

      <main className="p-4 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-[2rem] sm:text-3xl md:text-4xl font-black leading-tight mb-3 break-words">
              STOCK MANAGEMENT
            </h1>

            <p className="text-sm md:text-base text-gray-400 max-w-2xl">
              Manage workshop spare
              parts, purchase and
              selling prices,
              quantities, and stock
              availability.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() =>
                loadStock(
                  garageId,
                  false
                )
              }
              disabled={
                loading ||
                refreshing ||
                !Number.isInteger(
                  garageId
                )
              }
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-gray-300 hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              REFRESH
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();

                setShowAddModal(
                  true
                );
              }}
              disabled={
                !Number.isInteger(
                  garageId
                )
              }
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-xs font-bold tracking-wider hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />

              ADD STOCK
            </button>
          </div>
        </div>

        {/* OWNER ERROR */}

        {ownerError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 text-red-300"
              />

              <div>
                <p className="font-bold text-red-300">
                  Owner details could
                  not be loaded
                </p>

                <p className="mt-1 text-xs text-red-200/70">
                  {ownerError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
            <CheckCircle2
              size={18}
            />

            <p className="text-sm font-semibold">
              {successMessage}
            </p>
          </div>
        )}

        {/* STOCK ERROR */}

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 text-red-300"
              />

              <div>
                <p className="font-bold text-red-300">
                  Unable to load stock
                </p>

                <p className="mt-1 text-xs text-red-200/70">
                  {loadError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        =================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#191923] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">
                Total Stock Items
              </p>

              <Boxes
                size={18}
                className="text-cyan-400"
              />
            </div>

            <h2 className="text-3xl font-black text-cyan-400">
              {loading
                ? "..."
                : totalStockItems}
            </h2>
          </div>

          <div className="bg-[#191923] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">
                Low Stock Alerts
              </p>

              <AlertTriangle
                size={18}
                className="text-amber-400"
              />
            </div>

            <h2 className="text-3xl font-black text-amber-400">
              {loading
                ? "..."
                : lowStockItems}
            </h2>
          </div>

          <div className="bg-[#191923] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">
                Current Stock Cost
              </p>

              <TrendingUp
                size={18}
                className="text-emerald-400"
              />
            </div>

            <h2 className="text-2xl font-black text-emerald-400">
              LKR{" "}
              {loading
                ? "..."
                : formatMoney(
                    totalStockValue
                  )}
            </h2>
          </div>
        </div>

        {/* ==================================================
            STOCK TABLE
        =================================================== */}

        <div className="bg-[#191923] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Workshop Stock
              </h2>

              <p className="mt-1 text-[10px] text-gray-500 uppercase tracking-widest">
                Current available spare
                parts
              </p>
            </div>

            <PackageSearch
              size={20}
              className="text-indigo-400"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-[1100px] md:w-full text-left">
              <thead className="bg-white/5 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                <tr>
                  <th className="px-6 py-4">
                    Item
                  </th>

                  <th className="px-4 py-4">
                    Category
                  </th>

                  <th className="px-4 py-4">
                    Batch
                  </th>

                  <th className="px-4 py-4">
                    Purchase Price
                  </th>

                  <th className="px-4 py-4">
                    Selling Price
                  </th>

                  <th className="px-4 py-4">
                    Available
                  </th>

                  <th className="px-4 py-4">
                    Reorder Level
                  </th>

                  <th className="px-4 py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-14 text-center text-xs tracking-[0.2em] text-gray-500"
                    >
                      LOADING STOCK DATA...
                    </td>
                  </tr>
                ) : filteredStock.length >
                  0 ? (
                  filteredStock.map(
                    (item) => {
                      const isLow =
                        Number(
                          item.availableQuantity
                        ) <=
                        Number(
                          item.reorderLevel
                        );

                      return (
                        <tr
                          key={
                            item.batchId ??
                            `${item.stockId}-${item.batchNumber}`
                          }
                          className="border-t border-white/10 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5 font-bold text-white">
                            {
                              item.itemName
                            }
                          </td>

                          <td className="px-4 py-5 text-sm text-gray-400">
                            {
                              item.categoryName
                            }
                          </td>

                          <td className="px-4 py-5 font-mono text-sm text-indigo-300">
                            {
                              item.batchNumber
                            }
                          </td>

                          <td className="px-4 py-5 text-sm text-gray-300">
                            LKR{" "}
                            {formatMoney(
                              item.purchasePrice
                            )}
                          </td>

                          <td className="px-4 py-5 text-sm text-emerald-300 font-bold">
                            LKR{" "}
                            {formatMoney(
                              item.sellingPrice
                            )}
                          </td>

                          <td className="px-4 py-5 font-mono text-sm">
                            {
                              item.availableQuantity
                            }
                          </td>

                          <td className="px-4 py-5 font-mono text-sm text-gray-400">
                            {
                              item.reorderLevel
                            }
                          </td>

                          <td className="px-4 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                isLow
                                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {isLow
                                ? "Low Stock"
                                : "Available"}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-14 text-center text-xs tracking-[0.2em] text-gray-500"
                    >
                      {searchText
                        ? "NO MATCHING STOCK DATA"
                        : "NO STOCK DATA AVAILABLE"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ==================================================
          ADD STOCK MODAL
      =================================================== */}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-[#12121a]">
            <div className="sticky top-0 z-10 bg-[#12121a] border-b border-white/10 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Add New Stock
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Register a new stock
                  batch for {garageName}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddModal(
                    false
                  );

                  resetForm();
                }}
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={
                handleAddStock
              }
              className="p-6"
            >
              {formError && (
                <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-red-300"
                  />

                  <p className="text-xs text-red-200">
                    {formError}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Item Name
                  </label>

                  <input
                    type="text"
                    name="itemName"
                    value={
                      formData.itemName
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="Engine Oil"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Category
                  </label>

                  <select
                    name="categoryId"
                    value={
                      formData.categoryId
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      categoriesLoading
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category.categoryId
                          }
                          value={
                            category.categoryId
                          }
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Batch Number
                  </label>

                  <input
                    type="text"
                    name="batchNumber"
                    value={
                      batchLoading
                        ? "Generating..."
                        : formData.batchNumber
                    }
                    readOnly
                    required
                    placeholder="Auto-generated"
                    className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-indigo-300 outline-none"
                  />

                  <p className="mt-2 text-[10px] text-gray-500">
                    Batch number is generated automatically from the selected category.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Reorder Level
                  </label>

                  <input
                    type="number"
                    step="1"
                    min="0"
                    name="reorderLevel"
                    value={
                      formData.reorderLevel
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="3"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Purchase Price
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="purchasePrice"
                    value={
                      formData.purchasePrice
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="3500.00"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Selling Price
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="sellingPrice"
                    value={
                      formData.sellingPrice
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="4500.00"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Received Quantity
                  </label>

                  <input
                    type="number"
                    step="1"
                    min="1"
                    name="receivedQuantity"
                    value={
                      formData.receivedQuantity
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="10"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Purchase Date
                  </label>

                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    onClick={(event) => {
                      if (event.currentTarget.showPicker) {
                        event.currentTarget.showPicker();
                      }
                    }}
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b12]
                    px-4 py-3 text-sm text-white outline-none
                    focus:border-indigo-500 cursor-pointer
                    [color-scheme:dark]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    onClick={(event) => {
                      if (event.currentTarget.showPicker) {
                        event.currentTarget.showPicker();
                      }
                    }}
                    min={formData.purchaseDate || undefined}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b12]
                    px-4 py-3 text-sm text-white outline-none
                    focus:border-indigo-500 cursor-pointer
                    [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(
                      false
                    );

                    resetForm();
                  }}
                  className="px-5 py-3 rounded-lg border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    categoriesLoading ||
                    batchLoading ||
                    !formData.categoryId ||
                    !formData.batchNumber
                  }
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Save
                      size={15}
                    />
                  )}

                  {saving
                    ? "SAVING..."
                    : "SAVE STOCK"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}