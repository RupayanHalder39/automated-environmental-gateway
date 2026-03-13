import request from "supertest";
import app from "../src/app";

// Integration tests for ApiKeyService

describe("ApiKeyService", () => {
  let keyId: string;

  it("POST /api/v1/api-keys creates API key", async () => {
    const res = await request(app).post("/api/v1/api-keys").send({ name: "Test Key" });
    expect(res.status).toBe(201);
    expect(res.body.data.key).toBeDefined();
    keyId = res.body.data.id;
  });

  it("GET /api/v1/api-keys lists API keys", async () => {
    const res = await request(app).get("/api/v1/api-keys");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PATCH /api/v1/api-keys/:id/rotate rotates key", async () => {
    const res = await request(app).patch(`/api/v1/api-keys/${keyId}/rotate`);
    expect(res.status).toBe(200);
    expect(res.body.data.key).toBeDefined();
  });
});

