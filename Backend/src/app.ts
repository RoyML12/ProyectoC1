import express, { Request, Response } from 'express';
import http from 'http';
import WebSocket from 'ws';
import mongoose from 'mongoose';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// Conexión a MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tableroTareas';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Modelo de Tarea
interface Task {
  description: String;
  status: 'ToDo' | 'InProgress' | 'Done';
}

const taskSchema = new mongoose.Schema<Task>({
  description: { type: String, required: true },
  status: { type: String, required: true, enum: ['ToDo', 'InProgress', 'Done'] },
});

const TaskModel = mongoose.model('Task', taskSchema);

// WebSocket para manejar conexiones en tiempo real
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// Almacenar las respuestas pendientes de long polling
const longPollingResponses: Response[] = [];

// Función para notificar a todos los clientes de long polling
function notifyLongPollingClients(task: any) {
  longPollingResponses.forEach(res => {
    res.json(task);
  });
  longPollingResponses.length = 0; // Limpiar después de enviar las actualizaciones
}

app.get('/long-polling', (req, res) => {
  longPollingResponses.push(res);
  req.on('close', () => {
    const index = longPollingResponses.indexOf(res);
    if (index !== -1) {
      longPollingResponses.splice(index, 1);
    }
  });
});

// Rutas del API
app.get('/tasks', async (req, res) => {
  const tasks = await TaskModel.find();
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const newTask = new TaskModel(req.body);
  await newTask.save();
  notifyLongPollingClients(newTask); // Notificar a los clientes de long polling
  res.status(201).json(newTask);
});

app.put('/tasks/:id', async (req, res) => {
  const updatedTask = await TaskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedTask);
});

app.delete('/tasks/:id', async (req, res) => {
  await TaskModel.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
