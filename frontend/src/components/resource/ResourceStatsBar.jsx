import React from "react";
import { Building2, FlaskConical, MonitorPlay, Cpu, CheckCircle, XCircle, Wrench } from "lucide-react";

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 flex-1 min-w-0`}>
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
      <p className="text-xl font-bold text-slate-800 leading-tight">{value ?? "—"}</p>
    </div>
  </div>
);

const ResourceStatsBar = ({ stats }) => {
  if (!stats) return null;
  return (
    <div className="flex flex-wrap gap-3">
      <Stat icon={Building2}   label="Lecture Halls"    value={stats.lectureHalls}      color="bg-violet-500" />
      <Stat icon={FlaskConical} label="Labs"             value={stats.labs}              color="bg-blue-500"   />
      <Stat icon={MonitorPlay} label="Meeting Rooms"    value={stats.meetingRooms}      color="bg-teal-500"   />
      <Stat icon={Cpu}         label="Equipment"        value={stats.equipment}         color="bg-orange-500" />
      <Stat icon={CheckCircle} label="Active"           value={stats.active}            color="bg-emerald-500"/>
      <Stat icon={XCircle}     label="Out of Service"   value={stats.outOfService}      color="bg-red-500"    />
      <Stat icon={Wrench}      label="Under Maintenance" value={stats.underMaintenance}  color="bg-amber-500"  />
    </div>
  );
};

export default ResourceStatsBar;
