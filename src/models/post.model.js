import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const PostSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "users",
            required: true
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: "categories",
            required: true
        },
        title: {
            type: String,
            trim: true,
            required: true
        },
        content: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)

PostSchema.plugin(mongoosePaginate)

PostSchema.set('toJSON', {
    transform(_doc, ret) {
        delete ret.__v;
    }
})

const PostModel = mongoose.model("posts", PostSchema)

export default PostModel