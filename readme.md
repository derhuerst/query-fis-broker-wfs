# query-fis-broker-wfs

**Query WFS sources in the [Berlin geodata portal *FIS-Broker*](http://www.stadtentwicklung.berlin.de/geoinformation/fis-broker/).**

[![npm version](https://img.shields.io/npm/v/query-fis-broker-wfs.svg)](https://www.npmjs.com/package/query-fis-broker-wfs)
[![build status](https://api.travis-ci.org/derhuerst/query-fis-broker-wfs.svg?branch=master)](https://travis-ci.org/derhuerst/query-fis-broker-wfs)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/query-fis-broker-wfs.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install query-fis-broker-wfs
```


## Usage

```js
const getFeatures = require('query-fis-broker-wfs/get-features')

const endpoint = 'https://fbinter.stadt-berlin.de/fb/wfs/geometry/senstadt/re_postleit'
const layer = 'fis:re_postleit'
const bbox = [387000, 5812000, 386000, 5813000]

getFeatures(endpoint, layer, {bbox})
.on('data', console.log)
.on('error', console.error)
```

It will return data in the [`xml-reader`](https://www.npmjs.com/package/xml-reader) shape:

```js
{
	type: 'element',
	name: 'fis:re_postleit',
	parent: {
		type: 'element',
		name: 'wfs:member',
		attributes: {}
	},
	attributes: {
		'gml:id': 're_postleit.12165'
	},
	children: [
		{
			type: 'element',
			name: 'fis:spatial_geometry',
			attributes: {},
			children: [ {
				type: 'element',
				name: 'gml:Polygon',
				attributes: {
					'gml:id': 'P1'
				},
				children: [ /* GML data */ ]
			} ],
		},
		// …
	]
}
```


## API

### `getCapabilities(endpoint)` -> `Promise`

Uses [the `GetCapabilities` method](http://docs.geoserver.org/stable/en/user/services/wfs/reference.html#getcapabilities), returns data that looks like this:

```js
{
	operations: [ {
		name: 'GetCapabilities',
		params: [ {
			name: 'AcceptVersions',
			defaultValue: '2.0.0',
			allowedValues: ['1.0.0', '1.1.0', '2.0.0']
		}, {
			name: 'AcceptFormats',
			defaultValue: 'text/xml',
			allowedValues: ['text/xml']
		} ]
	}, {
		name: 'GetFeature',
		params: [ {
			name: 'resultType',
			defaultValue: null,
			allowedValues: ['results', 'hits']
		}, {
			name: 'outputFormat',
			defaultValue: 'application/gml+xml; version=3.2',
			allowedValues: [
				'text/xml; subtype=gml/2.1.2',
				'text/xml; subtype=gml/3.1.1',
				'text/xml; subtype=gml/3.2.1'
				// …
			]
		} ]
	} ],
	defaultVersion: '2.0.0',
	allowedVersions: ['1.0.0', '1.1.0', '2.0.0'],
	featureTypes: [ {
		name: 'fis:re_postleit',
		title: 'Postleitzahlen',
		description: 'PLZ - Postleitzahlgebiete Berlins',
		crs: 'urn:ogc:def:crs:EPSG:6.9:25833',
		outputFormats: [
			'text/xml; subtype=gml/2.1.2',
			'text/xml; subtype=gml/3.1.1',
			'text/xml; subtype=gml/3.2.1'
			// …
		],
		bbox: {
			minLat: 52.3284,
			minLon: 13.079,
			maxLat: 52.6877,
			maxLon: 13.7701
		}
	} ],
	spatialCapabilities: [
		'BBOX',
		'Equals',
		'Disjoint'
		// …
	]
}
```

### `getFeatures(endpoint, layer, [opt])` -> [`Readable` stream](https://nodejs.org/api/stream.html#stream_readable_streams)

Uses [the `GetFeature` method](http://docs.geoserver.org/stable/en/user/services/wfs/reference.html#getfeature).

You may optionally pass the options `bbox`, `crs`, `results`, `sortBy`, `props`.


## Contributing

If you have a question or have difficulties using `query-fis-broker-wfs`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/query-fis-broker-wfs/issues).
