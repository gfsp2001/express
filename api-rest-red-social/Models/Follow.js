const { Schema, model } = require('mongoose');

const FollowSchema = new Schema({
    user: { type: Schema.ObjectId, ref: "User", required: false },
    followed: { type: Schema.ObjectId, ref: "User", required: false },
    created_at: { type: Date, default: Date.now, required: false }
});

module.exports = model("Follow", FollowSchema, "Follows");