import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    question: String,
    solution: Number
},{timestamps:true});

export default mongoose.model('question', QuestionSchema);

