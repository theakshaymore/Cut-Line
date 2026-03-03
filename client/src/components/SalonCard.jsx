import { Link } from "react-router-dom";
import WaitTimeBadge from "./WaitTimeBadge";

const SalonCard = ({ salon }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-2">
      <h3 className="font-semibold text-lg">{salon.name}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">{salon.address}</p>
      <div className="text-sm">Distance: {salon.distanceKm} km</div>
      <div className="text-sm">Queue: {salon.queueCount}</div>
      <div className="text-sm">Available chairs: {salon.availableChairs}</div>
      <WaitTimeBadge minutes={salon.estimatedWait} />
      <Link className="mt-2 text-center bg-brand text-white rounded px-3 py-2" to={`/salons/${salon.id}`}>
        View Queue
      </Link>
    </div>
  );
};

export default SalonCard;
