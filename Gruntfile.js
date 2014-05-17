module.exports = function(grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.initConfig({
		jshint: {
			options: {
				'smarttabs': true
			},
			all: ['Gruntfile.js', 'pages/*/*.js', 'package.json']
		},
		less: {
			development: {
				options: {
					rootpath: 'css',
					files: { 'style.css': 'style.less' }
				}
			}
		},			
		qunit: {
			files: [ 'tests/*.html' ]
		}		
	});
	grunt.registerTask('default', ['jshint', 'qunit', 'less']);	
};