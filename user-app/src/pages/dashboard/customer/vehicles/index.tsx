import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCar, FaUsers, FaGasPump, FaSearch, FaFilter } from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { vehiclesAPI } from "@/lib/api";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";

export default function BrowseVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    vehicleType: "",
    minPrice: "",
    maxPrice: "",
    availability: "available",
  });

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params: any = {
        availability: filters.availability,
      };

      if (filters.vehicleType) params.vehicleType = filters.vehicleType;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const response = await vehiclesAPI.getAll(params);
      let data = response.data.data;

      // Client-side search filtering
      if (filters.search) {
        data = data.filter(
          (v: any) =>
            v.make.toLowerCase().includes(filters.search.toLowerCase()) ||
            v.model.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const vehicleTypes = [
    { value: "", label: "All Types" },
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "van", label: "Van" },
    { value: "truck", label: "Truck" },
    { value: "luxury", label: "Luxury" },
    { value: "electric", label: "Electric" },
    { value: "hybrid", label: "Hybrid" },
  ];

  return (
    <>
      <Head>
        <title>Browse Vehicles - FleetHub</title>
      </Head>

      <DashboardLayout role="customer">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Vehicles</h1>
            <p className="text-gray-400">
              Find the perfect vehicle for your trip
            </p>
          </div>

          {/* Filters */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaFilter className="text-primary-500" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="label">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="input pl-10"
                    placeholder="Search make or model..."
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="label">Vehicle Type</label>
                <select
                  value={filters.vehicleType}
                  onChange={(e) =>
                    setFilters({ ...filters, vehicleType: e.target.value })
                  }
                  className="input"
                >
                  {vehicleTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="label">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="input"
                  placeholder="$0"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="label">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="input"
                  placeholder="$1000"
                />
              </div>
            </div>
          </div>

          {/* Vehicles Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-400">
                Found {vehicles.length} vehicle
                {vehicles.length !== 1 ? "s" : ""}
              </div>

              {vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle._id}
                      className="card-hover overflow-hidden"
                    >
                      {/* Vehicle Image */}
                      <div className="aspect-video bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                        <FaCar className="text-white text-6xl opacity-50" />
                      </div>

                      {/* Vehicle Info */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {vehicle.make} {vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {vehicle.year}
                            </p>
                          </div>
                          <span
                            className={getStatusBadgeClass(
                              vehicle.availability
                            )}
                          >
                            {vehicle.availability}
                          </span>
                        </div>

                        {/* Features */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <FaUsers />
                            <span>{vehicle.capacity.passengers}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaGasPump />
                            <span className="capitalize">
                              {vehicle.fuelType}
                            </span>
                          </div>
                          <div className="capitalize">
                            {vehicle.vehicleType}
                          </div>
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                          <div>
                            <div className="text-2xl font-bold text-primary-500">
                              {formatCurrency(vehicle.pricePerDay)}
                            </div>
                            <div className="text-xs text-gray-400">per day</div>
                          </div>
                          <Link
                            href={`/dashboard/customer/vehicles/${vehicle._id}`}
                            className="btn btn-primary"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <FaCar className="text-6xl text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No vehicles found
                  </h3>
                  <p className="text-gray-400">Try adjusting your filters</p>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
