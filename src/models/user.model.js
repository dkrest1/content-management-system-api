const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,    
            unique: true,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
        },
        userRole: {
            type: String,
            enum: ['user', 'admin'], 
            default: 'user',
        },
    },
    {
        timestamps: true
    }
)

UserSchema.set('toJSON', {
    transform(_doc, ret) {
        delete ret.password
        delete ret.__v;

    }
})

UserSchema.plugin(mongoosePaginate)

UserSchema.pre('save', async function (next) {
    if(this.isNew) {
        const user = this
        user.password = await hashedPassword(user.password)
    }
    return next()
})

const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel