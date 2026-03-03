import formatTime from "../utils/formatTime";

const WaitTimeBadge = ({ minutes }) => {
  return (
    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
      {formatTime(minutes)}
    </span>
  );
};

export default WaitTimeBadge;
