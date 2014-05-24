module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: false,
        banner: '/* <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */\n(function(window){\n',
        footer: '\nwindow.symbolTyper = symbolTyper; \n}(this));',
        process: function(src, filepath) {
            return '/* ' + filepath +' begins : */\n' + src + '\n/* '+filepath+' ends. */\n';
        }
      },
      build: {
        src: [
          'src/utils.js',
          'src/symbol.js',
          'src/caret.js',
          'src/target.js',
          'src/typer.js',
          'src/main.js'
          ],
        dest: 'symbolTyper.js',
      }
    },
    watch : {
      scripts: {
        files: ['src/*.js'],
        tasks: ['concat'],
        options: {
          spawn: false,
          livereload : true
        }
      }
    },
    mergejs : {
      options : {
        test : 3
      },
      files : {
        src : 'src',
        dest : 'dest'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'watch']);


grunt.registerMultiTask('mergejs', 'Merge javascript files', function() {
  grunt.log.writeln(this.target + ': ' + this.data);
  grunt.log.writeln(this.options().test);
});

};