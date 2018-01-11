'use strict'

const {inspect} = require('util')

const getCapabilities = require('./get-capabilities')
const getFeatures = require('./get-features')
const {textOf, findIn} = require('./lib/helpers')

const endpoint = 'https://fbinter.stadt-berlin.de/fb/wfs/geometry/senstadt/re_postleit'
const layer = 'fis:re_postleit'
const bbox = [387000, 5812000, 386000, 5813000]

// getCapabilities(endpoint)
// .then((data) => {
// 	console.log(inspect(data, {depth: Infinity}))
// })
// .catch(console.error)

getFeatures(endpoint, layer, {bbox})
.on('data', (el) => {
	// console.log(inspect(el, {depth: Infinity}))
	console.log('found zip code', textOf(findIn(el, 'fis:spatial_name')))
})
.on('error', console.error)
