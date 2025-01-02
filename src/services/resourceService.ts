import { Pool } from 'pg';
import { Resource, CreateResourceDTO, UpdateResourceDTO, ResourceType } from '../types/resource';
import logger from '../utils/logger';

export class ResourceService {
  constructor(private db: Pool) {}

  async createResource(adminId: number, resource: CreateResourceDTO): Promise<Resource> {
    try {
      const result = await this.db.query(
        `INSERT INTO resources 
         (title, url, type, week_number, cohort_id, created_by, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          resource.title,
          resource.url,
          resource.type,
          resource.week_number || null,
          resource.cohort_id,
          adminId,
          resource.description
        ]
      );

      logger.info('Resource created', {
        resourceId: result.rows[0].id,
        type: resource.type,
        weekNumber: resource.week_number
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create resource:', error);
      throw error;
    }
  }

  async updateResource(resourceId: number, updates: UpdateResourceDTO): Promise<Resource> {
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = Object.values(updates);

      const result = await this.db.query(
        `UPDATE resources 
         SET ${setClause}
         WHERE id = $1
         RETURNING *`,
        [resourceId, ...values]
      );

      if (result.rows.length === 0) {
        throw new Error('Resource not found');
      }

      logger.info('Resource updated', { resourceId });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update resource:', error);
      throw error;
    }
  }

  async deleteResource(resourceId: number): Promise<void> {
    try {
      const result = await this.db.query(
        'DELETE FROM resources WHERE id = $1 RETURNING id',
        [resourceId]
      );

      if (result.rows.length === 0) {
        throw new Error('Resource not found');
      }

      logger.info('Resource deleted', { resourceId });
    } catch (error) {
      logger.error('Failed to delete resource:', error);
      throw error;
    }
  }

  async getResourcesByWeek(cohortId: number, weekNumber: number): Promise<Resource[]> {
    try {
      const result = await this.db.query(
        `SELECT r.*, u.name as created_by_name
         FROM resources r
         JOIN users u ON r.created_by = u.id
         WHERE r.cohort_id = $1 AND r.week_number = $2
         ORDER BY r.type, r.created_at`,
        [cohortId, weekNumber]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get resources by week:', error);
      throw error;
    }
  }

  async getResourcesByType(cohortId: number, type: ResourceType): Promise<Resource[]> {
    try {
      const result = await this.db.query(
        `SELECT r.*, u.name as created_by_name
         FROM resources r
         JOIN users u ON r.created_by = u.id
         WHERE r.cohort_id = $1 AND r.type = $2
         ORDER BY r.week_number NULLS FIRST, r.created_at`,
        [cohortId, type]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get resources by type:', error);
      throw error;
    }
  }

  async getAllCohortResources(cohortId: number): Promise<Resource[]> {
    try {
      const result = await this.db.query(
        `SELECT r.*, u.name as created_by_name
         FROM resources r
         JOIN users u ON r.created_by = u.id
         WHERE r.cohort_id = $1
         ORDER BY r.week_number NULLS FIRST, r.type, r.created_at`,
        [cohortId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get cohort resources:', error);
      throw error;
    }
  }

  async getCommunityResources(cohortId: number): Promise<Resource[]> {
    try {
      const result = await this.db.query(
        `SELECT r.*, u.name as created_by_name
         FROM resources r
         JOIN users u ON r.created_by = u.id
         WHERE r.cohort_id = $1 AND r.type = 'community'`,
        [cohortId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get community resources:', error);
      throw error;
    }
  }
}