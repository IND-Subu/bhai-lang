// ============================================
// FINAL WORKING VERSION
// File: packages/interpreter/src/components/visitor/callExpression.ts
// ============================================

import Visitor from ".";
import { ASTNode } from "bhai-lang-parser";  // Remove NodeType - not needed

import InvalidStateException from "../../exceptions/invalidStateException";
import RuntimeException from "../../exceptions/runtimeException";
import { DatabaseHelper } from "../../helpers/database";
import InterpreterModule from "../../module/interpreterModule";

const DATABASE_FUNCTIONS = [
  'database_connect',
  'database_execute',
  'database_query',
  'database_query_ek',
  'database_close',
];

export default class CallExpression implements Visitor {
  visitNode(node: ASTNode) {
    if (!node.callee || !node.arguments) {
      throw new InvalidStateException(
        `Invalid call expression: missing callee or arguments`
      );
    }

    // Get function name
    const functionName = node.callee.name;
    if (!functionName) {
      throw new RuntimeException(
        `Function name not found bhai`
      );
    }

    // Evaluate all arguments - THIS IS THE KEY FIX
    const args = node.arguments.map((arg: ASTNode) => {
      // For string and numeric literals, access value directly from AST
      if (arg.type === 'StringLiteral' || arg.type === 'NumericLiteral') {
        console.log(`Direct literal access: ${arg.type} = ${arg.value}`);
        return arg.value;
      }
      
      // For other expressions (variables, calculations, etc.), evaluate them
      const value = InterpreterModule.getVisitor(arg.type).visitNode(arg);
      console.log(`Evaluated ${arg.type} = ${value}`);
      
      // Handle bhailang special values
      if (value === "nalla") return null;
      if (value === "sahi") return true;
      if (value === "galat") return false;
      
      return value;
    });

    // Debug output
    console.log(`\n=== Calling ${functionName} ===`);
    console.log('Arguments:', args);
    console.log('Arg types:', args.map(a => typeof a));
    console.log('========================\n');

    // Check if it's a database function
    if (DATABASE_FUNCTIONS.includes(functionName)) {
      return this._handleDatabaseFunction(functionName, args);
    }

    throw new RuntimeException(
      `Unknown function bhai: ${functionName}`
    );
  }

  private _handleDatabaseFunction(functionName: string, args: any[]): any {
    try {
      switch (functionName) {
        case 'database_connect':
          if (args.length !== 1) {
            throw new RuntimeException(
              `database_connect needs 1 argument bhai (got ${args.length})`
            );
          }
          if (typeof args[0] !== 'string') {
            throw new RuntimeException(
              `database_connect: filename must be string bhai (got ${typeof args[0]}: ${JSON.stringify(args[0])})`
            );
          }
          return DatabaseHelper.connect(args[0]);

        case 'database_execute':
          if (args.length < 2) {
            throw new RuntimeException(
              `database_execute needs at least 2 arguments bhai (got ${args.length})`
            );
          }
          if (typeof args[0] !== 'string' || typeof args[1] !== 'string') {
            throw new RuntimeException(
              `database_execute: filename and query must be strings bhai (got ${typeof args[0]}, ${typeof args[1]})`
            );
          }
          return DatabaseHelper.execute(args[0], args[1], ...args.slice(2));

        case 'database_query':
          if (args.length < 2) {
            throw new RuntimeException(
              `database_query needs at least 2 arguments bhai (got ${args.length})`
            );
          }
          if (typeof args[0] !== 'string' || typeof args[1] !== 'string') {
            throw new RuntimeException(
              `database_query: filename and query must be strings bhai (got ${typeof args[0]}, ${typeof args[1]})`
            );
          }
          return DatabaseHelper.query(args[0], args[1], ...args.slice(2));

        case 'database_query_ek':
          if (args.length < 2) {
            throw new RuntimeException(
              `database_query_ek needs at least 2 arguments bhai (got ${args.length})`
            );
          }
          if (typeof args[0] !== 'string' || typeof args[1] !== 'string') {
            throw new RuntimeException(
              `database_query_ek: filename and query must be strings bhai (got ${typeof args[0]}, ${typeof args[1]})`
            );
          }
          return DatabaseHelper.queryOne(args[0], args[1], ...args.slice(2));

        case 'database_close':
          if (args.length !== 1) {
            throw new RuntimeException(
              `database_close needs 1 argument bhai (got ${args.length})`
            );
          }
          if (typeof args[0] !== 'string') {
            throw new RuntimeException(
              `database_close: filename must be string bhai (got ${typeof args[0]}: ${JSON.stringify(args[0])})`
            );
          }
          return DatabaseHelper.close(args[0]);

        default:
          throw new RuntimeException(
            `Unknown database function bhai: ${functionName}`
          );
      }
    } catch (error: any) {
      if (error instanceof RuntimeException) {
        throw error;
      }
      throw new RuntimeException(`Database error bhai: ${error.message}`);
    }
  }
}