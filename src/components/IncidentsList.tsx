import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface Incident {
  _id: string;
  _creationTime: number;
  incidentType: string;
  county: string;
  subcounty?: string;
  location: string;
  incidentDate: number;
  reportedDate: number;
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
  reporterName?: string;
  reporterPhone?: string;
  isAnonymous: boolean;
  respondingAgencies: string[];
  actionsTaken?: string;
  responseTime?: number;
}

export function IncidentsList() {
  const [sortField, setSortField] = useState<keyof Incident | "totalCasualties" | "totalLivestock">("incidentDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [countyFilter, setCountyFilter] = useState<string>("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const incidents = useQuery(api.incidents.getIncidents, {
    county: countyFilter || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  }) || [];

  const updateIncidentStatus = useMutation(api.incidents.updateIncidentStatus);
  const verifyIncident = useMutation(api.incidents.verifyIncident);

  const counties = ["Baringo", "Turkana", "West Pokot", "Samburu", "Laikipia", "Isiolo"];

  const handleSort = (field: keyof Incident | "totalCasualties" | "totalLivestock") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
    try {
      await updateIncidentStatus({
        incidentId: incidentId as any,
        status: newStatus as any,
      });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleVerification = async (incidentId: string, verified: boolean) => {
    try {
      await verifyIncident({
        incidentId: incidentId as any,
        isVerified: verified,
      });
      toast.success(`Incident ${verified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      toast.error("Failed to update verification");
    }
  };

  const filteredAndSortedIncidents = incidents
    .filter(incident => {
      const matchesSearch = searchTerm === "" || 
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident._id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "" || incident.status === statusFilter;
      const matchesPriority = priorityFilter === "" || incident.priority === priorityFilter;
      const matchesCounty = countyFilter === "" || incident.county === countyFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCounty;
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
      hour: "2-digit",
      minute: "2-digit",
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

  const IncidentDetailsModal = ({ incident, onClose }: { incident: Incident; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Incident Details - {incident._id.slice(-8).toUpperCase()}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Type:</span> {formatIncidentType(incident.incidentType)}</div>
                <div><span className="font-medium">Date:</span> {formatDate(incident.incidentDate)}</div>
                <div><span className="font-medium">Reported:</span> {formatDate(incident.reportedDate)}</div>
                <div><span className="font-medium">Location:</span> {incident.location}, {incident.subcounty && `${incident.subcounty}, `}{incident.county}</div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Priority:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(incident.priority)}`}>
                    {incident.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                    {incident.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Reporter Information</h4>
              <div className="space-y-2 text-sm">
                {incident.isAnonymous ? (
                  <div className="text-gray-500 italic">Anonymous Report</div>
                ) : (
                  <>
                    <div><span className="font-medium">Name:</span> {incident.reporterName || "N/A"}</div>
                    <div><span className="font-medium">Phone:</span> {incident.reporterPhone || "N/A"}</div>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Verified:</span>
                  {incident.isVerified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-gray-400">○ Unverified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Description</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
              {incident.description}
            </p>
          </div>

          {/* Impact Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Human Impact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Deaths:</span>
                  <span className="font-medium text-red-600">{incident.casualties.deaths}</span>
                </div>
                <div className="flex justify-between">
                  <span>Injuries:</span>
                  <span className="font-medium text-orange-600">{incident.casualties.injuries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Missing:</span>
                  <span className="font-medium text-yellow-600">{incident.casualties.missing}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Livestock Impact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cattle:</span>
                  <span className="font-medium">{incident.livestockStolen.cattle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Goats:</span>
                  <span className="font-medium">{incident.livestockStolen.goats}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sheep:</span>
                  <span className="font-medium">{incident.livestockStolen.sheep}</span>
                </div>
                <div className="flex justify-between">
                  <span>Camels:</span>
                  <span className="font-medium">{incident.livestockStolen.camels}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other:</span>
                  <span className="font-medium">{incident.livestockStolen.other}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Response Information */}
          {(incident.respondingAgencies.length > 0 || incident.actionsTaken || incident.responseTime) && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Response Information</h4>
              <div className="space-y-2 text-sm">
                {incident.respondingAgencies.length > 0 && (
                  <div>
                    <span className="font-medium">Responding Agencies:</span>
                    <div className="mt-1">
                      {incident.respondingAgencies.map((agency, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2 mb-1">
                          {agency}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {incident.responseTime && (
                  <div>
                    <span className="font-medium">Response Time:</span> {Math.round(incident.responseTime / (1000 * 60 * 60))} hours
                  </div>
                )}
                {incident.actionsTaken && (
                  <div>
                    <span className="font-medium">Actions Taken:</span>
                    <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">{incident.actionsTaken}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Incidents Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            View and manage all reported security incidents
          </p>
        </div>
        
        <div className="text-sm text-gray-600">
          Total: {filteredAndSortedIncidents.length} incidents
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          
          <select
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Counties</option>
            {counties.map(county => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>
          
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
          
          <button
            onClick={() => {
              setSearchTerm("");
              setCountyFilter("");
              setStatusFilter("");
              setPriorityFilter("");
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th 
                  className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("_id")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Incident ID</span>
                    <SortIcon field="_id" />
                  </div>
                </th>
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
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No incidents found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredAndSortedIncidents.map((incident, index) => (
                  <tr 
                    key={incident._id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                    onClick={() => {
                      setSelectedIncident(incident);
                      setShowDetails(true);
                    }}
                  >
                    <td className="px-4 py-3 text-gray-900 font-mono text-xs">
                      {incident._id.slice(-8).toUpperCase()}
                    </td>
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
                      <select
                        value={incident.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(incident._id, e.target.value);
                        }}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(incident.status)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="reported">REPORTED</option>
                        <option value="verified">VERIFIED</option>
                        <option value="investigating">INVESTIGATING</option>
                        <option value="resolved">RESOLVED</option>
                        <option value="closed">CLOSED</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs">
                      <div className="truncate" title={incident.description}>
                        {incident.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {incident.respondingAgencies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {incident.respondingAgencies.slice(0, 2).map((agency, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {agency}
                            </span>
                          ))}
                          {incident.respondingAgencies.length > 2 && (
                            <span className="text-xs text-gray-500">+{incident.respondingAgencies.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerification(incident._id, !incident.isVerified);
                          }}
                          className={`text-sm px-2 py-1 rounded ${
                            incident.isVerified 
                              ? "bg-green-100 text-green-800 hover:bg-green-200" 
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          title={incident.isVerified ? "Unverify" : "Verify"}
                        >
                          {incident.isVerified ? "✓" : "○"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Incident Details Modal */}
      {showDetails && selectedIncident && (
        <IncidentDetailsModal
          incident={selectedIncident}
          onClose={() => {
            setShowDetails(false);
            setSelectedIncident(null);
          }}
        />
      )}
    </div>
  );
}
