import peek from 'peek-stream'
import iconv from 'iconv-lite'
import _createFetch from 'fetch-ponyfill'
const {fetch} = _createFetch()
import createDebug from 'debug'
import xmlParser from 'xml-reader'

const debug = createDebug('query-fis-broker-wfs')

const createDecoder = () => {
	return peek({maxBuffer: 100}, (data, cb) => {
		const head = data.slice(0, 100).toString('utf8')
		const attr = /\sencoding="([^"]+)"/.exec(head)
		const encoding = attr && attr[1] && attr[1].toLowerCase() || 'utf-8'
		cb(null, iconv.decodeStream(encoding))
	})
}

const isObject = o => 'object' === typeof o && !Array.isArray(o)
const hasProp = (o, k) => Object.prototype.hasOwnProperty.call(o, k)

export const defaults = {
	userAgent: 'https://github.com/derhuerst/query-fis-broker-wfs'
}

export const request = async (endpoint, query, parsers, opt = {}) => {
	if ('string' !== typeof endpoint || !endpoint) {
		throw new Error('endpoint must be a non-empty string.')
	}
	if (!isObject(query)) throw new Error('query must be an object.')
	if (!isObject(parsers)) throw new Error('parsers must be an object.')
	if (!isObject(opt)) throw new Error('opt must be an object.')
	opt = {
		...defaults,
		...opt,
	}

	let url = new URL(endpoint)
	url.search = new URLSearchParams({
		service: 'WFS',
		version: '2.0.0',
		outputFormat: 'text/xml; subtype=gml/3.2.1',
		...query,
	})
	url = url.href
	debug('fetching', url)

	const res = await fetch(url, {
		mode: 'cors',
		redirect: 'follow',
		headers: {
			'User-Agent': opt.userAgent,
			'Accept': 'text/xml; subtype=gml/3.2.1',
		},
	})
	if (!res.ok) {
		const err = new Error(res.statusText)
		err.statusCode = res.status
		err.url = url
		err.res = res
		throw err
	}

	await new Promise((resolve, reject) => {
		const fail = (err) => {
			decoder.destroy()
			// todo: destroy parser
			reject(err)
		}

		const decoder = createDecoder()
		decoder.once('error', fail)
		res.body.pipe(decoder)

		// todo: xmlParser is no proper stream, hance has no backpressure
		const parser = xmlParser.create({stream: true})
		parser.once('error', fail)
		decoder.on('data', (data) => { // pipe
			parser.parse(data.toString('utf8'))
		})

		const attachTagParser = (tag, parse) => {
			parser.on('tag:' + tag, (el) => {
				try {
					parse(el)
				} catch (err) {
					fail(err)
				}
			})
		}
		for (const tag in parsers) {
			if (!hasProp(parsers, tag)) continue

			const parse = parsers[tag]
			if ('function' !== typeof parse) {
				throw new Error(tag + ' parser is not a function.')
			}
			attachTagParser(tag, parse)
		}

		parser.once('done', () => resolve())
	})
}
