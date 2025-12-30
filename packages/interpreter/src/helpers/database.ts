import Database from 'better-sqlite3';

interface DbConnection {
  db: Database.Database;
  connected: boolean;
}

const connections = new Map<string, DbConnection>();

export class DatabaseHelper {
  
  static connect(filename: string): string {
    try {
      // Validate filename
      if (!filename || typeof filename !== 'string') {
        return `Invalid filename: ${filename}`;
      }

      if (connections.has(filename)) {
        return `Already connected: ${filename}`;
      }

      console.log(`Attempting to connect to: ${filename}`);
      const db = new Database(filename);
      connections.set(filename, { db, connected: true });

      return `Connected successfully: ${filename}`;
    } catch (error: any) {
      console.error('Connection error:', error);
      return `Connection failed: ${error.message}`;
    }
  }

  static execute(filename: string, query: string, ...params: any[]): number {
    try {
      // Validate inputs
      if (!filename || typeof filename !== 'string') {
        console.error(`Invalid filename: ${filename}`);
        return -1;
      }
      if (!query || typeof query !== 'string') {
        console.error(`Invalid query: ${query}`);
        return -1;
      }

      const conn = connections.get(filename);
      if (!conn || !conn.connected) {
        console.error('Database not connected bhai!');
        return -1;
      }

      const stmt = conn.db.prepare(query);
      const result = stmt.run(...params);

      return result.changes;
    } catch (error: any) {
      console.error(`Query failed: ${error.message}`);
      return -1;
    }
  }

  static query(filename: string, query: string, ...params: any[]): any[] {
    try {
      // Validate inputs
      if (!filename || typeof filename !== 'string') {
        console.error(`Invalid filename: ${filename}`);
        return [];
      }
      if (!query || typeof query !== 'string') {
        console.error(`Invalid query: ${query}`);
        return [];
      }

      const conn = connections.get(filename);
      if (!conn || !conn.connected) {
        console.error('Database not connected bhai!');
        return [];
      }

      const stmt = conn.db.prepare(query);
      const rows = stmt.all(...params);

      return rows;
    } catch (error: any) {
      console.error(`Query failed: ${error.message}`);
      return [];
    }
  }

  static queryOne(filename: string, query: string, ...params: any[]): any {
    try {
      // Validate inputs
      if (!filename || typeof filename !== 'string') {
        console.error(`Invalid filename: ${filename}`);
        return null;
      }
      if (!query || typeof query !== 'string') {
        console.error(`Invalid query: ${query}`);
        return null;
      }

      const conn = connections.get(filename);
      if (!conn || !conn.connected) {
        console.error('Database not connected bhai!');
        return null;
      }

      const stmt = conn.db.prepare(query);
      const row = stmt.get(...params);

      return row || null;
    } catch (error: any) {
      console.error(`Query failed: ${error.message}`);
      return null;
    }
  }

  static close(filename: string): string {
    try {
      // Validate filename
      if (!filename || typeof filename !== 'string') {
        return `Invalid filename: ${filename}`;
      }

      const conn = connections.get(filename);
      if (!conn || !conn.connected) {
        return 'Already closed';
      }

      conn.db.close();
      connections.delete(filename);

      return `Closed successfully: ${filename}`;
    } catch (error: any) {
      return `Failed to close: ${error.message}`;
    }
  }

  static closeAll(): void {
    for (const [_, conn] of connections) {
      if (conn.connected && conn.db) {
        try {
          conn.db.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
    connections.clear();
  }
}

// Cleanup on exit
process.on('exit', () => {
  DatabaseHelper.closeAll();
});

process.on('SIGINT', () => {
  DatabaseHelper.closeAll();
  process.exit();
});
