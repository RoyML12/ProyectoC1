import { Request, Response } from 'express';

// Controlador para crear una tarea
export const createTask = (req: Request, res: Response) => {
  // Lógica para crear una tarea
  res.status(201).send('Task created');
};

// Controlador para obtener tareas
export const getTasks = (req: Request, res: Response) => {
  // Lógica para obtener tareas
  res.status(200).send('Tasks retrieved');
};

// Controlador para actualizar una tarea
export const updateTask = (req: Request, res: Response) => {
  // Lógica para actualizar una tarea
  res.status(200).send('Task updated');
};

// Controlador para eliminar una tarea
export const deleteTask = (req: Request, res: Response) => {
  // Lógica para eliminar una tarea
  res.status(200).send('Task deleted');
};
