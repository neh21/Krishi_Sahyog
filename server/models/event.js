const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    happenedAt: {
        type: Date,
        default: Date.now
    },
    link: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('event',EventSchema);