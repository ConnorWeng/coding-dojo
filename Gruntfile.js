module.exports = function(grunt) {
  var jsFiles = [
    'public/javascripts/**/*.js',
    'routes/**/*.js',
    'lib/**/*.js',
    'test/**/*.js'
  ];

  grunt.initConfig({
    jshint: {
      files: jsFiles
    },
    watch: {
      lint: {
        tasks: ['jshint'],
        files: jsFiles
      },
      livereload: {
        files: [
          'public/javascripts/**/*.js',
          'public/stylesheets/**/*.css',
          'public/stylesheets/**/*.less',
          'views/**/*.jade'
        ],
        options:{
          livereload: true
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
