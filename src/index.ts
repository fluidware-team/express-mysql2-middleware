/*
 * Copyright Fluidware srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Request, Response, NextFunction } from 'express';
import { DbClient } from '@fluidware-it/mysql2-client';
import { ensureError, getAsyncLocalStorageProp, getLogger, setAsyncLocalStorageProp } from '@fluidware-it/saddlebag';
import { ConnectionOptions } from 'mysql2';

export const StoreSymbols = {
  DB_CLIENT: Symbol('fw.mysql-client'),
  DB_KEEP_CONNECTION: Symbol('fw.mysql-keep-connection')
};

export interface MiddlewareOptions {
  httpMethods?: string[];
  connectionOptions?: ConnectionOptions | string;
  exitOnConnectionFailure: boolean;
}

export const defaultMiddlewareOptions: MiddlewareOptions = {
  httpMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  connectionOptions: '',
  exitOnConnectionFailure: false
};

export function getMysql2Middleware(middlewareOptions?: MiddlewareOptions) {
  const _middlewareOptions = Object.assign({}, defaultMiddlewareOptions, middlewareOptions || {});
  return async function mysqlMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (_middlewareOptions.httpMethods?.includes(req.method)) {
      try {
        const client = new DbClient(_middlewareOptions.connectionOptions);
        await client.open();
        setAsyncLocalStorageProp<DbClient>(StoreSymbols.DB_CLIENT, client);
        setAsyncLocalStorageProp<boolean>(StoreSymbols.DB_KEEP_CONNECTION, false);
        res.on('close', () => {
          if (!getAsyncLocalStorageProp<boolean>(StoreSymbols.DB_KEEP_CONNECTION)) {
            client.close().catch(err => {
              const e = ensureError(err);
              getLogger().error({ error_code: err.code, error_message: e.message }, 'Failed to close connection');
            });
          }
        });
      } catch (err) {
        res.status(500).json({ status: 500, reason: 'A problem occurred, please retry' });
        if (_middlewareOptions.exitOnConnectionFailure) {
          if (err.code === 'ECONNREFUSED') {
            getLogger().error('Failed to establish db connection. Network error. Exiting');
            process.kill(process.pid, 'SIGTERM');
            return;
          }
          if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            getLogger().error('Failed to open db connection. Credentials error. Exiting');
            process.kill(process.pid, 'SIGTERM');
            return;
          }
          if (err.code === 'ER_CON_COUNT_ERROR') {
            getLogger().error('Failed to open db connection. Too many connections. Exiting');
            process.kill(process.pid, 'SIGTERM');
            return;
          }
        }
        const e = ensureError(err);
        getLogger().error({ error_code: err.code, error_message: e.message }, 'Failed to establish db connection');
        return;
      }
    }
    setImmediate(next);
  };
}
