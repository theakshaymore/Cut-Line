const statusClass = {
  idle: "bg-emerald-100 text-emerald-700",
  occupied: "bg-amber-100 text-amber-700",
  done: "bg-rose-100 text-rose-700",
};

const ChairCard = ({ chair, queueAvailable, onAssign, onDone, onIdle }) => {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{chair.label}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${statusClass[chair.status] || "bg-slate-100"}`}>
          {chair.status}
        </span>
      </div>
      {chair.currentEntry?.customer && (
        <div className="mt-3 text-sm">
          <p className="font-medium">{chair.currentEntry.customer.name}</p>
          <p className="text-slate-600">{chair.currentEntry.service}</p>
        </div>
      )}
      <div className="mt-3">
        {chair.status === "idle" && queueAvailable > 0 && (
          <button className="w-full bg-brand text-white rounded py-2" onClick={() => onAssign(chair.id)}>
            Assign Next
          </button>
        )}
        {chair.status === "occupied" && (
          <button className="w-full bg-amber-600 text-white rounded py-2" onClick={() => onDone(chair.id)}>
            Mark Done
          </button>
        )}
        {chair.status === "done" && (
          <button className="w-full bg-slate-800 text-white rounded py-2" onClick={() => onIdle(chair.id)}>
            Reset to Idle
          </button>
        )}
      </div>
    </div>
  );
};

export default ChairCard;