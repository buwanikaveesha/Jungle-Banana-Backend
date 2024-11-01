import axios from "axios";
import express from "express";
import Question from "../models/Question";

const router = express.Router();

router.get('/question', async (req, res) => {
    try {
        
        const response = await axios.get('https://marcconrad.com/uob/banana/api.php?out=json');
        const { question, solution } = response.data;

        const newQuestion = new Question({
            question,
            solution
        });

        await newQuestion.save();
        res.json(newQuestion);


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error"});
    }
});

export default router;
