import {request} from './lib/request.js'
import {attrOf, findIn, textOf} from './lib/helpers.js'

export const getCapabilities = async (endpoint) => {
	const data = {
		operations: [],
		allowedVersions: [],
		defaultVersion: null,
		layers: [],
		spatialCapabilities: []
	}

	const onOperation = (op) => {
		const res = {
			name: attrOf(op, 'name'),
			params: []
		}
		data.operations.push(res)

		for (let c of op.children) {
			if (c.name !== 'ows:Parameter') continue

			const allowed = findIn(c, 'ows:AllowedValues')
			res.params.push({
				name: attrOf(c, 'name'),
				defaultValue: textOf(findIn(c, 'ows:DefaultValue')),
				allowedValues: allowed && allowed.children.map(textOf) || []
			})
		}
	}

	const onOperationsMetadata = (meta) => {
		for (let c of meta.children) {
			if (c.name === 'ows:Operation') onOperation(c)
			else if (
				c.name === 'ows:Parameter' &&
				attrOf(c, 'name') === 'version'
			) {
				data.defaultVersion = textOf(findIn(c, 'ows:DefaultValue'))
				const allowed = findIn(c, 'ows:AllowedValues')
				if (allowed) {
					data.allowedVersions = allowed.children.map(a => textOf(a))
				}
			}
		}
	}

	const onFeatureType = (fType) => {
		const res = {
			name: textOf(findIn(fType, 'wfs:Name')),
			title: textOf(findIn(fType, 'wfs:Title')),
			description: textOf(findIn(fType, 'wfs:Abstract')),
			crs: textOf(findIn(fType, 'wfs:DefaultCRS')),
			outputFormats: [],
			bbox: null
		}

		const outputFormats = findIn(fType, 'wfs:OutputFormats')
		if (outputFormats) {
			res.outputFormats = outputFormats.children.map(textOf)
		}

		const bbox = findIn(fType, 'ows:WGS84BoundingBox')
		const lower = textOf(findIn(bbox, 'ows:LowerCorner'))
		const upper = textOf(findIn(bbox, 'ows:UpperCorner'))
		if (lower && upper) {
			res.bbox = {
				minLat: parseFloat(lower.split(' ')[1]),
				minLon: parseFloat(lower.split(' ')[0]),
				maxLat: parseFloat(upper.split(' ')[1]),
				maxLon: parseFloat(upper.split(' ')[0])
			}
		}

		data.layers.push(res)
	}

	const onFeatureTypeList = (list) => {
		for (let c of list.children) {
			if (c.name === 'wfs:FeatureType') onFeatureType(c)
		}
	}

	const onSpatialOperators = (ops) => {
		for (let c of ops.children) {
			if (c.name !== 'fes:SpatialOperator') continue

			const name = attrOf(c, 'name')
			if (name) data.spatialCapabilities.push(name)
		}
	}

	await request(endpoint, {request: 'GetCapabilities'}, {
		'ows:OperationsMetadata': onOperationsMetadata,
		'wfs:FeatureTypeList': onFeatureTypeList,
		'fes:SpatialOperators': onSpatialOperators
	})

	return data
}
