'use strict'

const {inspect} = require('util')

const getCapabilities = require('./get-capabilities')
const getFeatures = require('./get-features')
const {textOf, findIn} = require('./lib/helpers')

const endpoint = 'https://fbinter.stadt-berlin.de/fb/wfs/data/senstadt/s_plz'
const layer = 'fis:s_plz'
const bbox = [387000, 5812000, 386000, 5813000]

// getCapabilities(endpoint)
// .then((data) => {
// 	console.log(inspect(data, {depth: Infinity}))
// })
// .catch((err) => {
// 	console.error(err)
// 	process.exit(1)
// })

getFeatures(endpoint, layer, {bbox})
.on('data', (el) => {
	const plz = findIn(el, 'fis:plz')
	const polygon = findIn(findIn(el, 'fis:geom'), 'gml:Polygon')
	console.log('found zip code', textOf(plz), polygon)
})
.on('error', (err) => {
	console.error(err)
	process.exit(1)
})
