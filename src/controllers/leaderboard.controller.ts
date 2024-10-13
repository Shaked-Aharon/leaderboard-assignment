import { Router } from "express";
import { LeaderboardService } from "../services/leaderboard.service";

const router = Router();

router.get('/top/:n', async (req, res) => {
    const n = parseInt(req.params.n);
    try {
        const users = await LeaderboardService.getTopNUsers(n);
        res.json(users);
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

router.get('/user/:id/surrounding', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const users = await LeaderboardService.getUserWithSurroundingUsers(userId);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user position' });
    }
});

export default router;