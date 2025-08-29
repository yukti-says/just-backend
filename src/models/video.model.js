

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({

    videoFile: {
        type: String,
        required: true,

    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        index:true,
    },
    description: {
        type: String,
        trim: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }


},{ timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate); //now u can write aggregate pagination queries

export const Vedio = mongoose.model('Video', videoSchema);