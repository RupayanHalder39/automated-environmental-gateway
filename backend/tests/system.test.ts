import request from "supertest";
import app from "../src/app";

// Integration tests for SystemService

describe("SystemService", () => {
  it("GET /api/v1/system/status returns system status", async () => {
    const res = await request(app).get("/api/v1/system/status");
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it("GET /api/v1/system/metrics returns metrics", async () => {
    const res = await request(app).get("/api/v1/system/metrics");
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

