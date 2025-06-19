import { Request, Response } from 'express';
import { findUserByAuth0Id, createUser, insertLikeAndIncrementExplanation, removeLikeAndDecrementExplanation, findUserById, insertLearnedTopic, removeLearnedTopicByUser, getLearnedTopicsByUser } from '../models/user.model';


export async function getLearnedTopics(req: Request, res: Response) {
    try {
        const user_id = parseInt(req.params.id);
        if (!user_id) {
            res.status(400).json({ error: 'auth0_id and email are required' });
        }

        let user = await findUserById(user_id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }

        const learnedTopics = await getLearnedTopicsByUser(user_id);


        res.json(learnedTopics);
    } catch (err) {
        console.error('Error in getLearnedTopics:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
 

export async function likeExplanation(req: Request, res: Response) {
    try {
        const explanation_id = parseInt(req.params.id);
        const { auth0_id, email, name, picture } = req.body;

        console.log(explanation_id, auth0_id, email, name, picture);

        if (!auth0_id || !email) {
            res.status(400).json({ error: 'Unauthorized: auth0_id and email are required' });
        }

        // 1. Get or create the user
        let user = await findUserByAuth0Id(auth0_id);
        console.log('one', user)
        if (user) {
            const liked = await insertLikeAndIncrementExplanation(explanation_id, user.id);
            console.log('two')
            
            if (!liked) {
                removeLikeAndDecrementExplanation(explanation_id, user.id);
                console.log('three')
                res.status(200).json({ message: 'User already liked this explanation' });
            }
        }

        // 2. Insert the like + increment explanation's like count


        res.status(200).json({ message: 'Liked successfully', user_id: user.id });
    } catch (err) {
        console.error('Error in likeExplanation:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function addLearnedTopic(req: Request, res: Response) {
    const topic_id = parseInt(req.params.id);
    const { user_id, chapter_id, course_id } = req.body;
    console.log('addLearnedTopic called', { user_id });
    let added;
    try {

        if (!user_id) {
            res.status(400).json({ error: 'Unauthorized: user_id and email are required' });
        }

        let user = await findUserById(user_id);
        if (user) {
             added = await insertLearnedTopic(topic_id, user.id, chapter_id, course_id);
             console.log('added', added, 'user', user.id, 'topic_id', topic_id, 'chapter_id', chapter_id);

            if (!added) {
                await removeLearnedTopicByUser(topic_id, user.id);
                res.status(200).json({ message: 'Topic already marked as learned', user_id: user.id });
            }
        }

        
            res.status(200).json({ message: added, added});
    } catch (err) {
        console.error('Error in addLearnedTopic:', err);
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


        const learnedTopics = await getLearnedTopicsByUser(user.id);


        res.json({ user: user, learnedTopics: learnedTopics });
    } catch (err) {
        console.error('Error in auth0Login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

