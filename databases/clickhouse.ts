import { createClient } from "clickhouse";

class ChProvider {
  protected createClient() {
    return createClient({
      host: Deno.env.get("CLICKHOUSE_HOST") ?? "http://localhost:8123",
      username: Deno.env.get("CLICKHOUSE_USER") ?? "default",
      password: Deno.env.get("CLICKHOUSE_PASSWORD" ?? ""),
    });
  }

  async command(query: string) {
    const client = this.createClient();
    const res = await client.command({ query });

    client.close();

    return res;
  }

  async query(query: string) {
    const client = this.createClient();
    const res = await client.query({ query, format: "JSONEachRow" });

    client.close();

    return res;
  }

  async get(query: string) {
    const client = this.createClient();
    const res = await client.query({ query, format: "TabSeparated" });

    client.close();

    return res;
  }
}

export const chProvider = new ChProvider();
