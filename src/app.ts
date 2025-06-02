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
app.use('/universities', universityRoutes); 
app.use('/majors', majorRoutes);
app.use('/semesters', semesterRoutes);
app.use('/courses', courseRoutes);
app.use('/chapters', chapterRoutes);
app.use('/topics', topicRoutes);
app.use('/explanations', explanationRoutes);
app.use('/groke', grokeRoutes);
app.use('/users', userRoutes)
// app.use('/prompts', promptRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on pordddt ${PORT}`); //8080
});
