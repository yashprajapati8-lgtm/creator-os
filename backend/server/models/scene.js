import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema({

    name: String,

    url: String,

    publicId: String,

    type: String

});

const BlockSchema = new mongoose.Schema({

    type:String,

    content:String

});

const SceneSchema = new mongoose.Schema({

    title:String,

    blocks:[BlockSchema],

    assets:[AssetSchema],

    researchNote: {
    type: String,
    default: ""
},

owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
}

});


export default mongoose.model("Scene",SceneSchema);