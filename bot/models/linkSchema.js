import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    users: {
        type: [String], 
        default: []
    }
});

const Link = mongoose.model('Link', linkSchema);
export default Link;
