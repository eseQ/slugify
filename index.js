'use strict';
var escapeStringRegexp = require('escape-string-regexp');
var transliterate = require('@sindresorhus/transliterate');
var builtinOverridableReplacements = require('./overridable-replacements');

function decamelize(string) {
	return string
		// Separate capitalized words.
		.replace(/([A-Z]{2,})([a-z\d]+)/g, '$1 $2')
		.replace(/([a-z\d]+)([A-Z]{2,})/g, '$1 $2')

		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2');
};

function removeMootSeparators(string, separator) {
	var escapedSeparator = escapeStringRegexp(separator);

	return string
		.replace(new RegExp(`${escapedSeparator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${escapedSeparator}|${escapedSeparator}$`, 'g'), '');
};

module.exports = function (initString, options) {
	if (typeof initString !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof initString}\``);
	}
	
	var str = initString;

	options = Object.assign({
		separator: '-',
		lowercase: true,
		decamelize: true,
		customReplacements: [],
		preserveLeadingUnderscore: false,
	}, options);

	var shouldPrependUnderscore = options.preserveLeadingUnderscore && str.startsWith('_');
	
	var customReplacements = [].concat(builtinOverridableReplacements).concat(options.customReplacements).filter(Boolean);

	str = transliterate(str, {customReplacements});

	if (options.decamelize) {
		str = decamelize(str);
	}

	var patternSlug = /[^a-zA-Z\d]+/g;

	if (options.lowercase) {
		str = str.toLowerCase();
		patternSlug = /[^a-z\d]+/g;
	}

	str = str.replace(patternSlug, options.separator);
	str = str.replace(/\\/g, '');
	str = removeMootSeparators(str, options.separator);

	if (shouldPrependUnderscore) {
		str = `_${str}`;
	}

	return str;
};
