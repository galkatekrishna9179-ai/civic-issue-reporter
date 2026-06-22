const mongoose=require('mongoose');

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Pothole', 'Streetlight', 'Garbage', 'Water Leakage', 'Other'],
        default:'Other'
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum:['Pending','In Progress','Resolved'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    imageUrl: {
  type: String,
  default: null
}
});
module.exports=mongoose.model('Issue',issueSchema);