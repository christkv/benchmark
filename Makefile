NODE = node
NPM = npm
JSDOC = jsdoc
name = all

#
# Generate the ES5 versions of the files
#
generate:
	./node_modules/.bin/babel --presets="es2015" lib/benchmark.js -o es5/benchmark.js
	./node_modules/.bin/babel --presets="es2015" lib/suite.js -o es5/suite.js
