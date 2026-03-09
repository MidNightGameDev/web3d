import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Store UUID for compatibility or use _id
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    credits: { type: Number, default: 100 },
    ownedProjectIds: [{ type: String }],
    purchases: [{
        id: String,
        projectId: String,
        price: Number,
        at: Number,
        sellerId: String
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
