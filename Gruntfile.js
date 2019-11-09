/* This script takes heavy inspiration from:
  https://github.com/processing/p5.js/blob/master/Gruntfile.js
*/

module.exports = (grunt) => {
  const gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    /* This minifies the javascript into a single file, and adds a banner to the
      front of the file.
    */
    uglify: {
      options: {
        compress: {
          global_defs: {
            IS_MINIFIED: true
          }
        },
        banner:
          '/*! jellicent v<%= pkg.version %> <%= grunt.template.today("mmmm dd, yyyy") %> */ '
      },
      dist: {
        files: {
          'lib/jellicent.min.js': 'lib/jellicent.pre-min.js'
        }
      }
    },
  };

  grunt.initConfig(gruntConfig);

  // Load tasks relevant to 'build'
  grunt.loadTasks('tasks/build');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // CURRENTLY FIXING: uglify

  grunt.registerTask('build', [
    'browserify',
    'browserify:min',
    'uglify',
    'browserify:test'
  ]);
};
