import { createClient } from "redis";
import config from "../config";

export const client = createClient({
  username: "default",
  password: config.redis_password,
  socket: {
    host: config.redis_host,
    port: 17947,
  },
});
