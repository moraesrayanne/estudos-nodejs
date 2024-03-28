import { Database } from './database.js'
import { randomUUID } from 'node:crypto';
import { buildRoutePath } from './utils/build-route-path.js';
import { DateTime } from 'luxon';

const database = new Database()

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', {
        title: search,
        description: search
      })

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: DateTime.now(),
        updated_at: DateTime.now()
      };

      database.insert("tasks", task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
        const { id } = req.params

        const currentTask = database.getTaskById('tasks', id);
        
        if (!currentTask) {
          return res.writeHead(400).end('invalid_id')
        }

        database.delete('tasks', id)
        return res.writeHead(204).end()
    }
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
        const { id } = req.params
        const { title, description } = req.body

        const taskToUpdate = {}

        if (title !== undefined) {
          taskToUpdate.title = title
        }

        if (description !== undefined) {
          taskToUpdate.description = description
        }

        const currentTask = database.getTaskById('tasks', id);
        
        if (!currentTask) {
          return res.writeHead(400).end('invalid_id')
        }

        if (Object.keys(taskToUpdate).length === 0) {
          return res.writeHead(400).end("Nenhum campo para atualização foi fornecido.");
        }

        database.update('tasks', id, {
            ...currentTask,
            ...taskToUpdate,
            updated_at: DateTime.now()
        })

        return res.writeHead(204).end()
    }
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end()
      }

      const isCompleted = !!task.completed_at
      const completed_at = isCompleted ? null : new Date()

      database.update('tasks', id, { completed_at })

      return res.writeHead(201).end();
    }
  }
];