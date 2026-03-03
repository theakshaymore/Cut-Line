require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth.routes");
const salonRoutes = require("./routes/salon.routes");
const queueRoutes = require("./routes/queue.routes");
const chairRoutes = require("./routes/chair.routes");
const barberRoutes = require("./routes/barber.routes");
const { apiRateLimiter } = require("./middleware/rateLimit.middleware");
const registerSocketHandlers = require("./socket/socket.handler");
const { initRedis } = require("./services/redis.service");
const { hydrateRedisFromPostgres } = require("./services/queue.service");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

app.set("io", io);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(apiRateLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/barber/chairs", chairRoutes);
app.use("/api/barber", barberRoutes);

registerSocketHandlers(io);

const start = async () => {
  await initRedis();
  await hydrateRedisFromPostgres();
  const port = Number(process.env.PORT || 5000);
  server.listen(port, () => {
    process.stdout.write(`NextCut server running on port ${port}\n`);
  });
};

start();