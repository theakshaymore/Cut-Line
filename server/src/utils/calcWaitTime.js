const calcWaitTime = ({ activeChairs, waitingCount, avgServiceTime }) => {
  if (waitingCount <= 0) return 0;
  if (activeChairs <= 0) return waitingCount * avgServiceTime;
  return Math.ceil(waitingCount / activeChairs) * avgServiceTime;
};

export default calcWaitTime;
