import express from "express";
import cors from "cors";
import { knex } from "knex";
import dayjs from "dayjs";
dayjs().format();

// CONFIG VARIABLES
const app = express();
app.use(cors());
const port = 3001;

// DATABASE CONNECTION
const database = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "henriqueguisasola",
    password: "123456",
    database: "test_application",
  },
});

// API ENDPOINTS
app.get("/shifts", async (req, res) => {
  const data = await database("question_one_shifts as s")
    .join("facilities as f", "s.facility_id", "=", "f.facility_id")
    .select();
  res.json({ shifts: data });
});

app.get("/check-shifts/:firstShiftId/:secondShiftId", async (req, res) => {
  const { firstShiftId, secondShiftId } = req.params;

  if (!firstShiftId || !secondShiftId) {
  }

  const [firstShift, secondShift] = await database("question_one_shifts as s")
    .join("facilities as f", "s.facility_id", "=", "f.facility_id")
    .select()
    .whereIn("s.shift_id", [firstShiftId, secondShiftId]);

  let maximumOverlapThreshold = 0;
  if (firstShift.facility_id === secondShift.facility_id) {
    maximumOverlapThreshold = 30;
  }

  const fsStartTime = firstShift.start_time.split(":");
  const fsEndTime = firstShift.end_time.split(":");
  const fsStartDate = dayjs(firstShift.shift_date)
    .set("hour", fsStartTime[0])
    .set("minute", fsStartTime[1])
    .set("second", fsStartTime[2]);
  const fsEndDate = dayjs(firstShift.shift_date)
    .set("hour", fsEndTime[0])
    .set("minute", fsEndTime[1])
    .set("second", fsEndTime[2]);
  if (fsStartTime[0] > fsEndTime[0]) {
    fsEndDate.add(1, "day");
  }

  const ssStartTime = secondShift.start_time.split(":");
  const ssEndTime = secondShift.end_time.split(":");
  const ssStartDate = dayjs(secondShift.shift_date)
    .set("hour", ssStartTime[0])
    .set("minute", ssStartTime[1])
    .set("second", ssStartTime[2]);
  const ssEndDate = dayjs(secondShift.shift_date)
    .set("hour", ssEndTime[0])
    .set("minute", ssEndTime[1])
    .set("second", ssEndTime[2]);
  if (ssStartTime[0] > ssEndTime[0]) {
    ssEndDate.add(1, "day");
  }

  let overlapMinutes = 0;
  // Checking the first shift
  if (
    fsStartDate.unix() < ssEndDate.unix() &&
    fsStartDate.unix() > ssStartDate.unix()
  ) {
    overlapMinutes = (ssEndDate.unix() - fsStartDate.unix()) / 60;
  }

  // Checking the second shift
  if (
    ssStartDate.unix() < fsEndDate.unix() &&
    ssStartDate.unix() > fsStartDate.unix()
  ) {
    overlapMinutes = (fsEndDate.unix() - ssStartDate.unix()) / 60;
  }

  res.json({
    overlapMinutes,
    maximumOverlapThreshold,
    exceedsOverlapThreshold: overlapMinutes > maximumOverlapThreshold,
  });
});

app.get("/execute-q4-query", async (req, res) => {
  const data = await database.raw(
    "select j.job_id, j.facility_id, j.nurse_type_needed, j.total_number_nurses_needed, count(*) as hired_nurses, j.total_number_nurses_needed - count(*) as nurses_needed" +
      " from jobs as j" +
      " inner join nurse_hired_jobs as n on j.job_id = n.job_id" +
      " group by j.job_id" +
      " order by j.facility_id, j.nurse_type_needed;"
  );
  console.log("Q4 Query Response: ", data.rows);
  res.json({ response: data.rows });
});

app.get("/execute-q5-query", async (req, res) => {
  const jobs = await database.raw(
    "select j.job_id, j.nurse_type_needed, j.total_number_nurses_needed - count(*) as nurses_needed" +
      " from jobs as j" +
      " inner join nurse_hired_jobs as n on j.job_id = n.job_id" +
      " group by j.job_id"
  );
  const nurses = await database.raw(
    "select n.nurse_id, n.nurse_name, n.nurse_type, nh.job_id" +
      " from nurses as n" +
      " inner join nurse_hired_jobs as nh on nh.nurse_id = n.nurse_id" +
      " order by n.nurse_id;"
  );

  const data = nurses.rows.map((nurse: any) => ({
    ...nurse,
    total_number_of_jobs: jobs.rows.reduce(
      (previousValue: any, currentJob: any) => {
        if (
          currentJob.nurse_type_needed === nurse.nurse_type &&
          nurse.job_id !== currentJob.job_id
        ) {
          return previousValue + parseInt(currentJob.nurses_needed);
        } else {
          return previousValue;
        }
      },
      0
    ),
  }));
  console.log("Q5 Query Response: ", data);
  res.json({ response: data });
});

app.get("/execute-q6-query/:name", async (req, res) => {
  const nurses = await database.raw(
    "select n.nurse_id, n.nurse_name, n.nurse_type" +
      " from nurses as n" +
      " inner join nurse_hired_jobs as nh on nh.nurse_id = n.nurse_id" +
      " inner join jobs as j on j.job_id = nh.job_id" +
      " where j.facility_id = (" +
      " select j.facility_id from nurses as n" +
      " inner join nurse_hired_jobs as nh on nh.nurse_id = n.nurse_id" +
      " inner join jobs as j on j.job_id = nh.job_id" +
      " where n.nurse_name = ? )",
    [req.params.name]
  );
  console.log("Q6 Query Response: ", nurses.rows);
  res.json({ response: nurses.rows });
});

// API CONNECTION
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
