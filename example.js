import {inspect} from 'node:util'

import {getCapabilities} from './get-capabilities.js'
import {getFeatures} from './get-features.js'
import {textOf, findIn} from './lib/helpers.js'

const endpoint = 'https://fbinter.stadt-berlin.de/fb/wfs/data/senstadt/s_plz'
const layer = 'fis:s_plz'
const bbox = [387000, 5812000, 386000, 5813000]

{
	const capabilities = await getCapabilities(endpoint)
	console.log(inspect(capabilities, {depth: Infinity}))
}

{
	const features = getFeatures(endpoint, layer, {bbox})
	for await (const feature of features) {
		const plz = findIn(feature, 'fis:plz')
		const polygon = findIn(findIn(feature, 'fis:geom'), 'gml:Polygon')
		console.log('found zip code', textOf(plz), polygon)
	}
}
