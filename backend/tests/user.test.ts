import request from "supertest";
import app from "../src/app";

// Integration tests for UserService

describe("UserService", () => {
  let userId: string;

  it("POST /api/v1/users creates user", async () => {
    const res = await request(app).post("/api/v1/users").send({
      fullName: "Admin User",
      email: "admin@test.io",
      organization: "Test Org",
    });
    expect(res.status).toBe(201);
    userId = res.body.data.id;
  });

  it("GET /api/v1/users lists users", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PATCH /api/v1/settings/system updates settings", async () => {
    const res = await request(app).patch("/api/v1/settings/system").send({
      userId,
      dataRetentionDays: 120,
      autoBackup: true,
      debugMode: false,
    });
    expect(res.status).toBe(200);
  });
});

