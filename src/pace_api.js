/**
 * PaceAPI for running suites and checking their statuses
 */
const axios = require('axios')


/**
 * Sleep for a duration
 * @param {int} ms - Time to sleep in milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


class PaceAPI {
    /**
     * PaceAPI allows running and checking statuses of Pace suite runs
     * @param {string} accessToken
     * @param {int} suiteId
     * @param {int} projectId
     * @param {string} apiUrl - E.g. https://host.tld/pace/v4/
     */
    constructor(accessToken, suiteId, projectId, apiUrl) {
        this.jobId = suiteId
        this.projectId = projectId
        this._api = axios.create({
            baseURL: apiUrl || `https://api.pace.qentinel.com/pace/v4/`,
            timeout: 10000,
            responseType: 'json',
            headers: {'X-AUTHORIZATION': accessToken}
        });
    }

    /**
     * Get the status of a suite build
     * @param {int} buildId
     * @returns {Promise<{duration: int, response_data: object, success: boolean, link: string, executing: boolean, status: string}>}
     */
    async suiteStatus(buildId) {
        const path = `projects/${this.projectId}/jobs/${this.jobId}/builds/${buildId}`
        const resp = await this._api.get(path)
        let data = (resp.data && resp.data.data) || {}

        const executing = ['queued', 'executing'].includes(data.status)
        const success = executing ? null : ['succeeded', 'finished'].includes(data.status)

        return {
            executing,
            success,
            status: data.status,
            duration: data.duration,
            link: data.logReportUrl,
            response: resp
        }
    }

    /**
     * Start a suite run
     * @param {object, undefined} opts
     * @returns {Promise<{response_data: object, buildId: int, status: string}>}
     */
    async runSuite(opts) {
        opts = opts || {}
        const payload = {}
        // Add options if they are defined
        if ('branch' in opts && opts.branch)
            payload.branch = opts.branch
        if ('record' in opts && opts.record)
            payload.record = opts.record
        if ('runType' in opts && opts.runType)
            payload.runType = opts.runType
        if ('tag' in opts && opts.tag)
            payload.tag = opts.tag

        const path = `projects/${this.projectId}/jobs/${this.jobId}/builds`
        const resp = await this._api.post(path, payload)
        const data = (resp.data && resp.data.data) || {}
        return {
            buildId: data.id,
            status: data.status,
            response: resp
        }
    }

    /**
     * Wait for a suite run to complete
     * @param buildId
     * @returns {Promise<{duration: int, response_data: Object, success: boolean, link: string, executing: boolean, status: string}>}
     */
    async waitForSuite(buildId) {
        let suite = await this.suiteStatus(buildId)
        while (suite.executing) {
            console.log((new Date).toUTCString(), `Run state: "${suite.status}"`)
            await sleep(10000)
            suite = await this.suiteStatus(buildId)
        }
        return suite
    }
}

module.exports = PaceAPI
