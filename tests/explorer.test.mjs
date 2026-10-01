import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"
import { createRequire } from "node:module"
import { Script } from "node:vm"
import { createServer } from "node:http"
import { once } from "node:events"
import ts from "typescript"

const root = fileURLToPath(new URL("../", import.meta.url))

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(filename) : /\.tsx$/.test(filename) ? [filename] : []
  })
}

// Prefetch is a Next Link prop, not an HTML attribute. Inspect JSX so this
// also covers conditional proof trails and links in server-rendered pages.
for (const filename of sourceFiles(path.join(root, "src"))) {
  const source = ts.createSourceFile(filename, readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const linkNames = source.statements.filter((node) =>
    ts.isImportDeclaration(node) && node.moduleSpecifier.text === "next/link"
  ).map((node) => node.importClause?.name?.text)

  function visit(node) {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && linkNames.includes(node.tagName.getText(source))) {
      const attributes = node.attributes.properties
      const href = attributes.find((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(source) === "href")
      if (href && /\/(tx|address)\//.test(href.initializer?.getText(source) ?? "")) {
        const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
        test(`${path.relative(root, filename)}:${line} loads explorer details only on navigation`, () => {
          const prefetch = attributes.find((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(source) === "prefetch")
          assert.ok(prefetch?.initializer && ts.isJsxExpression(prefetch.initializer), "explorer links must explicitly disable automatic prefetch")
          assert.equal(prefetch.initializer.expression?.kind, ts.SyntaxKind.FalseKeyword)
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}

// Use the installed TypeScript compiler and Node's test runner without adding
// a test framework or loader dependency. External packages remain real.
function loadSource(relativePath, overrides = {}, cache = new Map()) {
  const filename = path.join(root, relativePath)
  if (cache.has(filename)) return cache.get(filename).exports
  const compiledModule = { exports: {} }
  cache.set(filename, compiledModule)
  const localRequire = createRequire(filename)
  const code = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText
  const requireSource = (specifier) => {
    if (Object.hasOwn(overrides, specifier)) return overrides[specifier]
    if (specifier.startsWith("@/")) {
      const relative = `src/${specifier.slice(2)}`
      const extension = [".ts", ".tsx"].find((ext) => {
        try { readFileSync(path.join(root, relative + ext)); return true } catch { return false }
      })
      assert.ok(extension, `Cannot resolve ${specifier}`)
      return loadSource(relative + extension, overrides, cache)
    }
    return localRequire(specifier)
  }
  new Script(`(function(require, module, exports) {${code}\n})`, { filename }).runInThisContext()(requireSource, compiledModule, compiledModule.exports)
  return compiledModule.exports
}

const validHash = `0x${"a".repeat(64)}`

for (const method of ["fetchTransaction", "fetchTransactionLogs", "fetchAddress", "fetchAddressTransactions"]) {
  test(`${method} bounds the upstream wait without changing its fresh cache policy`, async (t) => {
    const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ items: [] }))
    const api = loadSource("src/lib/blockscout.ts")
    await api[method](method.includes("Address") ? `0x${"1".repeat(40)}` : validHash)
    const options = fetch.mock.calls[0].arguments[1]
    assert.equal(options.next.revalidate, 5)
    assert.ok(options.signal instanceof AbortSignal, "every Blockscout request needs an abort deadline")
  })
}

for (const stalledBody of [false, true]) {
  test(`Blockscout aborts stalled ${stalledBody ? "JSON bodies" : "response headers"} and returns the existing fallback`, async (t) => {
    const server = createServer((_request, response) => {
      if (stalledBody) {
        response.writeHead(200, { "Content-Type": "application/json" })
        response.write('{"hash":')
      }
    })
    server.listen(0, "127.0.0.1")
    await once(server, "listening")
    const nativeTimeout = AbortSignal.timeout.bind(AbortSignal)
    const timeout = t.mock.method(AbortSignal, "timeout", () => nativeTimeout(30))
    const api = loadSource("src/lib/blockscout.ts", {
      "@/lib/chains": { activeChain: { blockExplorers: { default: { url: `http://127.0.0.1:${server.address().port}` } } } },
    })
    let timer
    try {
      const fallback = stalledBody ? [] : null
      const pending = stalledBody ? api.fetchTransactionLogs(validHash) : api.fetchTransaction(validHash)
      const result = await Promise.race([
        pending,
        new Promise((resolve) => { timer = setTimeout(() => resolve("deadline exceeded"), 500) }),
      ])
      assert.deepEqual(result, fallback, "stalled upstream must settle at the configured deadline")
      assert.equal(timeout.mock.callCount(), 1)
      assert.equal(timeout.mock.calls[0].arguments[0], 8_000)
    } finally {
      clearTimeout(timer)
      server.closeAllConnections()
      await new Promise((resolve) => server.close(resolve))
    }
  })
}

for (const hash of ["", "not-a-hash", `0x${"a".repeat(63)}`, `0x${"a".repeat(65)}`, `0X${"a".repeat(64)}`, `0x${"g".repeat(64)}`, `${validHash}/logs`, `${validHash}?query=1`, ` ${validHash}`, `${validHash} `, `${validHash}\n`]) {
  test(`transaction page rejects ${JSON.stringify(hash)} before upstream I/O`, async (t) => {
    const fetch = t.mock.method(globalThis, "fetch", async () => new Response("{}", { status: 404 }))
    const { default: TxPage } = loadSource("src/app/tx/[hash]/page.tsx")
    await assert.rejects(TxPage({ params: Promise.resolve({ hash }) }), { digest: "NEXT_HTTP_ERROR_FALLBACK;404" })
    assert.equal(fetch.mock.callCount(), 0, "malformed hashes must not reach Blockscout")
  })
}

for (const hash of [validHash, `0x${"ABCDEF01".repeat(8)}`]) {
  test(`transaction page preserves valid hash ${hash}`, async (t) => {
    const tx = { status: "ok", block_number: 1, timestamp: "2026-10-01T00:00:00Z", from: { hash: `0x${"1".repeat(40)}` }, to: null, value: "0", gas_used: "21000", gas_price: "1", fee: { value: "21000" }, raw_input: "0x" }
    const fetch = t.mock.method(globalThis, "fetch", async (url) => Response.json(url.endsWith("/logs") ? { items: [] } : tx))
    const { default: TxPage } = loadSource("src/app/tx/[hash]/page.tsx")
    assert.ok(await TxPage({ params: Promise.resolve({ hash }) }))
    assert.deepEqual(fetch.mock.calls.map(({ arguments: args }) => args[0]), [
      `https://scan.botchain.ai/api/v2/transactions/${hash}`,
      `https://scan.botchain.ai/api/v2/transactions/${hash}/logs`,
    ])
  })
}
