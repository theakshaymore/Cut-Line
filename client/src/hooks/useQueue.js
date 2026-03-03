import { useEffect, useState } from "react";
import api from "../utils/api";
import useSocket from "./useSocket";

const useQueue = () => {
  const [status, setStatus] = useState(null);
  const socket = useSocket();

  const refresh = async () => {
    const { data } = await api.get("/queue/my-status");
    setStatus(data);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onPosition = (payload) => {
      setStatus((prev) => {
        if (!prev?.entry) return prev;
        return {
          ...prev,
          entry: {
            ...prev.entry,
            position: payload.newPosition,
            estimatedWait: payload.estimatedWait,
          },
        };
      });
    };
    socket.on("position-changed", onPosition);
    socket.on("kicked-from-queue", refresh);
    return () => {
      socket.off("position-changed", onPosition);
      socket.off("kicked-from-queue", refresh);
    };
  }, [socket]);

  return { status, refresh };
};

export default useQueue;