'use strict'

const peek = require('peek-stream')
const iconv = require('iconv-lite')
const {Readable} = require('stream')
const {stringify} = require('qs')
const Promise = require('pinkie-promise')
const {fetch} = require('fetch-ponyfill')({Promise})
const xmlParser = require('xml-reader')

const createDecoder = () => {
	return peek({maxBuffer: 100}, (data, cb) => {
		const head = data.slice(0, 100).toString('utf8')
		const attr = /\sencoding="([^"]+)"/.exec(head)
		const encoding = attr && attr[1] && attr[1].toLowerCase() || 'utf-8'
		cb(null, iconv.decodeStream(encoding))
	})
}

const hasProp = (o, k) => Object.prototype.hasOwnProperty.call(o, k)

const defaults = {
	userAgent: 'https://github.com/derhuerst/alkis-berlin-client'
}

const createQuery = (endpoint, opt = {}) => {
	if ('string' !== typeof endpoint || !endpoint) {
		throw new Error('endpoint must be a non-empty string.')
	}
	opt = Object.assign({}, defaults, opt)

	const query = (query, parsers) => {
		const out = new Readable({objectMode: true, read: () => {}})

		query = Object.assign({
			service: 'WFS',
			version: '2.0.0'
		}, query)

		return fetch(endpoint + '?' + stringify(query), {
			mode: 'cors',
			redirect: 'follow',
			headers: {'User-Agent': opt.userAgent}
		})
		.then((res) => {
			if (!res.ok) {
				const err = new Error(res.statusText)
				err.statusCode = res.status
				throw err
			}

			const decoder = createDecoder()
			res.body.pipe(decoder)
			const parser = xmlParser.create({stream: true})
			// todo: xmlParser is no proper stream, hance has no backpressure
			decoder.on('data', data => parser.parse(data.toString('utf8')))

			const onError = (err) => {
				decoder.destroy()
				// todo: destroy parser
				out.destroy(err)
			}
			decoder.once('error', onError)
			parser.once('error', onError)

			const attachTagParser = (tag, parse) => {
				parser.on('tag:' + tag.toLowerCase(), (el) => {
					try {
						out.push(parse(el))
					} catch (err) {
						onError(err)
					}
				})
			}
			for (let tag in parsers) {
				if (!hasProp(parsers, tag)) continue

				const parser = parsers[tag]
				if ('function' !== typeof parser) {
					throw new Error(tag + ' parser is not a function.')
				}
				attachTagParser(tag, parser)
			}
			parser.once('done', () => out.push(null))
		})
		.catch(err => out.emit('error', err))

		return out
	}
	return query
}

module.exports = createQuery
