import React from "react";
import {
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const DashboardLayout = ({ activeItem }) => {
  const renderContent = () => {
    switch (activeItem) {
      case 0:
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <main className="pt-20 lg:pl-64 min-h-screen
                     bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="p-6">{renderContent()}</div>
    </main>
  );
};

/* ---------------- DASHBOARD OVERVIEW ---------------- */

const DashboardOverview = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "₹12,45,000",
      change: "+23.5%",
      isPositive: true,
      icon: DollarSign,
      accent: "orange",
    },
    {
      title: "Total Customers",
      value: "2,847",
      change: "+12.3%",
      isPositive: true,
      icon: Users,
      accent: "blue",
    },
    {
      title: "Active Leads",
      value: "1,234",
      change: "+8.7%",
      isPositive: true,
      icon: UserPlus,
      accent: "orange",
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "-3.2%",
      isPositive: false,
      icon: TrendingUp,
      accent: "blue",
    },
  ];

  const recentDeals = [
    { company: "Tech Solutions Inc.", value: "₹45,000", stage: "Negotiation", probability: 85 },
    { company: "Global Marketing Co.", value: "₹32,000", stage: "Proposal", probability: 65 },
    { company: "Digital Innovations", value: "₹28,500", stage: "Qualified", probability: 45 },
    { company: "Startup Ventures", value: "₹19,200", stage: "Discovery", probability: 30 },
  ];

  const activities = [
    { title: "Call with client", time: "2 hours ago", status: "completed" },
    { title: "Installation demo", time: "4 hours ago", status: "completed" },
    { title: "Follow up lead", time: "6 hours ago", status: "pending" },
    { title: "Prepare quotation", time: "Tomorrow", status: "upcoming" },
  ];

  const accent = {
    orange: {
      bg: "from-orange-400/15 to-orange-100/40",
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
      glow:
        "hover:shadow-[0_0_0_3px_rgba(251,146,60,0.35),0_20px_40px_rgba(251,146,60,0.35)]",
    },
    blue: {
      bg: "from-blue-400/15 to-blue-100/40",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      glow:
        "hover:shadow-[0_0_0_3px_rgba(59,130,246,0.35),0_20px_40px_rgba(59,130,246,0.35)]",
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          A live snapshot of your solar & water operations
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const style = accent[stat.accent];

          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl p-6
                          bg-gradient-to-br ${style.bg}
                          border border-white
                          shadow-md transition-all duration-300
                          hover:-translate-y-1 ${style.glow}`}
            >
              <div className="flex justify-between mb-4">
                <div className={`${style.iconBg} p-3 rounded-xl`}>
                  <Icon size={24} className={style.iconText} />
                </div>
                <MoreVertical size={20} className="text-gray-400" />
              </div>

              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>

              <div className="flex items-center gap-1 text-sm">
                {stat.isPositive ? (
                  <ArrowUp size={16} className="text-green-600" />
                ) : (
                  <ArrowDown size={16} className="text-red-600" />
                )}
                <span
                  className={`font-semibold ${
                    stat.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEALS + ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DEALS */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6
                        border border-blue-100
                        shadow-[0_15px_40px_rgba(59,130,246,0.15)]
                        hover:shadow-[0_25px_60px_rgba(59,130,246,0.25)]
                        transition">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Deals</h2>
            <button className="px-4 py-1 rounded-full text-sm font-semibold
                               text-blue-600
                               hover:bg-gradient-to-r hover:from-orange-100 hover:to-blue-100">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentDeals.map((deal, i) => (
              <div
                key={i}
                className="flex justify-between p-4 rounded-xl
                           bg-gradient-to-r from-blue-50 to-orange-50
                           hover:from-orange-100 hover:to-blue-100
                           transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{deal.company}</p>
                  <p className="text-sm text-gray-600">
                    <span className="text-orange-600 font-semibold">
                      {deal.value}
                    </span>{" "}
                    • {deal.stage}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {deal.probability}%
                  </p>
                  <div className="w-24 bg-blue-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-blue-500"
                      style={{ width: `${deal.probability}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVITIES */}
        <div className="bg-white rounded-2xl p-6
                        border border-orange-100
                        shadow-[0_15px_40px_rgba(251,146,60,0.15)]
                        hover:shadow-[0_25px_60px_rgba(251,146,60,0.25)]
                        transition">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Activities
          </h2>

          <div className="space-y-4">
            {activities.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
              >
                {a.status === "completed" && (
                  <CheckCircle size={20} className="text-green-600" />
                )}
                {a.status === "pending" && (
                  <Clock size={20} className="text-orange-500" />
                )}
                {a.status === "upcoming" && (
                  <AlertCircle size={20} className="text-blue-500" />
                )}

                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-500">{a.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm font-semibold
                             text-blue-600 rounded-lg
                             hover:bg-gradient-to-r hover:from-orange-100 hover:to-blue-100">
            View All Activities
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
