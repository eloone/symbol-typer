module.exports = function(grunt) {
  var NODE_MODULES_DIR = '../../node_modules';
  var header = ['src/wrappers/header.js'];
  var build = header.concat([
          'src/utils.js',
          'src/symbol.js',
          'src/caret.js',
          'src/target.js',
          'src/typer.js',
          'src/symbolTyper.js'
  ]);
  var plainBuild = build.concat('src/wrappers/footer.js');
  var jqueryBuild = build.concat(['src/symbolTyper.jquery.js', 'src/wrappers/footer.jquery.js']);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: false,
        banner: '/*\n<%= pkg.author %> <%= pkg.license %> \n<%= pkg.signature %>\n<%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n*/\n',
        process: function(src, filepath) {
            return '/* ' + filepath +' begins : */\n' + src + '\n/* '+filepath+' ends. */\n';
        }
      },
      plain : {
        src: plainBuild,
        dest: 'symbolTyper.<%= pkg.version %>.js'
      },
      jQuery : {
        src : jqueryBuild,
        dest: 'symbolTyper-jquery.<%= pkg.version %>.js'
      }
    },
    uglify : {
        js: {
            files: {
                'symbolTyper.<%= pkg.version %>.min.js' : [ 'symbolTyper.<%= pkg.version %>.js' ],
                'symbolTyper-jquery.<%= pkg.version %>.min.js' : ['symbolTyper-jquery.<%= pkg.version %>.js']
            }
        }
    },
    watch : {
      scripts: {
        files: ['src/*.js', 'main.js'],
        tasks: ['concat', 'uglify'],
        options: {
          spawn: false,
          livereload : true
        }
      }
    }
  });

  grunt.loadNpmTasks(NODE_MODULES_DIR+'/grunt-contrib-concat');
  grunt.loadNpmTasks(NODE_MODULES_DIR+'/grunt-contrib-watch');
  grunt.loadNpmTasks(NODE_MODULES_DIR+'/grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'watch']);

};
