import request from "supertest";
import app from "../src/app";

// Integration tests for RuleService

describe("RuleService", () => {
  let ruleId: string;

  it("POST /api/v1/rules creates rule", async () => {
    const res = await request(app).post("/api/v1/rules").send({
      name: "High AQI Test",
      metric: "AQI",
      operator: ">",
      threshold: 150,
      location: "All Locations",
      action: "Trigger Warning",
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    ruleId = res.body.data.id;
  });

  it("GET /api/v1/rules returns list", async () => {
    const res = await request(app).get("/api/v1/rules");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PATCH /api/v1/rules/:id updates rule", async () => {
    const res = await request(app).patch(`/api/v1/rules/${ruleId}`).send({
      name: "High AQI Test Updated",
      is_active: true,
    });
    expect(res.status).toBe(200);
  });

  it("DELETE /api/v1/rules/:id disables rule", async () => {
    const res = await request(app).delete(`/api/v1/rules/${ruleId}`);
    expect(res.status).toBe(200);
  });
});

