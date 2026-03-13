import { db } from "../src/utils/db";

// Purpose: Example script to create monthly partitions for sensor_readings.
// This protects performance by keeping time-series data segmented and index-friendly.

async function createMonthlyPartition(year: number, month: number) {
  // month is 1-based (1 = January)
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const partitionName = `sensor_readings_${year}_${String(month).padStart(2, "0")}`;

  await db.query(
    `CREATE TABLE IF NOT EXISTS ${partitionName}
     PARTITION OF sensor_readings
     FOR VALUES FROM ('${start}') TO ('${end}')`
  );

  console.log(`Partition ensured: ${partitionName}`);
}

async function main() {
  // Example usage: create a partition for current month.
  const now = new Date();
  await createMonthlyPartition(now.getUTCFullYear(), now.getUTCMonth() + 1);
  process.exit(0);
}

main().catch((err) => {
  console.error("Partition creation failed:", err);
  process.exit(1);
});

