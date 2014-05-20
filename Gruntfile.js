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
				files: { 'css/style.css': 'css/style.less' }
			}
		},
		watch: {
			less: {
				files: ['css/*.less'],
				tasks: [ 'less' ]
			}
		},	
		qunit: {
			files: [ 'tests/*.html' ]
		}		
	});
	grunt.registerTask('default', ['jshint', 'qunit', 'less']);	
	grunt.registerTask('start-watching', 'watch');
};