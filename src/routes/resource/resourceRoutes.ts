import express, { Request, Response } from 'express';
import { ResourceService } from '../../services/resourceService';
import pool from '../../config/database';
import logger from '../../utils/logger';
import { CreateResourceDTO, UpdateResourceDTO, ResourceType } from '../../types/resource';

const router = express.Router();
const resourceService = new ResourceService(pool);

// Create a new resource (Admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    // TODO: Get adminId from auth token
    const adminId = 1; // Temporary hardcoded value
    const resource = await resourceService.createResource(adminId, req.body as CreateResourceDTO);
    
    res.status(201).json(resource);
  } catch (error) {
    logger.error('Error creating resource:', error);
    res.status(400).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Update a resource (Admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const resourceId = parseInt(req.params.id);
    const resource = await resourceService.updateResource(resourceId, req.body as UpdateResourceDTO);
    
    res.json(resource);
  } catch (error) {
    logger.error('Error updating resource:', error);
    res.status(400).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Delete a resource (Admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const resourceId = parseInt(req.params.id);
    await resourceService.deleteResource(resourceId);
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting resource:', error);
    res.status(400).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get resources by week
router.get('/week/:weekNumber', async (req: Request, res: Response) => {
  try {
    // TODO: Get cohortId from auth token
    const cohortId = 1; // Temporary hardcoded value
    const weekNumber = parseInt(req.params.weekNumber);
    const resources = await resourceService.getResourcesByWeek(cohortId, weekNumber);
    
    res.json(resources);
  } catch (error) {
    logger.error('Error fetching resources by week:', error);
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get resources by type
router.get('/type/:type', async (req: Request, res: Response) => {
  try {
    const cohortId = 1; // Temporary hardcoded value
    const type = req.params.type as ResourceType;
    const resources = await resourceService.getResourcesByType(cohortId, type);
    
    res.json(resources);
  } catch (error) {
    logger.error('Error fetching resources by type:', error);
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get all cohort resources
router.get('/cohort', async (req: Request, res: Response) => {
  try {
    const cohortId = 1; // Temporary hardcoded value
    const resources = await resourceService.getAllCohortResources(cohortId);
    
    res.json(resources);
  } catch (error) {
    logger.error('Error fetching cohort resources:', error);
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get community resources
router.get('/community', async (req: Request, res: Response) => {
  try {
    const cohortId = 1; // Temporary hardcoded value
    const resources = await resourceService.getCommunityResources(cohortId);
    
    res.json(resources);
  } catch (error) {
    logger.error('Error fetching community resources:', error);
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

export default router;