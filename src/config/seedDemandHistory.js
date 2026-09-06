const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const csv = require("csv-parser");

const env = require("./env");

const DemandHistory = require("../models/DemandHistory");

const BATCH_SIZE = 1000;

const EXPECTED_RECORDS = 18250;
const EXPECTED_PRODUCTS = 10;
const EXPECTED_LOCATIONS = 5;
const EXPECTED_SERIES = 50;
const EXPECTED_DAYS_PER_SERIES = 365;

/*
|--------------------------------------------------------------------------
| CSV Path
|--------------------------------------------------------------------------
|
| Usage:
|
| node src/config/seedDemandHistory.js <path-to-csv>
|
|--------------------------------------------------------------------------
*/

const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: node src/config/seedDemandHistory.js <path-to-csv>");

  process.exit(1);
}

const resolvedCsvPath = path.resolve(csvPath);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  date.setUTCHours(0, 0, 0, 0);

  return date;
};

const parseNumber = (value, fieldName) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`Invalid ${fieldName}: ${value}`);
  }

  return number;
};

const parseFestival = (value) => {
  const festival = Number(value);

  if (![0, 1].includes(festival)) {
    throw new Error(`Invalid festival value: ${value}`);
  }

  return festival;
};

/*
|--------------------------------------------------------------------------
| Transform CSV Record
|--------------------------------------------------------------------------
*/

const transformRecord = (row) => {
  /*
   * IMPORTANT:
   *
   * The cleaned ML dataset uses:
   *
   * festival
   * demand_kg
   *
   * not festival_flag.
   */
  if (
    !row.date ||
    !row.product ||
    !row.category ||
    !row.location ||
    row.demand_kg === undefined ||
    row.festival === undefined
  ) {
    throw new Error("CSV record is missing one or more required fields");
  }

  const date = normalizeDate(row.date);

  const demandKg = parseNumber(row.demand_kg, "demand_kg");

  if (demandKg < 0) {
    throw new Error(`Demand cannot be negative: ${demandKg}`);
  }

  return {
    date,

    product: row.product.trim(),

    category: row.category.trim(),

    location: row.location.trim(),

    demandKg,

    festival: parseFestival(row.festival)
  };
};

/*
|--------------------------------------------------------------------------
| Seed Demand History
|--------------------------------------------------------------------------
*/

const seedDemandHistory = async () => {
  console.log("==================================================");

  console.log("FarmDirect Demand History Import");

  console.log("==================================================");

  console.log(`CSV: ${resolvedCsvPath}`);

  if (!fs.existsSync(resolvedCsvPath)) {
    throw new Error(`CSV file not found: ${resolvedCsvPath}`);
  }

  /*
   * Connect to MongoDB.
   */
  console.log("Connecting to MongoDB...");

  await mongoose.connect(env.MONGODB_URI);

  console.log("MongoDB connected.");

  let batch = [];

  let processed = 0;

  let inserted = 0;

  let modified = 0;

  /*
   * Dataset validation structures.
   */
  const seriesMap = new Map();

  const products = new Set();

  const locations = new Set();

  let firstDate = null;

  let lastDate = null;

  try {
    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(resolvedCsvPath).pipe(csv());

      stream.on("data", async (row) => {
        stream.pause();

        try {
          const record = transformRecord(row);

          /*
           * Track products and locations.
           */
          products.add(record.product);

          locations.add(record.location);

          /*
           * Track product-location series.
           */
          const seriesKey = `${record.product}::${record.location}`;

          if (!seriesMap.has(seriesKey)) {
            seriesMap.set(seriesKey, []);
          }

          seriesMap.get(seriesKey).push(record.date);

          /*
           * Track global date range.
           */
          if (!firstDate || record.date < firstDate) {
            firstDate = record.date;
          }

          if (!lastDate || record.date > lastDate) {
            lastDate = record.date;
          }

          /*
           * Upsert record.
           */
          batch.push({
            updateOne: {
              filter: {
                product: record.product,
                location: record.location,
                date: record.date
              },

              update: {
                $set: {
                  product: record.product,
                  category: record.category,
                  location: record.location,
                  demandKg: record.demandKg,
                  festival: record.festival
                }
              },

              upsert: true
            }
          });

          processed += 1;

          /*
           * Flush batch.
           */
          if (batch.length >= BATCH_SIZE) {
            const currentBatch = batch;

            batch = [];

            const result = await DemandHistory.bulkWrite(currentBatch, {
              ordered: false
            });

            inserted += result.upsertedCount || 0;

            modified += result.modifiedCount || 0;

            if (processed % 5000 === 0) {
              console.log(`Processed: ${processed}`);
            }
          }

          stream.resume();
        } catch (error) {
          stream.destroy(error);
        }
      });

      stream.on("end", async () => {
        try {
          /*
           * Flush remaining records.
           */
          if (batch.length) {
            const result = await DemandHistory.bulkWrite(batch, {
              ordered: false
            });

            inserted += result.upsertedCount || 0;

            modified += result.modifiedCount || 0;
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      stream.on("error", reject);
    });

    /*
    |--------------------------------------------------------------------------
    | Dataset Validation
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log("Validating imported dataset...");

    const totalRecords = await DemandHistory.countDocuments();

    const distinctProducts = await DemandHistory.distinct("product");

    const distinctLocations = await DemandHistory.distinct("location");

    const databaseSeries = await DemandHistory.aggregate([
      {
        $group: {
          _id: {
            product: "$product",
            location: "$location"
          },

          count: {
            $sum: 1
          }
        }
      }
    ]);

    /*
     * Validate total record count.
     */
    if (totalRecords !== EXPECTED_RECORDS) {
      throw new Error(
        `Expected ${EXPECTED_RECORDS} records but found ${totalRecords}`
      );
    }

    /*
     * Validate product count.
     */
    if (distinctProducts.length !== EXPECTED_PRODUCTS) {
      throw new Error(
        `Expected ${EXPECTED_PRODUCTS} products but found ${distinctProducts.length}`
      );
    }

    /*
     * Validate location count.
     */
    if (distinctLocations.length !== EXPECTED_LOCATIONS) {
      throw new Error(
        `Expected ${EXPECTED_LOCATIONS} locations but found ${distinctLocations.length}`
      );
    }

    /*
     * Validate series count.
     */
    if (databaseSeries.length !== EXPECTED_SERIES) {
      throw new Error(
        `Expected ${EXPECTED_SERIES} product-location series but found ${databaseSeries.length}`
      );
    }

    /*
     * Validate every series has exactly 365 records.
     */
    for (const series of databaseSeries) {
      if (series.count !== EXPECTED_DAYS_PER_SERIES) {
        throw new Error(
          `Series ${series._id.product} / ${series._id.location} has ${series.count} records instead of ${EXPECTED_DAYS_PER_SERIES}`
        );
      }
    }

    /*
     * Validate date range.
     */
    const expectedFirstDate = "2025-09-01";

    const expectedLastDate = "2026-08-31";

    const actualFirstDate = firstDate.toISOString().slice(0, 10);

    const actualLastDate = lastDate.toISOString().slice(0, 10);

    if (actualFirstDate !== expectedFirstDate) {
      throw new Error(
        `Expected first date ${expectedFirstDate}, found ${actualFirstDate}`
      );
    }

    if (actualLastDate !== expectedLastDate) {
      throw new Error(
        `Expected last date ${expectedLastDate}, found ${actualLastDate}`
      );
    }

    /*
     |--------------------------------------------------------------------------
     | Final Summary
     |--------------------------------------------------------------------------
     */

    console.log("==================================================");

    console.log("Demand History Import Complete");

    console.log("==================================================");

    console.log(`CSV records processed: ${processed}`);

    console.log(`MongoDB records: ${totalRecords}`);

    console.log(`Inserted: ${inserted}`);

    console.log(`Updated: ${modified}`);

    console.log(`Products: ${distinctProducts.length}`);

    console.log(`Locations: ${distinctLocations.length}`);

    console.log(`Product-location series: ${databaseSeries.length}`);

    console.log(`Date range: ${actualFirstDate} → ${actualLastDate}`);

    console.log("");

    console.log("✓ RECORD COUNT VALIDATION PASSED");

    console.log("✓ PRODUCT VALIDATION PASSED");

    console.log("✓ LOCATION VALIDATION PASSED");

    console.log("✓ SERIES VALIDATION PASSED");

    console.log("✓ DATE RANGE VALIDATION PASSED");

    console.log("");

    console.log("✓ DEMAND HISTORY SEED VALIDATION PASSED");
  } finally {
    await mongoose.disconnect();

    console.log("MongoDB connection closed.");
  }
};

/*
|--------------------------------------------------------------------------
| Execute
|--------------------------------------------------------------------------
*/

seedDemandHistory().catch((error) => {
  console.error("");

  console.error("✗ DEMAND HISTORY IMPORT FAILED");

  console.error(error.message);

  mongoose
    .disconnect()
    .catch(() => {})
    .finally(() => {
      process.exit(1);
    });
});
