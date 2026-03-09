import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, required: true }
});

const commentSchema = new mongoose.Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, required: true },
    replies: [replySchema]
});

const sceneSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, default: 'draft' },
    objectCount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    tags: [{ type: String }],
    createdAt: { type: String, required: true },
    updatedAt: { type: String },
    data: { type: Object } // Optional: to store actual 3D scene data (nodes, meshes if migrated)
});

const projectSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: { type: String, default: 'draft' }, // 'draft' or 'published'
    objectCount: { type: Number, default: 0 },
    price: { type: Number, default: 10 },
    forSale: { type: Boolean, default: false },
    ownerId: { type: String, required: true },
    ownerName: { type: String, required: true },
    createdAt: { type: String, required: true },
    publishedAt: { type: String },
    updatedAt: { type: String },

    // Social features
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    comments: [commentSchema],

    // Embedded scenes
    scenes: [sceneSchema]
});

export default mongoose.model('Project', projectSchema);
