import mongoose, { Schema, models, model } from 'mongoose';

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  price: { type: Number, required: true },
  freeYears: [{ type: Number, enum: [1,2,3,4] }],
  poster: { type: String },
  registrations: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
}, { timestamps: true });

export default models.Event || model('Event', EventSchema);
