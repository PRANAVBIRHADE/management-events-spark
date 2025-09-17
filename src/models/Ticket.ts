import mongoose, { Schema, models, model } from 'mongoose';

const TicketSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  qrCode: { type: String },
  paymentScreenshot: { type: String },
}, { timestamps: true });

export default models.Ticket || model('Ticket', TicketSchema);
