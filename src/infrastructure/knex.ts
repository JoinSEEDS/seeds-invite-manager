import Knex from 'knex';
import knexConfig from './../database/knexfile';

export const knex = Knex(knexConfig);