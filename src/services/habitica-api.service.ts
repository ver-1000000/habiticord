import fetch from "node-fetch";
import { HABITICA_ENDPOINT } from "../environment.js";

/**
 * Habitica APIを叩くためのService。
 */
export class HabiticaAPIService {
  async getTasks({ id, token }: { id: string; token: string }) {
    const params = new URLSearchParams({ type: "todos" });
    return await fetch(`${HABITICA_ENDPOINT}/tasks/user?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-user": id,
        "x-api-key": token,
      },
    });
  }
}
