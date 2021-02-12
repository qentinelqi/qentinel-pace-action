# Qentinel Pace Action

This actions runs a test suite in [Qentinel Pace](https://pace.qentinel.com) and
validates that it passes.


## Example usage

First create a Personal access token in Pace. You can create one for yourself
in your profile settings. After you have created the token, add it as a
[GitHub secret](https://docs.github.com/en/actions/reference/encrypted-secrets).

Then navigate to a test suite in Pace. Extract the `project_id` and the
`suite_id` from the `url` of the page:

![Suite and project id](suite_id.png?raw=true "Suite and Project Ids")

Then in your GitHub workflow `.yaml` file:

```yaml
uses: qentinelqi/qentinel-pace-action@1.0.1
with:
  access_token: ${{ secrets.<NAME_OF_YOUR_SECRET> }}
  suite_id: <id_of_your_suite>
  project_id: <id_of_your_project>
```

The following optional variables can be added to the `with` section above:

```yaml
with:
  ...
  
  # Options to control step execution
  wait_result: "true"
  ignore_failed: "false"
  
  # Options for the run
  branch: "branch"
  record: "all"
  runType: "dry"
  tag: "tag"
```


## Outputs

The following output variables will be set

- `build_id`: The buildId of the run
- `result`: The result of the test suite run
- `duration`: The execution time in seconds
- `link`: Link to the results


# Development

[GitHub instructions](https://docs.github.com/en/actions/creating-actions).

Note that the `node_modules` folder is included because it is required when
running JavaScript based actions.

## Testing

You can test this action outside GitHub with `mocha`.

First set proper action inputs in the `test_inputs.json` file in the root of
this repository. Then run the tests:

`mocha test`
