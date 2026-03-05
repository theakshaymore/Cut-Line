import { setCustomerSocket, deleteCustomerSocket } from "../services/redis.service.js";

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-salon-room", ({ salonId }) => {
      if (salonId) socket.join(`salon:${salonId}`);
    });

    socket.on("leave-salon-room", ({ salonId }) => {
      if (salonId) socket.leave(`salon:${salonId}`);
    });

    socket.on("barber-join", ({ salonId, barberId }) => {
      if (salonId) socket.join(`salon:${salonId}`);
      if (barberId) socket.join(`barber:${barberId}`);
      socket.data.barberId = barberId;
    });

    socket.on("customer-join", async ({ customerId }) => {
      if (customerId) {
        socket.join(`customer:${customerId}`);
        socket.data.customerId = customerId;
        await setCustomerSocket(customerId, socket.id);
      }
    });

    socket.on("disconnect", async () => {
      if (socket.data.customerId) {
        await deleteCustomerSocket(socket.data.customerId);
      }
    });
  });
};

export default registerSocketHandlers;