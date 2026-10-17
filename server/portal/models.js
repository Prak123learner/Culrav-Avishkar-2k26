const mongoose = require("mongoose");
const crypto = require("crypto");
const { Schema } = mongoose;

const codeSchema = new Schema({ _id: String });
const Code = mongoose.model("CaIdCode", codeSchema);
async function nextCaId() {
  const year = new Date().getUTCFullYear();
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix = String(crypto.randomInt(1_000_000)).padStart(6, "0");
    try {
      await Code.create({ _id: suffix });
    } catch (error) {
      if (error.code === 11000) continue;
      throw error;
    }
    const previouslyIssued = new RegExp(`-${suffix}$`);
    if (
      (await mongoose
        .model("FestParticipant")
        .exists({ caId: previouslyIssued })) ||
      (await mongoose.model("FestStaff").exists({ caId: previouslyIssued }))
    ) {
      await Code.deleteOne({ _id: suffix });
      continue;
    }
    return `CA-${year}-${suffix}`;
  }
  throw new Error("Unable to allocate a unique CA ID");
}
const identity = {
  caId: { type: String, unique: true, immutable: true },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
};
const participantSchema = new Schema(
  {
    ...identity,
    firebaseUid: { type: String, required: true, unique: true },
    college: { type: String, default: "MNNIT Allahabad" },
    registrationNumber: String,
    course: { type: String, enum: ["B.Tech", "MBA", "MCA"] },
    year: { type: Number, min: 1, max: 4 },
    branch: String,
    phone: String,
    profileLockedAt: Date,
  },
  { timestamps: true },
);
const staffSchema = new Schema(
  {
    ...identity,
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "coordinator"],
      default: "coordinator",
    },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "FestCategory" }],
    active: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: true },
    temporaryPasswordExpires: Date,
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);
for (const schema of [participantSchema, staffSchema])
  schema.pre("validate", async function () {
    if (this.isNew && !this.caId) this.caId = await nextCaId();
  });
const categorySchema = new Schema(
  {
    festival: { type: String, enum: ["avishkar", "culrav"], required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);
categorySchema.index({ festival: 1, slug: 1 }, { unique: true });
const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "text",
        "paragraph",
        "number",
        "date",
        "select",
        "radio",
        "checkbox",
        "link",
      ],
      required: true,
    },
    required: { type: Boolean, default: false },
    help: String,
    options: [String],
  },
  { _id: false },
);
const formVersionSchema = new Schema(
  {
    version: Number,
    fields: [questionSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
const eventSchema = new Schema(
  {
    fixedKey: { type: String, unique: true, sparse: true, immutable: true },
    configurationRequired: { type: Boolean, default: false },
    formPublished: { type: Boolean, default: false },
    participationLockedAt: { type: Date, default: null },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "FestCategory",
      required: true,
    },
    title: { type: String, required: true },
    mode: {
      type: String,
      enum: ["solo", "team", "solo_or_team"],
      default: "solo",
    },
    minTeamSize: { type: Number, default: 1 },
    maxTeamSize: { type: Number, default: 1 },
    allowedBranches: [String],
    opensAt: Date,
    closesAt: Date,
    responseUpdateDeadline: Date,
    status: {
      type: String,
      enum: ["draft", "published", "closed", "archived", "cancelled"],
      default: "draft",
    },
    allowEdits: { type: Boolean, default: false },
    formVersions: [formVersionSchema],
    currentVersion: { type: Number, default: 1 },
    revision: { type: Number, default: 0 },
  },
  { timestamps: true },
);
eventSchema.index({ categoryId: 1, title: 1, status: 1 });
eventSchema.index({ status: 1, title: 1 });
const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    leaderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "FestParticipant",
    },
    memberIds: [{ type: Schema.Types.ObjectId, ref: "FestParticipant" }],
    pendingIds: [{ type: Schema.Types.ObjectId, ref: "FestParticipant" }],
    membershipLockedAt: { type: Date, default: null },
    revision: { type: Number, default: 0 },
  },
  { timestamps: true },
);
teamSchema.index({ memberIds: 1 });
teamSchema.index({ pendingIds: 1 });
const registrationSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "FestSubevent",
      required: true,
    },
    categoryId: { type: Schema.Types.ObjectId, required: true },
    submittedBy: { type: Schema.Types.ObjectId, required: true },
    leaderCaId: String,
    teamId: Schema.Types.ObjectId,
    memberIds: [{ type: Schema.Types.ObjectId, required: true }],
    participants: [Schema.Types.Mixed],
    searchKeys: { type: [String], default: [] },
    teamName: String,
    formVersion: Number,
    fields: [questionSchema],
    answers: { type: Schema.Types.Mixed, default: {} },
    answerHistory: {
      type: [
        new Schema(
          {
            formVersion: Number,
            fields: [questionSchema],
            answers: Schema.Types.Mixed,
            status: String,
            reviewReason: String,
            savedAt: Date,
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    // Legacy review fields are retained so existing documents remain readable.
    // Current submissions are final on receipt; no staff review writes occur.
    formUpdateReviewPending: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["submitted", "access_required", "accepted", "rejected"],
      default: "submitted",
    },
    reviewReason: String,
    revision: { type: Number, default: 0 },
  },
  { timestamps: true },
);
registrationSchema.index({ eventId: 1, memberIds: 1 }, { unique: true });
registrationSchema.index({ memberIds: 1, createdAt: -1, _id: -1 });
registrationSchema.index({ eventId: 1, createdAt: -1, _id: -1 });
registrationSchema.index({ eventId: 1, formVersion: 1 });
registrationSchema.index({ categoryId: 1, createdAt: -1, _id: -1 });
registrationSchema.index({ teamId: 1 });
registrationSchema.index({ eventId: 1, searchKeys: 1 });
registrationSchema.index({ categoryId: 1, searchKeys: 1 });
const auditSchema = new Schema(
  {
    staffId: { type: Schema.Types.ObjectId, ref: "FestStaff" },
    action: String,
    targetId: String,
  },
  { timestamps: true },
);
auditSchema.index({ createdAt: -1, _id: -1 });
auditSchema.index({ staffId: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
const sessionSchema = new Schema({
  _id: { type: String, required: true },
  actorId: { type: Schema.Types.ObjectId, required: true },
  kind: { type: String, enum: ["participant", "staff"], required: true },
  expiresAt: { type: Date, required: true },
});
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = {
  Participant: mongoose.model("FestParticipant", participantSchema),
  Staff: mongoose.model("FestStaff", staffSchema),
  Category: mongoose.model("FestCategory", categorySchema),
  Subevent: mongoose.model("FestSubevent", eventSchema),
  FestTeam: mongoose.model("FestTeam", teamSchema),
  Registration: mongoose.model("FestRegistration", registrationSchema),
  Audit: mongoose.model("FestAudit", auditSchema),
  Session: mongoose.model("FestSession", sessionSchema),
  nextCaId,
};
