import {inspect} from 'node:util'
import parsePolygon from 'parse-gml-polygon'

import {getCapabilities} from './get-capabilities.js'
import {getFeatures} from './get-features.js'
import {textOf, findIn} from './lib/helpers.js'

const endpoint = 'https://fbinter.stadt-berlin.de/fb/wfs/data/senstadt/s_plz'
const layer = 'fis:s_plz'
const bbox = [387000, 5812000, 386000, 5813000]

{
	const capabilities = await getCapabilities(endpoint)
	console.log(inspect(capabilities, {depth: Infinity, colors: true}))
}

{
	const features = getFeatures(endpoint, layer, {bbox})
	for await (const feature of features) {
		const plz = findIn(feature, 'fis:plz')
		const geom = findIn(feature, 'fis:geom')
		const gmlChild = geom?.children?.find(c => c.name.slice(0, 4) === 'gml:')
		const polygon = gmlChild ? parsePolygon(gmlChild) : null
		console.log('found zip code', textOf(plz), inspect(polygon, {depth: 4, colors: true}))
	}
}
