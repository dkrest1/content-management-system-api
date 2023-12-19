const { boolean } = require("joi");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");


const CategoriesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: null
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

CategoriesSchema.pre('save', function () {
    this.name = this.name.toLowerCase();
});

CategoriesSchema.plugin(mongoosePaginate)

CategoriesSchema.set('toJSON', {
    transform(_doc, ret) {
        delete ret.__v;
    }
})

const CategoryModel = mongoose.model("categories", CategoriesSchema)

module.exports = CategoryModel