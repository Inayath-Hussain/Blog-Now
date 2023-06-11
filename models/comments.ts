import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
})

const commentSchema = new mongoose.Schema({
    comments: {
        type: [dataSchema]
    }
})

// const Comments = mongoose.models.comment || mongoose.model('comment', commentSchema)

// export default Comments;

// comments feature