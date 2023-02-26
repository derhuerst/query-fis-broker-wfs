# query-fis-broker-wfs

**Query WFS sources in the [Berlin geodata portal *FIS-Broker*](https://www.stadtentwicklung.berlin.de/geoinformation/fis-broker/).**

[![npm version](https://img.shields.io/npm/v/query-fis-broker-wfs.svg)](https://www.npmjs.com/package/query-fis-broker-wfs)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/query-fis-broker-wfs.svg)
![minimum Node.js version](https://img.shields.io/node/v/query-fis-broker-wfs.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installing

```shell
npm install query-fis-broker-wfs
```


## Usage

```js
import {getFeatures} from 'query-fis-broker-wfs/get-features.js'

const endpoint = 'https://fbinter.stadt-berlin.de/fb/wfs/data/senstadt/s_plz'
const layer = 'fis:s_plz'
const bbox = [387000, 5812000, 386000, 5813000]

const features = getFeatures(endpoint, layer, {bbox}
for await (const feature of features) {
	console.log(feature)
}
```

It will return data in the [`xml-reader`](https://www.npmjs.com/package/xml-reader) shape:

```js
{
	name: 'fis:s_plz',
	type: 'element',
	value: '',
	parent: {
		name: 'wfs:member',
		type: 'element',
		value: '',
		parent: { /* … */ },
		attributes: {},
		children: [ /* … */ ]
	},
	attributes: {
		'gml:id': 's_plz.12165'
	},
	children: [{
		name: 'fis:plz',
		type: 'element',
		value: '',
		parent: [ /* … */ ],
		attributes: {},
		children: [{
			name: '',
			type: 'text',
			value: '12165',
			parent: [ /* … */ ],
			attributes: {},
			children: [],
		}]
	}, {
		name: 'fis:finhalt',
		type: 'element',
		value: '',
		parent: [ /* … */ ],
		attributes: {},
		children: [{
			name: '',
			type: 'text',
			value: '945018.6987053645',
			parent: [ /* … */ ],
			attributes: {},
			children: [],
		}]
	}, {
		name: 'fis:geom',
		type: 'element',
		value: '',
		parent: [ /* … */ ],
		attributes: {},
		children: [{
			name: 'gml:Polygon',
			type: 'element',
			value: '',
			parent: [ /* … */ ],
			attributes: { 'gml:id': 'P1' },
			children: [ /* … */ ],
		}]
	}]
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
		name: 'fis:s_plz',
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
