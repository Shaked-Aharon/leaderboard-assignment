import { Router } from "express";
import { UsersService } from "../services/users.service";

const router = Router();

router.post('', async (req, res) => {
    const { name, imageUrl, initialScore } = req.body;
    try {
        const userId = await UsersService.addUser(name, imageUrl, initialScore);
        res.status(201).json({ userId });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update a user's score
router.put('/:id/score', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { score } = req.body;
    try {
        await UsersService.updateUserScore(userId, score);
        res.status(200).send('Score updated successfully');
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;