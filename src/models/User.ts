import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  year: { type: Number, enum: [1,2,3,4], required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  tickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
}, { timestamps: true });

export default models.User || model('User', UserSchema);
