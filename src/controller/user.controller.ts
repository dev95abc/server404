import { Request, Response } from 'express';
import { findUserByAuth0Id, createUser } from '../models/user.model';

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