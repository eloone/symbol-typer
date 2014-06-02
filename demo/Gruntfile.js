module.exports = function(grunt) {
  var NODE_MODULES_DIR = '../../../node_modules';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    assemble: {
      options: {
        development : true,
        root : '..',
        flatten: true,
        assets: 'assets',
        partials: ['tpl/partials/*.hbs'],
        layout: 'tpl/layouts/default.hbs',
        helpers: ['helpers/*.js' ]
      },
      main: {
        src: 'tpl/*.hbs',
        dest: '.'
      },
      jquery: {
        options: {
          layout: 'tpl/layouts/jquery.hbs'
        },
        files: {
          '.': ['tpl/jquery-demo.hbs']
        }
      }
    },
    watch : {
      scripts: {
        files: ['tpl/*', 'tpl/**/*', 'assets/*', 'assets/**/*', 'helpers/*'],
        tasks: ['assemble'],
        options: {
          spawn: false,
          livereload : 1300
        }
      }
    }
  });

  grunt.loadNpmTasks(NODE_MODULES_DIR+'/assemble' );
  grunt.loadNpmTasks(NODE_MODULES_DIR+'/grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['assemble', 'watch' ]);

};