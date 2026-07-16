import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import * as ts from "typescript";
import { describe, expect, it } from "vitest";

type AuthSessionInsertWriter = {
  owner: string;
  path: string;
};

const RAW_AUTH_SESSION_INSERT_PATTERN =
  /\binsert\s+into\s+(?:(?:"?[a-z_][a-z0-9_]*"?)\s*\.\s*)?"?auth_session"?\b/iu;

function listTypeScriptSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return listTypeScriptSourceFiles(path);
    }

    return entry.isFile() && /\.tsx?$/u.test(entry.name) ? [path] : [];
  });
}

function parseSource(path: string): ts.SourceFile {
  return ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function collectNodes<TNode extends ts.Node>(
  root: ts.Node,
  predicate: (node: ts.Node) => node is TNode,
): TNode[] {
  const nodes: TNode[] = [];

  function visit(node: ts.Node): void {
    if (predicate(node)) {
      nodes.push(node);
    }

    node.forEachChild(visit);
  }

  visit(root);
  return nodes;
}

function getTableAliases(
  source: ts.SourceFile,
  exportedName: string,
): Set<string> {
  const aliases = new Set([exportedName]);

  collectNodes(source, (node): node is ts.ImportSpecifier =>
    ts.isImportSpecifier(node),
  ).forEach((specifier) => {
    const importedName = specifier.propertyName?.text ?? specifier.name.text;

    if (importedName === exportedName) {
      aliases.add(specifier.name.text);
    }
  });

  collectNodes(source, (node): node is ts.BindingElement =>
    ts.isBindingElement(node),
  ).forEach((binding) => {
    const propertyName = getBindingPropertyName(binding);

    if (propertyName === exportedName && ts.isIdentifier(binding.name)) {
      aliases.add(binding.name.text);
    }
  });

  let aliasAdded = true;
  while (aliasAdded) {
    aliasAdded = false;
    collectNodes(
      source,
      (node): node is ts.VariableDeclaration =>
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer !== undefined,
    ).forEach((declaration) => {
      const localName = declaration.name.getText(source);

      if (
        !aliases.has(localName) &&
        isTableReference(declaration.initializer!, aliases, exportedName)
      ) {
        aliases.add(localName);
        aliasAdded = true;
      }
    });
  }

  return aliases;
}

function getBindingPropertyName(binding: ts.BindingElement): string {
  if (
    binding.propertyName !== undefined &&
    (ts.isIdentifier(binding.propertyName) ||
      ts.isStringLiteral(binding.propertyName))
  ) {
    return binding.propertyName.text;
  }

  return ts.isIdentifier(binding.name) ? binding.name.text : "";
}

function isTableReference(
  node: ts.Expression,
  aliases: Set<string>,
  exportedName: string,
): boolean {
  if (ts.isIdentifier(node)) {
    return aliases.has(node.text);
  }

  if (ts.isPropertyAccessExpression(node)) {
    return node.name.text === exportedName;
  }

  return (
    ts.isElementAccessExpression(node) &&
    node.argumentExpression !== undefined &&
    ts.isStringLiteral(node.argumentExpression) &&
    node.argumentExpression.text === exportedName
  );
}

function isPropertyCall(
  node: ts.Node,
  receiver: string,
  method: string,
): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === receiver &&
    node.expression.name.text === method
  );
}

function isTableInsertCall(
  node: ts.Node,
  receiver: string | null,
  aliases: Set<string>,
  exportedName: string,
): node is ts.CallExpression {
  if (
    !ts.isCallExpression(node) ||
    !ts.isPropertyAccessExpression(node.expression) ||
    node.expression.name.text !== "insert" ||
    (receiver !== null &&
      (!ts.isIdentifier(node.expression.expression) ||
        node.expression.expression.text !== receiver))
  ) {
    return false;
  }

  return node.arguments.some((argument) =>
    isTableReference(argument, aliases, exportedName),
  );
}

function isTableDeleteCall(
  node: ts.Node,
  receiver: string,
  aliases: Set<string>,
  exportedName: string,
): node is ts.CallExpression {
  return (
    isPropertyCall(node, receiver, "delete") &&
    node.arguments.some((argument) =>
      isTableReference(argument, aliases, exportedName),
    )
  );
}

function getOwningMethodName(node: ts.Node): string {
  let current: ts.Node | undefined = node.parent;

  while (current !== undefined) {
    if (ts.isMethodDeclaration(current) && ts.isIdentifier(current.name)) {
      return current.name.text;
    }

    current = current.parent;
  }

  return "";
}

function hasNestedFunctionBoundary(node: ts.Node, boundary: ts.Node): boolean {
  let current: ts.Node | undefined = node.parent;

  while (current !== undefined && current !== boundary) {
    if (ts.isFunctionLike(current)) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function getSingleMethod(
  source: ts.SourceFile,
  methodName: string,
): ts.MethodDeclaration {
  const methods = collectNodes(
    source,
    (node): node is ts.MethodDeclaration =>
      ts.isMethodDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === methodName,
  );

  expect(methods).toHaveLength(1);
  expect(methods[0]!.body).toBeDefined();
  return methods[0]!;
}

function getSingleFunction(
  source: ts.SourceFile,
  functionName: string,
): ts.FunctionDeclaration {
  const functions = collectNodes(
    source,
    (node): node is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(node) && node.name?.text === functionName,
  );

  expect(functions).toHaveLength(1);
  expect(functions[0]!.body).toBeDefined();
  return functions[0]!;
}

function getDirectVariable(
  block: ts.Block,
  variableName: string,
): { declaration: ts.VariableDeclaration; statementIndex: number } {
  const matches = block.statements.flatMap((statement, statementIndex) => {
    if (!ts.isVariableStatement(statement)) {
      return [];
    }

    return statement.declarationList.declarations
      .filter(
        (declaration) =>
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === variableName,
      )
      .map((declaration) => ({ declaration, statementIndex }));
  });

  expect(matches).toHaveLength(1);
  return matches[0]!;
}

function getDirectAwaitedCall(
  statement: ts.Statement,
): ts.CallExpression | null {
  return ts.isExpressionStatement(statement) &&
    ts.isAwaitExpression(statement.expression) &&
    ts.isCallExpression(statement.expression.expression)
    ? statement.expression.expression
    : null;
}

function getReturnedTransaction(
  method: ts.MethodDeclaration,
  source: ts.SourceFile,
): { callback: ts.ArrowFunction; call: ts.CallExpression } {
  const block = method.body!;
  const returnedTransactions = block.statements.flatMap((statement) => {
    if (
      !ts.isReturnStatement(statement) ||
      statement.expression === undefined
    ) {
      return [];
    }

    const expression = ts.isAwaitExpression(statement.expression)
      ? statement.expression.expression
      : statement.expression;

    return isPropertyCall(expression, "database", "transaction")
      ? [expression]
      : [];
  });

  expect(
    collectNodes(method, (node): node is ts.CallExpression =>
      isPropertyCall(node, "database", "transaction"),
    ),
  ).toHaveLength(1);
  expect(returnedTransactions).toHaveLength(1);

  const callback = returnedTransactions[0]!.arguments[0];
  expect(callback !== undefined && ts.isArrowFunction(callback)).toBe(true);
  const arrow = callback as ts.ArrowFunction;
  expect(
    arrow.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
    ),
  ).toBe(true);

  expect(arrow.parameters).toHaveLength(1);
  expect(arrow.parameters[0]!.name.getText(source)).toBe("transaction");
  expect(ts.isBlock(arrow.body)).toBe(true);

  return { callback: arrow, call: returnedTransactions[0]! };
}

function getObjectProperty(
  object: ts.ObjectLiteralExpression,
  propertyName: string,
): ts.PropertyAssignment {
  const properties = object.properties.filter(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) &&
        property.name.text === propertyName) ||
        (ts.isStringLiteral(property.name) &&
          property.name.text === propertyName)),
  );

  expect(properties).toHaveLength(1);
  return properties[0]!;
}

function getValuesObject(
  root: ts.Node,
  source: ts.SourceFile,
): ts.ObjectLiteralExpression {
  const valuesCalls = collectNodes(
    root,
    (node): node is ts.CallExpression =>
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "values",
  );

  expect(valuesCalls).toHaveLength(1);
  expect(valuesCalls[0]!.arguments).toHaveLength(1);
  expect(ts.isObjectLiteralExpression(valuesCalls[0]!.arguments[0]!)).toBe(
    true,
  );

  const object = valuesCalls[0]!.arguments[0] as ts.ObjectLiteralExpression;
  expect(object.getSourceFile()).toBe(source);
  return object;
}

function getDirectInsertStatement(
  block: ts.Block,
  aliases: Set<string>,
  exportedName: string,
): { root: ts.CallExpression; statementIndex: number } {
  const matches = block.statements.flatMap((statement, statementIndex) => {
    if (
      !ts.isVariableStatement(statement) ||
      statement.declarationList.declarations.length !== 1
    ) {
      return [];
    }

    const initializer = statement.declarationList.declarations[0]!.initializer;
    if (
      initializer === undefined ||
      !ts.isAwaitExpression(initializer) ||
      !ts.isCallExpression(initializer.expression) ||
      !ts.isPropertyAccessExpression(initializer.expression.expression) ||
      initializer.expression.expression.name.text !== "returning"
    ) {
      return [];
    }

    const insertCalls = collectNodes(
      initializer.expression,
      (node): node is ts.CallExpression =>
        isTableInsertCall(node, "transaction", aliases, exportedName),
    );

    return insertCalls.length === 1
      ? [{ root: initializer.expression, statementIndex }]
      : [];
  });

  expect(matches).toHaveLength(1);
  return matches[0]!;
}

function expectPropertyReference(
  expression: ts.Expression,
  receiver: string,
  property: string,
  source: ts.SourceFile,
): void {
  expect(ts.isPropertyAccessExpression(expression)).toBe(true);
  expect(expression.getText(source)).toBe(`${receiver}.${property}`);
}

describe("P1 single-session concurrency guard", () => {
  it("keeps the complete production auth session insert inventory classified", () => {
    const repositoryRoot = process.cwd();
    const writers: AuthSessionInsertWriter[] = [];
    const rawSqlWriters: string[] = [];

    listTypeScriptSourceFiles(join(repositoryRoot, "src"))
      .filter((path) => !/\.(?:spec|test)\.tsx?$/u.test(path))
      .forEach((path) => {
        const source = parseSource(path);
        const aliases = getTableAliases(source, "authSession");
        const normalizedPath = relative(repositoryRoot, path)
          .split(sep)
          .join("/");

        collectNodes(source, (node): node is ts.CallExpression =>
          isTableInsertCall(node, null, aliases, "authSession"),
        ).forEach((call) => {
          writers.push({
            owner: getOwningMethodName(call),
            path: normalizedPath,
          });
        });

        const rawSqlLiterals = collectNodes(
          source,
          (node): node is ts.StringLiteralLike | ts.TemplateExpression =>
            ts.isStringLiteralLike(node) || ts.isTemplateExpression(node),
        ).filter((literal) =>
          RAW_AUTH_SESSION_INSERT_PATTERN.test(literal.getText(source)),
        );

        if (rawSqlLiterals.length > 0) {
          rawSqlWriters.push(normalizedPath);
        }
      });

    expect(rawSqlWriters).toEqual([]);
    expect(
      writers.sort((left, right) => left.owner.localeCompare(right.owner)),
    ).toEqual([
      {
        owner: "createPersonalRegistration",
        path: "src/server/auth/local-session-runtime.ts",
      },
      {
        owner: "createSession",
        path: "src/server/auth/local-session-runtime.ts",
      },
      {
        owner: "createSingleActiveSession",
        path: "src/server/auth/local-session-runtime.ts",
      },
    ]);
  });

  it("keeps learner replacement on one direct lock-delete-insert path", () => {
    const runtimePath = join(
      process.cwd(),
      "src",
      "server",
      "auth",
      "local-session-runtime.ts",
    );
    const source = parseSource(runtimePath);
    const authSessionAliases = getTableAliases(source, "authSession");
    const method = getSingleMethod(source, "createSingleActiveSession");
    const { callback } = getReturnedTransaction(method, source);
    const block = callback.body as ts.Block;

    const lockStatementIndexes = block.statements.flatMap(
      (statement, statementIndex) => {
        const call = getDirectAwaitedCall(statement);

        return call !== null &&
          ts.isIdentifier(call.expression) &&
          call.expression.text === "assertAccountCanCreateSession"
          ? [statementIndex]
          : [];
      },
    );
    const deleteStatements = block.statements.flatMap(
      (statement, statementIndex) => {
        const root = getDirectAwaitedCall(statement);
        if (
          root === null ||
          !ts.isPropertyAccessExpression(root.expression) ||
          root.expression.name.text !== "where"
        ) {
          return [];
        }

        const deleteCalls = collectNodes(
          root,
          (node): node is ts.CallExpression =>
            isTableDeleteCall(
              node,
              "transaction",
              authSessionAliases,
              "authSession",
            ),
        );

        return deleteCalls.length === 1 ? [{ root, statementIndex }] : [];
      },
    );
    const insertStatement = getDirectInsertStatement(
      block,
      authSessionAliases,
      "authSession",
    );

    expect(lockStatementIndexes).toHaveLength(1);
    expect(deleteStatements).toHaveLength(1);
    const accountLockCall = getDirectAwaitedCall(
      block.statements[lockStatementIndexes[0]!]!,
    );
    expect(accountLockCall).not.toBeNull();
    expect(accountLockCall!.arguments).toHaveLength(3);
    expect(accountLockCall!.arguments[0]!.getText(source)).toBe("transaction");
    expect(accountLockCall!.arguments[1]!.getText(source)).toBe(
      "input.authUserId",
    );
    expect(accountLockCall!.arguments[2]!.getText(source)).toBe("getNow()");
    expect([
      lockStatementIndexes[0],
      deleteStatements[0]!.statementIndex,
      insertStatement.statementIndex,
    ]).toEqual(
      [
        lockStatementIndexes[0],
        deleteStatements[0]!.statementIndex,
        insertStatement.statementIndex,
      ].sort((left, right) => left! - right!),
    );

    expect(
      collectNodes(
        block,
        (node): node is ts.CallExpression =>
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === "assertAccountCanCreateSession",
      ),
    ).toHaveLength(1);
    expect(
      collectNodes(block, (node): node is ts.CallExpression =>
        isTableDeleteCall(
          node,
          "transaction",
          authSessionAliases,
          "authSession",
        ),
      ),
    ).toHaveLength(1);
    expect(
      collectNodes(block, (node): node is ts.CallExpression =>
        isTableInsertCall(
          node,
          "transaction",
          authSessionAliases,
          "authSession",
        ),
      ),
    ).toHaveLength(1);

    const whereCondition = deleteStatements[0]!.root.arguments[0];
    expect(
      whereCondition !== undefined &&
        ts.isCallExpression(whereCondition) &&
        ts.isIdentifier(whereCondition.expression) &&
        whereCondition.expression.text === "eq",
    ).toBe(true);
    const equality = whereCondition as ts.CallExpression;
    expect(equality.arguments).toHaveLength(2);
    expectPropertyReference(
      equality.arguments[0]!,
      "authSession",
      "user_id",
      source,
    );
    expectPropertyReference(
      equality.arguments[1]!,
      "input",
      "authUserId",
      source,
    );

    const insertValues = getValuesObject(insertStatement.root, source);
    expectPropertyReference(
      getObjectProperty(insertValues, "user_id").initializer,
      "input",
      "authUserId",
      source,
    );
  });

  it("keeps the advisory lock as the first awaited database action on authUserId", () => {
    const runtimePath = join(
      process.cwd(),
      "src",
      "server",
      "auth",
      "local-session-runtime.ts",
    );
    const source = parseSource(runtimePath);
    const lockFunction = getSingleFunction(
      source,
      "assertAccountCanCreateSession",
    );
    const body = lockFunction.body!;

    expect(lockFunction.parameters[0]!.name.getText(source)).toBe(
      "transaction",
    );
    expect(lockFunction.parameters[1]!.name.getText(source)).toBe("authUserId");

    const firstCall = getDirectAwaitedCall(body.statements[0]!);
    expect(firstCall).not.toBeNull();
    expect(firstCall!.expression.getText(source)).toBe("transaction.execute");
    expect(firstCall!.arguments).toHaveLength(1);
    expect(ts.isTaggedTemplateExpression(firstCall!.arguments[0]!)).toBe(true);

    const query = firstCall!.arguments[0] as ts.TaggedTemplateExpression;
    expect(query.tag.getText(source)).toBe("sql");
    expect(ts.isTemplateExpression(query.template)).toBe(true);

    const template = query.template as ts.TemplateExpression;
    expect(template.templateSpans).toHaveLength(1);
    expect(template.templateSpans[0]!.expression.getText(source)).toBe(
      "authUserId",
    );
    const staticSql = [
      template.head.text,
      ...template.templateSpans.map((span) => span.literal.text),
    ]
      .join("")
      .replace(/\s+/gu, " ")
      .trim();
    expect(staticSql).toBe("select pg_advisory_xact_lock(hashtext())");
  });

  it("keeps existing-account learner and administrator login policies separate", () => {
    const servicePath = join(
      process.cwd(),
      "src",
      "server",
      "services",
      "session-service.ts",
    );
    const source = parseSource(servicePath);
    const serviceFunction = getSingleFunction(source, "createSessionService");
    const loginMethod = getSingleMethod(source, "login");
    const block = loginMethod.body!;
    const adminDeclaration = getDirectVariable(block, "isAdminLogin");
    const adminInitializer = adminDeclaration.declaration.initializer;

    expect(
      adminInitializer !== undefined &&
        ts.isCallExpression(adminInitializer) &&
        ts.isIdentifier(adminInitializer.expression) &&
        adminInitializer.expression.text === "isAdminLoginUser",
    ).toBe(true);
    expect(
      (adminInitializer as ts.CallExpression).arguments[0]!.getText(source),
    ).toBe("loginUser");

    const selectorDeclaration = getDirectVariable(block, "createAuthSession");
    const selector = selectorDeclaration.declaration.initializer;
    expect(selector !== undefined && ts.isConditionalExpression(selector)).toBe(
      true,
    );

    const policy = selector as ts.ConditionalExpression;
    expect(ts.isBinaryExpression(policy.condition)).toBe(true);
    const conjunction = policy.condition as ts.BinaryExpression;
    expect(conjunction.operatorToken.kind).toBe(
      ts.SyntaxKind.AmpersandAmpersandToken,
    );
    expect(conjunction.left.getText(source)).toBe("isAdminLogin");
    expect(ts.isBinaryExpression(conjunction.right)).toBe(true);

    const availability = conjunction.right as ts.BinaryExpression;
    expect(availability.operatorToken.kind).toBe(
      ts.SyntaxKind.ExclamationEqualsEqualsToken,
    );
    expect(availability.left.getText(source)).toBe(
      "credentialAdapter.createSession",
    );
    expect(availability.right.getText(source)).toBe("undefined");
    expect(policy.whenTrue.getText(source)).toBe(
      "credentialAdapter.createSession",
    );
    expect(policy.whenFalse.getText(source)).toBe(
      "credentialAdapter.createSingleActiveSession",
    );

    const creatorPropertyReferences = collectNodes(
      serviceFunction,
      (node): node is ts.PropertyAccessExpression =>
        ts.isPropertyAccessExpression(node) &&
        ["createSession", "createSingleActiveSession"].includes(node.name.text),
    );
    expect(
      creatorPropertyReferences
        .map((reference) => reference.getText(source))
        .sort(),
    ).toEqual([
      "credentialAdapter.createSession",
      "credentialAdapter.createSession",
      "credentialAdapter.createSingleActiveSession",
    ]);
    expect(
      collectNodes(
        serviceFunction,
        (node): node is ts.BindingElement =>
          ts.isBindingElement(node) &&
          ["createSession", "createSingleActiveSession"].includes(
            getBindingPropertyName(node),
          ),
      ),
    ).toHaveLength(0);
    expect(
      collectNodes(
        serviceFunction,
        (node): node is ts.ElementAccessExpression =>
          ts.isElementAccessExpression(node),
      ),
    ).toHaveLength(0);

    const selectedCalls = collectNodes(
      loginMethod,
      (node): node is ts.CallExpression =>
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "createAuthSession",
    );
    expect(selectedCalls).toHaveLength(1);
    expect(ts.isAwaitExpression(selectedCalls[0]!.parent)).toBe(true);
    expect(hasNestedFunctionBoundary(selectedCalls[0]!, loginMethod)).toBe(
      false,
    );
    expect(
      collectNodes(
        loginMethod,
        (node): node is ts.CallExpression =>
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.expression.getText(source) === "credentialAdapter" &&
          ["createSession", "createSingleActiveSession"].includes(
            node.expression.name.text,
          ),
      ),
    ).toHaveLength(0);
  });

  it("keeps the registration writer as an atomic first-session exception", () => {
    const runtimePath = join(
      process.cwd(),
      "src",
      "server",
      "auth",
      "local-session-runtime.ts",
    );
    const source = parseSource(runtimePath);
    const authSessionAliases = getTableAliases(source, "authSession");
    const authUserAliases = getTableAliases(source, "authUser");
    const method = getSingleMethod(source, "createPersonalRegistration");
    const { callback } = getReturnedTransaction(method, source);
    const block = callback.body as ts.Block;
    const authUserId = getDirectVariable(block, "authUserId");
    const authUserInsert = getDirectInsertStatement(
      block,
      authUserAliases,
      "authUser",
    );
    const sessionInsert = getDirectInsertStatement(
      block,
      authSessionAliases,
      "authSession",
    );

    expect([
      authUserId.statementIndex,
      authUserInsert.statementIndex,
      sessionInsert.statementIndex,
    ]).toEqual(
      [
        authUserId.statementIndex,
        authUserInsert.statementIndex,
        sessionInsert.statementIndex,
      ].sort((left, right) => left - right),
    );
    expect(
      collectNodes(block, (node): node is ts.CallExpression =>
        isTableDeleteCall(
          node,
          "transaction",
          authSessionAliases,
          "authSession",
        ),
      ),
    ).toHaveLength(0);

    const authUserValues = getValuesObject(authUserInsert.root, source);
    expect(
      getObjectProperty(authUserValues, "id").initializer.getText(source),
    ).toBe("authUserId");
    const sessionValues = getValuesObject(sessionInsert.root, source);
    expect(
      getObjectProperty(sessionValues, "user_id").initializer.getText(source),
    ).toBe("authUserId");
  });
});
