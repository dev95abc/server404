import express from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv'; 
import universityRoutes from './routes/university.routes'; 
import majorRoutes from './routes/major.routes';
import semesterRoutes from './routes/semester.routes';
import courseRoutes from './routes/course.routes';
import chapterRoutes from './routes/chapter.routes';
import topicRoutes from './routes/topic.routes';
import explanationRoutes from './routes/explanation.routes';
import grokeRoutes from './routes/grok.routes'
import userRoutes from './routes/user.routes';
// import promptRoutes from './routes/prompt.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
 

// Attach the university routes directly to the app
app.use('/api/universities', universityRoutes); 
app.use('/api/majors', majorRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/explanations', explanationRoutes);
app.use('/groke', grokeRoutes);
app.use('/api/users', userRoutes)
// app.use('/prompts', promptRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on pordddt ${PORT}`); //8080
});
