import mongoose from 'mongoose';

const ClientSchema = mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  userId: [String],
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Client = mongoose.model('Client', ClientSchema);
export default Client;