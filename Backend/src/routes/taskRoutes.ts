import express from 'express';
const router = express.Router();

// Importar controladores
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController';

// Rutas para la gestión de tareas
router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
