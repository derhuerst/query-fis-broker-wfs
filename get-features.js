'use strict'

const {Readable} = require('stream')

const request = require('./lib/request')

const defaults = {
	bbox: null,
	crs: null,
	results: null,
	sortBy: null,
	props: null
}

const getFeatures = (endpoint, layer, opt = {}) => {
	if ('string' !== typeof layer || !layer) {
		throw new Error('layer must be a non-empty string.')
	}
	opt = Object.assign({}, defaults, opt)
	if (opt.bbox !== null && !Array.isArray(opt.bbox)) {
		throw new Error('opt.bbox must be an array of coords or null.')
	}
	if (opt.crs !== null && ('string' !== typeof opt.crs || !opt.crs)) {
		throw new Error('opt.crs must be a non-empty string.')
	}
	if (opt.results !== null && 'number' !== typeof opt.results) {
		throw new Error('opt.results must be a number.')
	}
	if (opt.sortBy !== null && ('string' !== typeof opt.sortBy || !opt.sortBy)) {
		throw new Error('opt.sortBy must be a non-empty string.')
	}
	if (opt.props !== null && !Array.isArray(opt.props)) {
		throw new Error('opt.props must be an array of props or null.')
	}

	const query = {
		request: 'GetFeature',
		typeNames: layer
	}
	if (opt.bbox) query.bbox = opt.bbox.join(',')
	if (opt.crs) query.srsName = opt.crs
	if (opt.results) query.count = opt.results
	if (opt.sortBy) query.sortBy = opt.sortBy
	if (opt.props) query.propertyName = opt.props.join(',')

	const out = new Readable({objectMode: true, read: () => {}})

	request(endpoint, query, {
		[layer]: res => out.push(res)
	})
	.then(() => out.push(null))
	.catch((err) => out.destroy(err))

	return out
}

module.exports = getFeatures
