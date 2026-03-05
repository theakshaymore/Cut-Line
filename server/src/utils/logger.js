const stringifyMeta = (meta = {}) => {
  try {
    return JSON.stringify(meta);
  } catch (_) {
    return "{}";
  }
};

const write = (level, message, meta = {}) => {
  const line = `[${new Date().toISOString()}] [${level}] ${message} ${stringifyMeta(meta)}`;
  if (level === "ERROR") {
    console.error(line);
    return;
  }
  if (level === "WARN") {
    console.warn(line);
    return;
  }
  console.log(line);
};

export const logger = {
  info: (message, meta) => write("INFO", message, meta),
  warn: (message, meta) => write("WARN", message, meta),
  error: (message, meta) => write("ERROR", message, meta),
};
