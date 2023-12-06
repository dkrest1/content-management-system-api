import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const CategoriesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

CategoriesSchema.plugin(mongoosePaginate)

CategoriesSchema.set('toJSON', {
    transform(_doc, ret) {
        delete ret.__v;
    }
})

const CategoryModel = mongoose.model("categories", CategoriesSchema)

export default CategoryModel