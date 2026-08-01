import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  History,
  ListChecks,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_HUB_LOCATION = [6.8728, 79.8887];

const parsePickupCoordinates = (pickupLocation) => {
  const values = String(pickupLocation || "").match(
    /-?\d+(?:\.\d+)?/g
  );

  if (!values || values.length < 2) return null;

  const latitude = Number(values[0]);
  const longitude = Number(values[1]);

  return Number.isFinite(latitude) &&
    Number.isFinite(longitude)
    ? [latitude, longitude]
    : null;
};

const formatDateTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "approved") {
    return "bg-blue-500/15 text-blue-300";
  }

  if (value === "dispatched") {
    return "bg-cyan-500/15 text-cyan-300";
  }

  if (value === "completed") {
    return "bg-emerald-500/15 text-emerald-300";
  }

  if (value === "rejected") {
    return "bg-red-500/15 text-red-300";
  }

  return "bg-amber-500/15 text-amber-300";
};

const IncidentDispatch = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const [requests, setRequests] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);

  const [selectedDispatchId, setSelectedDispatchId] =
    useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [historyStatus, setHistoryStatus] = useState("All");

  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] =
    useState(false);

  const [loadError, setLoadError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const [actionDispatchId, setActionDispatchId] =
    useState(null);

  const [actionNotice, setActionNotice] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  const getLoggedInAssistanceId = () => {
    const storedStaffUser =
      sessionStorage.getItem("staffUser");

    const staffUser = storedStaffUser
      ? JSON.parse(storedStaffUser)
      : {};

    const assistanceId = Number(
      staffUser?.staffId ??
        staffUser?.assistanceId ??
        staffUser?.assistance_id ??
        staffUser?.id
    );

    return Number.isInteger(assistanceId) &&
      assistanceId > 0
      ? assistanceId
      : null;
  };

  const loadPendingRequests = async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch(
        "http://localhost:5000/api/tow-dispatches/pending"
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load tow truck requests."
        );
      }

      const loadedRequests = Array.isArray(result.requests)
        ? result.requests.map((request) => ({
            ...request,
            coordinates: parsePickupCoordinates(
              request.pickupLocation
            ),
          }))
        : [];

      setRequests(loadedRequests);

      setSelectedDispatchId((currentId) => {
        if (
          loadedRequests.some(
            (request) =>
              request.dispatchId === currentId
          )
        ) {
          return currentId;
        }

        return loadedRequests[0]?.dispatchId ?? null;
      });
    } catch (error) {
      console.error(
        "Load pending tow requests error:",
        error
      );

      setRequests([]);
      setLoadError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setIsHistoryLoading(true);
      setHistoryError("");

      const assistanceId = getLoggedInAssistanceId();

      if (!assistanceId) {
        throw new Error(
          "The logged-in assistance officer could not be identified."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/tow-dispatches/history?assistanceId=${assistanceId}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load tow truck history."
        );
      }

      setHistoryItems(
        Array.isArray(result.history)
          ? result.history.map((item) => ({
              ...item,
              coordinates: parsePickupCoordinates(
                item.pickupLocation
              ),
            }))
          : []
      );
    } catch (error) {
      console.error("Load tow history error:", error);
      setHistoryItems([]);
      setHistoryError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (activeTab === "pending") {
        loadPendingRequests();
      } else {
        loadHistory();
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [activeTab]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return requests;

    return requests.filter((request) =>
      [
        request.dispatchId,
        request.requestId,
        request.vehicleNumber,
        request.customerName,
        request.customerContact,
        request.truckNumber,
        request.truckCategory,
        request.driverName,
        request.driverContact,
        request.pickupLocation,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [requests, searchQuery]);

  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return historyItems.filter((item) => {
      const matchesStatus =
        historyStatus === "All" ||
        item.dispatchStatus === historyStatus;

      const matchesSearch =
        !query ||
        [
          item.dispatchId,
          item.requestId,
          item.vehicleNumber,
          item.customerName,
          item.customerContact,
          item.truckNumber,
          item.driverName,
          item.driverContact,
          item.pickupLocation,
          item.dispatchStatus,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );

      return matchesStatus && matchesSearch;
    });
  }, [historyItems, historyStatus, searchQuery]);

  const selectedRequest =
    requests.find(
      (request) =>
        request.dispatchId === selectedDispatchId
    ) || null;

  const handleStatusUpdate = async (
    dispatchId,
    status
  ) => {
    try {
      setActionDispatchId(dispatchId);

      const assistanceId = getLoggedInAssistanceId();

      if (!assistanceId) {
        throw new Error(
          "The logged-in assistance officer could not be identified."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/tow-dispatches/${dispatchId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            assistanceId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update the request."
        );
      }

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) =>
            request.dispatchId !== dispatchId
        )
      );

      setSelectedDispatchId((currentId) =>
        currentId === dispatchId ? null : currentId
      );

      await Promise.all([
        loadPendingRequests(),
        loadHistory(),
      ]);

      setActionNotice({
        type:
          status === "Rejected"
            ? "error"
            : "success",
        title:
          status === "Rejected"
            ? "Request Rejected"
            : "Tow Truck Assigned",
        message:
          status === "Rejected"
            ? "The tow truck request has been rejected successfully."
            : "The tow truck request has been approved and assigned successfully.",
      });
    } catch (error) {
      console.error(
        "Update tow request error:",
        error
      );

      setActionNotice({
        type: "error",
        title: "Update Failed",
        message:
          error.message ||
          "Unable to update the request.",
      });
    } finally {
      setActionDispatchId(null);
    }
  };

  const renderMap = () => (
    <div className="relative h-[360px] overflow-hidden rounded-xl border border-gray-800 bg-[#10141c] md:h-[520px]">
      <MapContainer
        center={
          selectedRequest?.coordinates ||
          DEFAULT_HUB_LOCATION
        }
        zoom={12}
        scrollWheelZoom
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CircleMarker
          center={DEFAULT_HUB_LOCATION}
          radius={11}
          pathOptions={{
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <strong>Dispatch Hub</strong>
            <br />
            Assistance operating location
          </Popup>
        </CircleMarker>

        {filteredRequests.map(
          (request) =>
            request.coordinates && (
              <Marker
                key={request.dispatchId}
                position={request.coordinates}
                eventHandlers={{
                  click: () =>
                    setSelectedDispatchId(
                      request.dispatchId
                    ),
                }}
              >
                <Popup>
                  <strong>
                    Request #{request.requestId}
                  </strong>
                  <br />
                  Customer Vehicle:{" "}
                  {request.vehicleNumber || "N/A"}
                  <br />
                  Customer:{" "}
                  {request.customerName || "N/A"}
                  <br />
                  Tow Truck:{" "}
                  {request.truckNumber || "N/A"}
                  <br />
                  Driver:{" "}
                  {request.driverName || "N/A"}
                  <br />
                  Customer Location:{" "}
                  {request.pickupLocation}
                </Popup>
              </Marker>
            )
        )}

        {selectedRequest?.coordinates && (
          <Polyline
            positions={[
              DEFAULT_HUB_LOCATION,
              selectedRequest.coordinates,
            ]}
            pathOptions={{
              color: "#52f0ac",
              weight: 5,
              dashArray: "10 8",
            }}
          />
        )}
      </MapContainer>

      <div className="absolute left-3 top-3 z-[999] max-w-[85%] rounded border border-slate-700 bg-black/75 px-3 py-2 text-[10px] font-bold text-white md:px-4 md:text-xs">
        <MapPin
          size={14}
          className="mr-2 inline text-green-400"
        />

        {selectedRequest
          ? `Selected Request #${selectedRequest.requestId}`
          : "Select a tow truck request"}
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0a0c10] text-gray-300">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-8">
        <header className="mb-6 flex flex-col gap-4 md:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-white md:text-3xl">
              Incident Dispatch
            </h1>

            <p className="mt-1 text-xs text-slate-500 md:text-sm">
              Manage pending requests and review your tow truck history.
            </p>
          </div>

          <div className="flex w-full gap-3 lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search truck, driver or request..."
                className="w-full rounded-lg border border-slate-800 bg-black py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={
                activeTab === "pending"
                  ? loadPendingRequests
                  : loadHistory
              }
              disabled={
                activeTab === "pending"
                  ? isLoading
                  : isHistoryLoading
              }
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 text-xs font-bold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  (activeTab === "pending"
                    ? isLoading
                    : isHistoryLoading)
                    ? "animate-spin"
                    : ""
                }
              />
              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-black/30 p-2">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition ${
              activeTab === "pending"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <ListChecks size={17} />
            Pending Requests
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <History size={17} />
            Tow Truck History
          </button>
        </div>

        {activeTab === "pending" && (
          <div className="flex flex-col gap-5 md:gap-8 xl:flex-row">
            <section className="w-full rounded-xl border border-red-900/30 bg-[#0f1218] p-4 md:p-6 xl:w-[390px]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-red-400 md:text-xs">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  TOW REQUEST QUEUE
                </h2>

                <span className="rounded bg-red-900/20 px-3 py-1 text-[10px] font-bold text-red-400 md:text-xs">
                  {filteredRequests.length} ACTIVE
                </span>
              </div>

              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {isLoading && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
                    Loading customer requests...
                  </div>
                )}

                {!isLoading && loadError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {loadError}
                  </div>
                )}

                {!isLoading &&
                  !loadError &&
                  filteredRequests.length === 0 && (
                    <div className="rounded-xl border border-slate-800 bg-black/30 p-6 text-center">
                      <Truck
                        size={30}
                        className="mx-auto text-slate-600"
                      />

                      <h3 className="mt-3 font-bold text-white">
                        No Pending Requests
                      </h3>
                    </div>
                  )}

                {!isLoading &&
                  !loadError &&
                  filteredRequests.map((request) => {
                    const isSelected =
                      selectedDispatchId ===
                      request.dispatchId;

                    const isUpdating =
                      actionDispatchId ===
                      request.dispatchId;

                    return (
                      <article
                        key={request.dispatchId}
                        onClick={() =>
                          setSelectedDispatchId(
                            request.dispatchId
                          )
                        }
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-green-500 bg-green-500/5"
                            : "border-red-900/20 bg-[#161a22] hover:border-green-500/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Request #{request.requestId}
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-white">
                              {request.vehicleNumber ||
                                "Customer Vehicle"}
                            </h3>
                          </div>

                          <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-[9px] font-black uppercase text-cyan-300">
                            {request.truckCategory ||
                              "Internal"}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-slate-400">
                          <p className="flex gap-2">
                            <User size={14} />
                            {request.customerName ||
                              "Customer unavailable"}
                          </p>

                          <p className="flex gap-2">
                            <Phone size={14} />
                            {request.customerContact ||
                              "Customer contact unavailable"}
                          </p>

                          <p className="flex gap-2">
                            <Truck size={14} />
                            Tow Truck: {request.truckNumber ||
                              "Not assigned"}
                          </p>

                          <p className="flex gap-2">
                            <User size={14} />
                            Driver: {request.driverName ||
                              "Not assigned"}
                          </p>

                          <p className="flex gap-2">
                            <MapPin size={14} />
                            {request.pickupLocation ||
                              "Location unavailable"}
                          </p>

                          <p className="flex gap-2">
                            <Clock size={14} />
                            ETA:{" "}
                            {formatDateTime(
                              request.estimatedArrivalTime
                            )}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStatusUpdate(
                                request.dispatchId,
                                "Approved"
                              );
                            }}
                            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-[11px] font-bold text-white hover:bg-green-500 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            {isUpdating
                              ? "Updating..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStatusUpdate(
                                request.dispatchId,
                                "Rejected"
                              );
                            }}
                            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-[11px] font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </section>

            <section className="min-w-0 flex-1">
              <h2 className="mb-4 text-xs font-bold tracking-widest md:text-sm">
                LIVE REQUEST MAP
              </h2>

              {renderMap()}
            </section>
          </div>
        )}

        {activeTab === "history" && (
          <section className="rounded-xl border border-slate-800 bg-[#0f1218] p-4 md:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-black text-white">
                  Tow Truck History
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Requests handled by the logged-in assistance officer.
                </p>
              </div>

              <select
                value={historyStatus}
                onChange={(event) =>
                  setHistoryStatus(event.target.value)
                }
                className="rounded-lg border border-slate-700 bg-black px-4 py-2.5 text-sm text-white outline-none"
              >
                <option>All</option>
                <option>Approved</option>
                <option>Dispatched</option>
                <option>Completed</option>
                <option>Rejected</option>
              </select>
            </div>

            {isHistoryLoading && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-blue-200">
                Loading tow truck history...
              </div>
            )}

            {!isHistoryLoading && historyError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
                {historyError}
              </div>
            )}

            {!isHistoryLoading &&
              !historyError &&
              filteredHistory.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-black/30 p-8 text-center">
                  <History
                    size={34}
                    className="mx-auto text-slate-600"
                  />

                  <h3 className="mt-3 font-bold text-white">
                    No History Found
                  </h3>
                </div>
              )}

            {!isHistoryLoading &&
              !historyError &&
              filteredHistory.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-4">
                          Dispatch
                        </th>
                        <th className="px-4 py-4">
                          Truck
                        </th>
                        <th className="px-4 py-4">
                          Driver
                        </th>
                        <th className="px-4 py-4">
                          Date
                        </th>
                        <th className="px-4 py-4">
                          Status
                        </th>
                        <th className="px-4 py-4">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredHistory.map((item) => (
                        <tr
                          key={item.dispatchId}
                          className="border-b border-slate-900 hover:bg-white/[0.025]"
                        >
                          <td className="px-4 py-4 font-bold text-white">
                            #{item.dispatchId}
                          </td>

                          <td className="px-4 py-4">
                            {item.truckNumber || "N/A"}
                          </td>

                          <td className="px-4 py-4">
                            {item.driverName || "N/A"}
                          </td>

                          <td className="px-4 py-4">
                            {item.dispatchDate}{" "}
                            {item.dispatchTime}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusClass(
                                item.dispatchStatus
                              )}`}
                            >
                              {item.dispatchStatus}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setDetailItem(item)
                              }
                              className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300 hover:bg-blue-500/20"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </section>
        )}
      </div>

      {actionNotice && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0c0d19] p-6 shadow-2xl">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                actionNotice.type === "error"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {actionNotice.type === "error" ? (
                <XCircle size={28} />
              ) : (
                <CheckCircle2 size={28} />
              )}
            </div>

            <h2 className="mt-5 text-2xl font-black text-white">
              {actionNotice.title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              {actionNotice.message}
            </p>

            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className={`mt-6 w-full rounded-xl py-3.5 font-bold text-white ${
                actionNotice.type === "error"
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {detailItem && (
        <div className="fixed inset-0 z-[1700] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#0c0d19] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setDetailItem(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black text-white">
              Tow Truck Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Dispatch #{detailItem.dispatchId}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Request ID", detailItem.requestId],
                ["Customer Vehicle", detailItem.vehicleNumber],
                ["Vehicle Type", detailItem.vehicleType],
                ["Vehicle Model", detailItem.vehicleModel],
                ["Customer", detailItem.customerName],
                ["Customer Contact", detailItem.customerContact],
                ["Tow Truck", detailItem.truckNumber],
                ["Truck Type", detailItem.truckType],
                ["Truck Model", detailItem.truckModel],
                ["Category", detailItem.truckCategory],
                ["Driver", detailItem.driverName],
                ["Driver Contact", detailItem.driverContact],
                ["Driver Email", detailItem.driverEmail],
                ["License Number", detailItem.licenseNumber],
                ["Pickup Location", detailItem.pickupLocation],
                ["Destination Garage", detailItem.destinationGarage],
                [
                  "Estimated Arrival",
                  formatDateTime(
                    detailItem.estimatedArrivalTime
                  ),
                ],
                ["Status", detailItem.dispatchStatus],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-800 bg-[#10111f] p-4"
                >
                  <p className="text-xs text-slate-500">
                    {label}
                  </p>

                  <p className="mt-1 break-words font-bold text-white">
                    {value || "N/A"}
                  </p>
                </div>
              ))}
            </div>

            {detailItem.coordinates && (
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-700">
                <div className="h-[300px]">
                  <MapContainer
                    center={detailItem.coordinates}
                    zoom={13}
                    scrollWheelZoom
                    className="h-full w-full z-0"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker
                      position={detailItem.coordinates}
                    >
                      <Popup>
                        Customer Pickup Location
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setDetailItem(null)}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDispatch;