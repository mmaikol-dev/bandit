import { useState } from "react";

interface Incident {
  _id: string;
  _creationTime: number;
  incidentType: string;
  county: string;
  location: string;
  incidentDate: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "reported" | "verified" | "investigating" | "resolved" | "closed";
  description: string;
  casualties: {
    deaths: number;
    injuries: number;
    missing: number;
  };
  livestockStolen: {
    cattle: number;
    goats: number;
    sheep: number;
    camels: number;
    other: number;
  };
  isVerified: boolean;
}

interface IncidentsTableProps {
  incidents: Incident[];
}

export function IncidentsTable({ incidents }: IncidentsTableProps) {
  const [sortField, setSortField] = useState<keyof Incident | "totalCasualties" | "totalLivestock">("incidentDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const handleSort = (field: keyof Incident | "totalCasualties" | "totalLivestock") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedIncidents = incidents
    .filter(incident => {
      const matchesSearch = searchTerm === "" || 
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.county.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "" || incident.status === statusFilter;
      const matchesPriority = priorityFilter === "" || incident.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "totalCasualties") {
        aValue = a.casualties.deaths + a.casualties.injuries + a.casualties.missing;
        bValue = b.casualties.deaths + b.casualties.injuries + b.casualties.missing;
      } else if (sortField === "totalLivestock") {
        aValue = a.livestockStolen.cattle + a.livestockStolen.goats + a.livestockStolen.sheep + a.livestockStolen.camels + a.livestockStolen.other;
        bValue = b.livestockStolen.cattle + b.livestockStolen.goats + b.livestockStolen.sheep + b.livestockStolen.camels + b.livestockStolen.other;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatIncidentType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported": return "bg-blue-100 text-blue-800";
      case "verified": return "bg-purple-100 text-purple-800";
      case "investigating": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const SortIcon = ({ field }: { field: keyof Incident | "totalCasualties" | "totalLivestock" }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th 
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("incidentDate")}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <SortIcon field="incidentDate" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("incidentType")}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  <SortIcon field="incidentType" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("location")}
              >
                <div className="flex items-center space-x-1">
                  <span>Location</span>
                  <SortIcon field="location" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center space-x-1">
                  <span>Priority</span>
                  <SortIcon field="priority" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("totalCasualties")}
              >
                <div className="flex items-center space-x-1">
                  <span>Casualties</span>
                  <SortIcon field="totalCasualties" />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Description
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Verified
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No incidents found matching your criteria
                </td>
              </tr>
            ) : (
              filteredAndSortedIncidents.map((incident, index) => {
                const totalCasualties = incident.casualties.deaths + incident.casualties.injuries + incident.casualties.missing;
                const totalLivestock = incident.livestockStolen.cattle + incident.livestockStolen.goats + 
                                     incident.livestockStolen.sheep + incident.livestockStolen.camels + 
                                     incident.livestockStolen.other;
                
                return (
                  <tr 
                    key={incident._id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {formatDate(incident.incidentDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatIncidentType(incident.incidentType)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>
                        <div className="font-medium">{incident.location}</div>
                        <div className="text-xs text-gray-500">{incident.county}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(incident.priority)}`}>
                        {incident.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                        {incident.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="text-sm">
                        {totalCasualties > 0 && (
                          <div>👥 {totalCasualties}</div>
                        )}
                        {totalLivestock > 0 && (
                          <div>🐄 {totalLivestock}</div>
                        )}
                        {totalCasualties === 0 && totalLivestock === 0 && (
                          <span className="text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs">
                      <div className="truncate" title={incident.description}>
                        {incident.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {incident.isVerified ? (
                        <span className="text-green-600 text-lg" title="Verified">✓</span>
                      ) : (
                        <span className="text-gray-400 text-lg" title="Unverified">○</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredAndSortedIncidents.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50 text-sm text-gray-600">
          Showing {filteredAndSortedIncidents.length} of {incidents.length} incidents
        </div>
      )}
    </div>
  );
}
