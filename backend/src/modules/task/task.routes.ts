import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  submitActual,
  getWeeklySummary,
  getDailyTruthScore,
} from './task.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncWrapper } from '../../utils/asyncWrapper';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  submitActualSchema,
  weeklySummaryQuerySchema,
  dailyTruthScoreQuerySchema,
} from './task.validation';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks (paginated, filterable)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, updatedAt, title, priority], default: createdAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Tasks retrieved
 */
router.get('/', validate(taskQuerySchema, 'query'), asyncWrapper(getTasks));

/**
 * @swagger
 * /api/v1/tasks/weekly-summary:
 *   get:
 *     summary: Get planned vs actual hours summary for a week
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weekStart
 *         required: true
 *         schema: { type: string, format: date }
 *         description: ISO date for the start of the week
 *     responses:
 *       200:
 *         description: Weekly summary with truth score
 *       422:
 *         description: Validation error
 */
router.get(
  '/weekly-summary',
  validate(weeklySummaryQuerySchema, 'query'),
  asyncWrapper(getWeeklySummary)
);

/**
 * @swagger
 * /api/v1/tasks/daily-truth-score:
 *   get:
 *     summary: Get planned vs actual hours and truth score for a single day
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Daily truth score
 *       422:
 *         description: Validation error
 */
router.get(
  '/daily-truth-score',
  validate(dailyTruthScoreQuerySchema, 'query'),
  asyncWrapper(getDailyTruthScore)
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task found
 *       403:
 *         description: Forbidden (not owner)
 *       404:
 *         description: Task not found
 */
router.get('/:id', asyncWrapper(getTaskById));

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *           example:
 *             title: "Build REST API"
 *             description: "Implement authentication and task endpoints"
 *             status: "TODO"
 *             priority: "HIGH"
 *     responses:
 *       201:
 *         description: Task created
 *       422:
 *         description: Validation error
 */
router.post('/', validate(createTaskSchema), asyncWrapper(createTask));

/**
 * @swagger
 * /api/v1/tasks/{id}/actual:
 *   post:
 *     summary: Submit a daily review for a task (what actually happened)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [completed]
 *             properties:
 *               actualStart: { type: string, format: date-time }
 *               actualEnd: { type: string, format: date-time }
 *               completed: { type: boolean }
 *               energy: { type: string, enum: [FOCUS, CREATIVE, ADMIN, MEETING, CHORE] }
 *     responses:
 *       200:
 *         description: Daily review submitted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       422:
 *         description: Validation error
 */
router.post('/:id/actual', validate(submitActualSchema), asyncWrapper(submitActual));

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.put('/:id', validate(updateTaskSchema), asyncWrapper(updateTask));

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Task deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.delete('/:id', asyncWrapper(deleteTask));

export default router;