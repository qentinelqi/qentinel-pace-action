const core = require('@actions/core');
var assert = require('assert');
const action = require('../src/action')
const inputs = require('../test_inputs.json')


let OUTPUTS = {}
let FAILURES = []


// Monkey patch GitHub core
core.getInput = function(name) {
    return inputs[name]
}

core.setFailed = function(msg) {
    FAILURES.push(msg)
    console.error('setFailed:', msg)
}

core.setOutput = function(key, val) {
    OUTPUTS[key] = val
}


describe('action()', function() {
    it('It should run', function(done) {
        this.timeout(2 * 60 * 1000);
        action()
            .then(() => {
                assert('buildId' in OUTPUTS)
                assert('result' in OUTPUTS)
                assert('duration' in OUTPUTS)
                assert('link' in OUTPUTS)
                done()
            })
            .catch(error => {
                done(error)
            })
    })

    it('It should not wait', function(done) {
        this.timeout(2 * 60 * 1000);
        inputs.wait_result = 'false'
        action()
            .then(() => {
                assert.equal(FAILURES.length, 0)
                assert('buildId' in OUTPUTS)
                assert(!('result' in OUTPUTS))
                done()
            })
            .catch(error => {
                done(error)
            })
    })

    afterEach(function() {
        OUTPUTS = {}
        FAILURES = []
    })
})

