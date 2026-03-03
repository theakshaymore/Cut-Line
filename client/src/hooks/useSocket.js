import { useSocketContext } from "../context/SocketContext";

const useSocket = () => {
  const { socket } = useSocketContext();
  return socket;
};

export default useSocket;