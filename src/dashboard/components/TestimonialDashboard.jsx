import { useEffect, useMemo, useState } from "react";
import {
  Star,
  CheckCircle,
  XCircle,
  User,
  Clock,
} from "lucide-react";
import axios from "axios";

const AdminTestimonials = () => {
  const API = import.meta.env.VITE_API_BASE_URL;

  const [testimonials, setTestimonials] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  /* ================= BRAND THEME (BLENDED) ================= */
  const theme = {
    cardBg:
      "bg-gradient-to-br from-blue-50 via-white to-orange-50",
    cardBorder:
      "border-l-4 border-gradient-to-b from-blue-500 to-orange-500",
    tabActive:
      "text-blue-600 border-blue-600",
    star:
      "text-orange-500 fill-orange-500",
    approveBtn:
      "from-blue-600 to-orange-500",
    approved:
      "bg-blue-100 text-blue-700",
    rejected:
      "bg-red-100 text-red-700",
    pending:
      "bg-yellow-100 text-yellow-700",
  };

  /* ================= FETCH ================= */
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/testimonials`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTestimonials(res.data.testimonials || []);
      setSelected([]);
    } catch (err) {
      console.error("Failed to load testimonials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  /* ================= ACTIONS ================= */
  const updateStatus = async (id, action) => {
    try {
      await axios.put(
        `${API}/api/testimonials/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchTestimonials();
    } catch (err) {
      console.error("Action failed", err);
    }
  };

  const bulkApprove = async () => {
    try {
      await Promise.all(
        selected.map((id) =>
          axios.put(
            `${API}/api/testimonials/${id}/approve`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
        )
      );
      fetchTestimonials();
    } catch (err) {
      console.error("Bulk approve failed", err);
    }
  };

  /* ================= FILTERING ================= */
  const filteredTestimonials = useMemo(() => {
    if (activeTab === "all") return testimonials;
    return testimonials.filter((t) => t.status === activeTab);
  }, [testimonials, activeTab]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    return {
      total: testimonials.length,
      pending: testimonials.filter((t) => t.status === "pending").length,
      approved: testimonials.filter((t) => t.status === "approved").length,
      rejected: testimonials.filter((t) => t.status === "rejected").length,
    };
  }, [testimonials]);

  return (
    <div className="pt-20 lg:pl-64 min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6">
        {/* ================= HEADER ================= */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-600">
            Testimonials
          </h1>
          <p className="text-gray-600">
            Review and moderate customer testimonials
          </p>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-gray-600">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} icon={Clock} />
          <StatCard label="Approved" value={stats.approved} icon={CheckCircle} />
          <StatCard label="Rejected" value={stats.rejected} icon={XCircle} />
        </div>

        {/* ================= TABS + BULK ACTION ================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b mb-6">
          <div className="flex gap-6">
            {["all", "pending", "approved", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab
                    ? theme.tabActive
                    : "border-transparent text-muted-foreground"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {selected.length > 0 && (
            <button
              onClick={bulkApprove}
              className={`px-4 py-2 rounded-lg text-white font-semibold shadow-md bg-gradient-to-r ${theme.approveBtn}`}
            >
              Approve Selected ({selected.length})
            </button>
          )}
        </div>

        {/* ================= LIST ================= */}
        {loading ? (
          <p>Loading...</p>
        ) : filteredTestimonials.length === 0 ? (
          <p className="text-gray-600">
            No testimonials found.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredTestimonials.map((t) => (
              <div
                key={t._id}
                className={`p-5 rounded-xl border ${theme.cardBg} flex flex-col md:flex-row gap-4 shadow-sm hover:shadow-md transition`}
              >
                {/* CHECKBOX */}
                {t.status === "pending" && (
                  <input
                    type="checkbox"
                    checked={selected.includes(t._id)}
                    onChange={(e) =>
                      setSelected((prev) =>
                        e.target.checked
                          ? [...prev, t._id]
                          : prev.filter((id) => id !== t._id)
                      )
                    }
                  />
                )}

                {/* USER */}
                <div className="flex items-center gap-4 min-w-[220px]">
                  {t.image ? (
                    <img
                      src={`${API}${t.image}`}
                      alt={t.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    {t.roleOrLocation && (
                      <p className="text-sm text-gray-600">
                        {t.roleOrLocation}
                      </p>
                    )}
                  </div>
                </div>

                {/* MESSAGE */}
                <div className="flex-1">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (t.rating || 5)
                            ? theme.star
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-800 ">
  “{t.message}”
</p>
                </div>

                {/* STATUS */}
                <div className="flex items-center gap-2">
                  {t.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(t._id, "approve")}
                        className="px-3 py-1 rounded-lg text-white text-sm bg-gradient-to-r from-green-500 to-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(t._id, "reject")}
                        className="px-3 py-1 rounded-lg text-white text-sm bg-gradient-to-r from-red-500 to-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {t.status === "approved" && (
                    <span className={`px-3 py-1 rounded-full text-sm ${theme.approved}`}>
                      APPROVED
                    </span>
                  )}

                  {t.status === "rejected" && (
                    <span className={`px-3 py-1 rounded-full text-sm ${theme.rejected}`}>
                      REJECTED
                    </span>
                  )}

                  {t.status === "pending" && (
                    <span className={`px-3 py-1 rounded-full text-sm ${theme.pending}`}>
                      PENDING
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= STAT CARD ================= */
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-orange-50 border shadow-sm">
    <div className="flex items-center gap-2 text-gray-600 mb-1">
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-sm">{label}</span>
    </div>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

export default AdminTestimonials;
