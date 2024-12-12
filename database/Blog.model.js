const { Schema, default: mongoose } = require("mongoose");

const BlogSchema = new Schema({
    title : {type: String, required: true, unique: true},
    content: { type: String, required: true },
    author: { type: String, required: true},
    user: {type: String, required: true},
    isPrivate: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.__v;
            delete ret._id;
        }
    }
});

module.exports.Blog = mongoose.model('blog', BlogSchema);