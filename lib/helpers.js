'use strict'

const findIn = (root, ...tags) => {
	if (!root) return null
	let el = root
	for (let tag of tags) {
		if (!el.children) return null
		const child = el.children.find(c => c !== el && c.name === tag)
		if (!child) return null
		el = child
	}
	return el
}

const textOf = (el) => {
	if (!el || !el.children) return null
	const c = el.children.find(c => c.type === 'text')
	return c && c.value || null
}

const attrOf = (el, attr) => el && el.attributes && el.attributes[attr] || null

module.exports = {findIn, textOf, attrOf}
