import { createClient } from "redis";

export const client = createClient({
  username: "default",
  password: "68LXLGSdyiW9tHAtPj0uSbD7acUFLhP2",
  socket: {
    host: "cause-accordant-joyous-52600.db.redis.io",
    port: 18799,
  },
});
