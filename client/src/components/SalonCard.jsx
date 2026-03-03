import { Link } from "react-router-dom";
import { Armchair, Clock3, MapPin, Store, UsersRound } from "lucide-react";
import WaitTimeBadge from "./WaitTimeBadge";

const SalonCard = ({ salon }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <img
        src={salon.imageUrl || "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80"}
        alt={salon.name}
        className="h-40 w-full object-cover"
      />
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Store size={17} /> {salon.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <MapPin size={15} className="mt-0.5" /> {salon.address}
        </p>
        <div className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-1"><MapPin size={14} /> {salon.distanceKm} km</span>
          <span className="flex items-center gap-1"><UsersRound size={14} /> {salon.queueCount} waiting</span>
        </div>
        <div className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-1"><Armchair size={14} /> {salon.availableChairs} free chairs</span>
          <span className="flex items-center gap-1"><Clock3 size={14} /> <WaitTimeBadge minutes={salon.estimatedWait} /></span>
        </div>
      </div>
      <Link className="m-4 mt-0 block text-center bg-brand text-white rounded px-3 py-2" to={`/salons/${salon.id}`}>
        View Queue
      </Link>
    </div>
  );
};

export default SalonCard;
