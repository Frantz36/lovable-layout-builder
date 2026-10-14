import { parse } from 'acorn';

// Interpret the supplied prototype's limited event expressions, without eval or global callbacks.
type Expression = { type: string; [key: string]: unknown };
const cache = new Map<string, Expression>();
const node = (value: unknown) => value as Expression;
export function runViewAction(source: string, actions: Record<string, unknown>, target: EventTarget | null, event: unknown) {
  let program = cache.get(source);
  if (!program) { program = parse(source, { ecmaVersion: 'latest' }) as unknown as Expression; cache.set(source, program); }
  const scope: Record<string, unknown> = { ...actions, document, event };
  function reference(expression: Expression): { object: Record<string, unknown>; key: string } {
    if (expression.type === 'Identifier') return { object: scope, key: String(expression['name']) };
    if (expression.type === 'MemberExpression') return { object: evaluate(node(expression['object'])) as Record<string, unknown>, key: expression['computed'] ? String(evaluate(node(expression['property']))) : String(node(expression['property'])['name']) };
    throw new Error('Unsupported action reference');
  }
  function evaluate(expression: Expression): unknown {
    switch (expression.type) {
      case 'Program': case 'BlockStatement': { let result: unknown; for (const statement of expression['body'] as Expression[]) result = evaluate(statement); return result; }
      case 'ExpressionStatement': return evaluate(node(expression['expression']));
      case 'Literal': return expression['value'];
      case 'Identifier': return scope[String(expression['name'])];
      case 'ThisExpression': return target;
      case 'MemberExpression': { const ref = reference(expression); return ref.object[ref.key]; }
      case 'CallExpression': {
        const callee = node(expression['callee']);
        const ref = reference(callee);
        const fn = ref.object[ref.key];
        if (typeof fn !== 'function') throw new Error(`Unknown prototype action: ${ref.key}`);
        return fn.apply(callee.type === 'MemberExpression' ? ref.object : undefined, (expression['arguments'] as Expression[]).map(evaluate));
      }
      case 'AssignmentExpression': { const ref = reference(node(expression['left'])); const value = evaluate(node(expression['right'])); ref.object[ref.key] = value; return value; }
      case 'IfStatement': return evaluate(node(evaluate(node(expression['test'])) ? expression['consequent'] : expression['alternate']));
      case 'BinaryExpression': { const left = evaluate(node(expression['left'])); const right = evaluate(node(expression['right'])); if (expression['operator'] === '===') return left === right; if (expression['operator'] === '!==') return left !== right; return undefined; }
      default: throw new Error(`Unsupported prototype expression: ${expression.type}`);
    }
  }
  return evaluate(program);
}