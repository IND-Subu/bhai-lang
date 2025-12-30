import Expression from ".";

import { TokenTypes } from "../../../../constants/bhaiLangSpec";
import { NodeType } from "../../../../constants/constants";
import { ASTNode } from "../../types/nodeTypes";

export default class CallExpression extends Expression {
  getExpression(): ASTNode {
    // This shouldn't be called directly
    throw new Error("Use getCallExpression with callee");
  }

  getCallExpression(callee: ASTNode): ASTNode {
    this._tokenExecutor.eatTokenAndForwardLookahead(
      TokenTypes.OPEN_PARENTHESIS_TYPE
    );

    const args = this._getArgumentList();

    this._tokenExecutor.eatTokenAndForwardLookahead(
      TokenTypes.CLOSED_PARENTHESIS_TYPE
    );

    return {
      type: NodeType.CallExpression,
      callee,
      arguments: args,
    };
  }

  private _getArgumentList(): ASTNode[] {
    const args: ASTNode[] = [];

    // Empty argument list
    if (
      this._tokenExecutor.getLookahead()?.type ===
      TokenTypes.CLOSED_PARENTHESIS_TYPE
    ) {
      return args;
    }

    do {
      args.push(this._getArgument());
    } while (
      this._tokenExecutor.getLookahead()?.type === TokenTypes.COMMA_TYPE &&
      this._tokenExecutor.eatTokenAndForwardLookahead(TokenTypes.COMMA_TYPE)
    );

    return args;
  }

  private _getArgument(): ASTNode {
    return Expression.getExpressionImpl(
      NodeType.AssignmentExpression
    ).getExpression();
  }
}