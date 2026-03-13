import request from "supertest";
import app from "../src/app";

// Integration tests for ReportService

describe("ReportService", () => {
  let reportId: string;

  it("POST /api/v1/reports creates report metadata", async () => {
    const res = await request(app).post("/api/v1/reports").send({
      name: "Test Report",
      type: "Custom Range",
      zone: "Salt Lake",
      dateRange: "Mar 1 - Mar 7, 2026",
      avgAqi: 90,
      highestPollution: "Park Street",
      waterAlerts: 2,
    });
    expect(res.status).toBe(201);
    reportId = res.body.data.id;
  });

  it("GET /api/v1/reports lists reports", async () => {
    const res = await request(app).get("/api/v1/reports");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/reports/:id returns report", async () => {
    const res = await request(app).get(`/api/v1/reports/${reportId}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

