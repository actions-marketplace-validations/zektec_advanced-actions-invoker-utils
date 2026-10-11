# Advanced Actions Invoker Utils

A GitHub Action that works with the [Advanced Actions Invoker Composer](https://zektec.com/tools/advanced-actions-invoker) and [Chrome extension](https://chromewebstore.google.com/detail/advanced-actions-invoker/gaplomiopokomidbknbhaidpmeeneiff). Parse the generated `schema`, `layout`, `data`, and optional `style` JSON objects into workflow outputs. Runs on Node.js 24 with bundled dependencies.

## Release status

The public repository is [zektec/advanced-actions-invoker-utils](https://github.com/zektec/advanced-actions-invoker-utils), included in ZekTec Tools at `packages/advanced-actions-invoker-utils`. Its first Marketplace release is pending. Use `zektec/advanced-actions-invoker-utils@main` to try it now; pin a reviewed full commit SHA for production. The `@v1` example becomes available after publishing the first release and version tags.

## Usage

```yaml
- name: Parse form inputs
  id: form
  uses: zektec/advanced-actions-invoker-utils@v1
  with:
    schema: ${{ inputs.schema }}
    layout: ${{ inputs.layout }}
    data: ${{ inputs.data }}
    style: ${{ inputs.style }}
- name: Use the parsed values
  env:
    ENVIRONMENT: ${{ steps.form.outputs.data_environment }}
    SERVICES: ${{ steps.form.outputs.data_services }}
  run: |
    printf 'Environment: %s\nServices: %s\n' "$ENVIRONMENT" "$SERVICES"
```

Pin a reviewed full commit SHA for production. No checkout step is needed with a remote action. Local `uses: ./advanced-actions-invoker/utils` requires `actions/checkout` first.

## Inputs and outputs

All inputs are optional strings containing JSON objects.

| Input | Purpose | Example output |
| --- | --- | --- |
| `schema` | JSON Schema used by the browser form | `schema_type` |
| `layout` | JSON Forms UI layout | `layout_type`, `layout_elements` |
| `data` | Submitted form values | `data_environment`, `data_services` |
| `style` | Optional metadata; does not theme the extension | `style_theme` |

Outputs follow `<input>_<top-level-key>`. Strings are preserved; numbers, booleans, arrays, objects, and null values are serialized as JSON. Nested fields are not flattened. Empty inputs are skipped. Invalid JSON, array roots, and primitive roots fail the step. Partial outputs may exist if one input fails; use the step's success status before consuming them.

This action parses objects; it does not validate `data` against `schema`, dispatch workflows, or deploy services. Validate project-specific rules in subsequent steps.

## Chrome extension setup

Install [Advanced Actions Invoker](https://chromewebstore.google.com/detail/advanced-actions-invoker/gaplomiopokomidbknbhaidpmeeneiff). Design a form with the [Composer](https://zektec.com/tools/advanced-actions-invoker), then commit its `schema`, `layout`, and `data` defaults to `workflow_dispatch` inputs. Include a canonical `data` input to receive edited values. The extension renders dropdowns and checkbox lists and synchronizes JSON values for GitHub's native submission.

This action can also parse ordinary JSON workflow inputs without the browser extension.

## Security

The action logs output names, not their values. Outputs still contain the original data, and downstream steps can disclose it. Keep credentials in GitHub Secrets. Pass user values through environment variables before using them in shell scripts. Browser validation does not protect API or CLI dispatches; validate business rules on the runner and keep deployment approvals.

## Development

In the tools repository, install locked workspace dependencies at the repository root, then run:

```sh
pnpm --dir advanced-actions-invoker/utils build
pnpm --dir advanced-actions-invoker/utils test
```

Verify a standalone distribution with `node --test tests/*.test.mjs`. No dependency installation is required. The tools repository's `advanced-actions-invoker/docs/publishing.md` describes packaging.

## License and support

ISC. Dependency notices are included in standalone distributions. Report issues in the public action repository once published, or contact hi@zektec.com.
