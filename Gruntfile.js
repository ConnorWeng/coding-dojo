module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
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
  grunt.loadNpmTasks('grunt-contrib-watch');
};
