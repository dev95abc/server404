import { Request, Response } from 'express';
import { findUserByAuth0Id, createUser, insertLikeAndIncrementExplanation } from '../models/user.model';



export async function likeExplanation(req: Request, res: Response) {
    try {
        const explanation_id = parseInt(req.params.id);
        const { auth0_id, email, name, picture } = req.body;

        if (!auth0_id || !email) {
            return res.status(400).json({ error: 'Unauthorized: auth0_id and email are required' });
        }

        // 1. Get or create the user
        let user = await findUserByAuth0Id(auth0_id);
        if (user) {
            const liked = await insertLikeAndIncrementExplanation(explanation_id, user.id);

            if (!liked) {
                return res.status(200).json({ message: 'User already liked this explanation' });
            }
        }

        // 2. Insert the like + increment explanation's like count


        res.status(200).json({ message: 'Liked successfully', user_id: user.id });
    } catch (err) {
        console.error('Error in likeExplanation:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function auth0Login(req: Request, res: Response) {
    try {
        const { auth0_id, email, name } = req.body;
        if (!auth0_id || !email) {
            res.status(400).json({ error: 'auth0_id and email are required' });
        }

        let user = await findUserByAuth0Id(auth0_id);

        if (!user) {
            user = await createUser(auth0_id, email, name || '');
        }

        res.json(user);
    } catch (err) {
        console.error('Error in auth0Login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

