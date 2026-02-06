import { api } from './client';
import type { Team } from '../types';

export const teamsApi = {
  list: async (): Promise<Team[]> => api.get('/teams'),
};
