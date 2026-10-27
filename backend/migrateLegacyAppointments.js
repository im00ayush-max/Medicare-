// ONE-TIME utility: renames legacy appointment fields to the names the current model uses.
//   patient -> patientId,  doctor -> doctorId,  appointmentDate -> appointmentTime
// Only the field names change; values are copied as-is. Nothing is deleted or invented.
// Run manually from the backend folder, then delete this file. It is not imported by server.js.
//
//   node migrateLegacyAppointments.js           -> DRY RUN: shows what would change, writes nothing
//   node migrateLegacyAppointments.js --apply   -> performs the rename
require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");

const RENAMES = { patient: "patientId", doctor: "doctorId", appointmentDate: "appointmentTime" };
const apply = process.argv.includes("--apply");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const appointments = db.collection("appointments");

  const userIds = new Set((await db.collection("users").find({}, { projection: { _id: 1 } }).toArray()).map((d) => String(d._id)));
  const doctorIds = new Set((await db.collection("doctors").find({}, { projection: { _id: 1 } }).toArray()).map((d) => String(d._id)));

  const legacy = await appointments
    .find({ $or: Object.keys(RENAMES).map((field) => ({ [field]: { $exists: true } })) })
    .toArray();

  console.log(`${apply ? "APPLY" : "DRY RUN"}: ${legacy.length} appointment(s) use legacy field names.`);

  let changed = 0;
  for (const doc of legacy) {
    const rename = {};
    for (const [from, to] of Object.entries(RENAMES)) {
      if (doc[from] !== undefined && doc[to] === undefined) rename[from] = to;
    }
    if (Object.keys(rename).length === 0) {
      console.log(`- ${doc._id}: skipped (target fields already present)`);
      continue;
    }

    const patientOk = doc.patient ? userIds.has(String(doc.patient)) : "n/a";
    const doctorOk = doc.doctor ? doctorIds.has(String(doc.doctor)) : "n/a";
    console.log(
      `- ${doc._id}: rename ${Object.keys(rename).join(", ")} | patient exists: ${patientOk} | doctor exists: ${doctorOk}`
    );

    if (apply) {
      const result = await appointments.updateOne({ _id: doc._id }, { $rename: rename });
      if (result.modifiedCount === 1) changed += 1;
    }
  }

  if (apply) console.log(`Done. ${changed} appointment(s) updated.`);
  else console.log("No changes written. Re-run with --apply to perform the rename.");
};

run()
  .catch((error) => {
    console.error("Error:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
