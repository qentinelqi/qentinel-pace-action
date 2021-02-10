const core = require('@actions/core');
const PaceAPI = require('./pace_api')

/**
 * The main body of the action
 * @returns {Promise<void>}
 */
async function action() {
    // Parse inputs
    const accessToken = core.getInput('access_token')
    const suiteId = parseInt(core.getInput('suite_id'))
    const projectId = parseInt(core.getInput('project_id'))
    const ignoreFailed = core.getInput('ignore_failed') === 'true'
    const waitResult = core.getInput('wait_result') === 'true'
    const apiUrl = core.getInput('api_url')
    const runOpts = {
        branch: core.getInput('branch'),
        record: core.getInput('record'),
        runType: core.getInput('run_type'),
        tag: core.getInput('tag'),
    }

    const api = new PaceAPI(accessToken, suiteId, projectId, apiUrl)
    const run = await api.runSuite(runOpts)
    if (!run.buildId) {
        core.setFailed(`API Error: No buildId returned!`)
        return
    }

    console.log(`Suite buildId: ${run.buildId}`)
    core.setOutput('buildId', run.buildId)

    if (!waitResult)
        return

    const suite = await api.waitForSuite(run.buildId)
    console.log(`Suite result: ${suite.status}`)
    console.log(`Execution time: ${suite.duration} seconds`)
    console.log(`Link to results: ${suite.link}`)

    core.setOutput('result', suite.status)
    core.setOutput('duration', suite.duration)
    core.setOutput('link', suite.link)

    if (!suite.success && !ignoreFailed)
        core.setFailed(`Suite run result was: "${suite.status}"`)
}


module.exports = action
