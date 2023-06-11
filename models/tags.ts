import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true
    }
})

// tags feature