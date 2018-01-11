'use strict'

const pTape = require('tape-promise').default
const tape = require('tape')
const isStream = require('is-stream')

const test = pTape(tape)

const all = require('.')
const getCapabilities = require('./get-capabilities')
const getFeatures = require('./get-features')

const endpoint = 'https://fbinter.stadt-berlin.de/fb/wfs/geometry/senstadt/re_postleit'
const layer = 'fis:re_postleit'
const bbox = [387000, 5812000, 386000, 5813000]

const isObj = o => 'object' === typeof o && !Array.isArray(o)

test('getCapabilities', async (t) => {
	t.equal(all.getCapabilities, getCapabilities)

	const caps = await getCapabilities(endpoint)
	t.ok(caps)

	t.ok(Array.isArray(caps.operations))
	for (let op of caps.operations) {
		t.ok(op)

		t.equal('string', typeof op.name)
		t.ok(op.name)

		t.ok(Array.isArray(op.params))
		for (let param of op.params) {
			t.ok(param)

			t.equal('string', typeof param.name)
			t.ok(param.name)

			if (param.defaultValue !== null) {
				t.equal('string', typeof param.defaultValue)
				t.ok(param.defaultValue)
			}

			if (param.allowedValues !== null) {
				t.ok(Array.isArray(param.allowedValues))
				for (let val of param.allowedValues) {
					t.equal('string', typeof val)
					t.ok(val)
				}
			}
		}
	}

	if (caps.defaultVersion !== null) {
		t.equal('string', typeof caps.defaultVersion)
		t.ok(caps.defaultVersion)
	}
	if (caps.allowedVersions !== null) {
		t.ok(Array.isArray(caps.allowedVersions))
		for (let version of caps.allowedVersions) {
			t.equal('string', typeof version)
			t.ok(version)
		}
	}

	t.ok(Array.isArray(caps.layers))
	for (let layer of caps.layers) {
		t.ok(layer)

		t.equal('string', typeof layer.name)
		t.ok(layer.name)
		t.equal('string', typeof layer.title)
		t.equal('string', typeof layer.description)
		t.equal('string', typeof layer.crs)
		t.ok(layer.crs)

		if (layer.outputFormats !== null) {
			t.ok(Array.isArray(layer.outputFormats))
			for (let format of layer.outputFormats) {
				t.equal('string', typeof format)
				t.ok(format)
			}
		}

		t.ok(isObj(layer.bbox))
		if (isObj(layer.bbox)) {
			t.equal('number', typeof layer.bbox.minLat)
			t.equal('number', typeof layer.bbox.minLon)
			t.equal('number', typeof layer.bbox.maxLat)
			t.equal('number', typeof layer.bbox.maxLon)
		}
	}

	t.ok(Array.isArray(caps.spatialCapabilities))
	for (let cap of caps.spatialCapabilities) {
		t.equal('string', typeof cap)
		t.ok(cap)
	}

	t.end()
})

test('getFeatures', async (t) => {
	t.equal(all.getFeatures, getFeatures)

	const features = getFeatures(endpoint, layer, {bbox})
	t.ok(isStream.readable(features))

	features.on('data', (feature) => {
		t.ok(feature)
		// todo
	})

	await new Promise((resolve, reject) => {
		features.once('error', reject)
		features.once('end', resolve)
	})

	t.end()
})
