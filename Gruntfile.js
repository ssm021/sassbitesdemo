'use strict';

module.exports = function (grunt) {
  var target = grunt.option('target') || '*';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // https://github.com/sindresorhus/grunt-shell
    shell: {
      bundler: {
        command: 'bundle'
      },
      bower: {
        command: 'bower install'
      }
    },


    // https://www.npmjs.org/package/grunt-bower-concat
    bower_concat: {
      all: {
        dest: 'build/js/_bower.js',
        exclude: [
          'Cortana',
        ],
      }
    },

    // Grunt Contrib Compass
    // https://github.com/gruntjs/grunt-contrib-compass
    compass: {
      options: {
       config: 'config.rb',
       bundleExec: 'true'
      },
      dev: {
        options: {
          environment: 'development',
          outputStyle: 'expanded',
        }
      },
    },

    // http://trulia.github.io/hologram/
    // https://www.npmjs.org/package/grunt-hologram
    hologram: {
      generate: {
        options: {
          config: './hologram/hologram_config.yml'
        }
      }
    },

    // Grunt connect
    // https://github.com/gruntjs/grunt-contrib-connect
    connect: {
      server: {
       options: {
        livereload: 1337,
        port: 9001,
        base: './',
        open: {
          target: 'http://localhost:9001/build/styleguide/',
        }
       }
     },
     test: {
       options: {
        livereload: 1337,
        port: 9001,
        base: './',
       }
     }
    },

    // Watch for changes and trigger compass and livereload
    // https://github.com/gruntjs/grunt-contrib-watch
    watch: {
      compass: {
        files: ['sass/**/*.scss'],
        tasks: ['compass:dev']
      },
      hologram: {
        files: ['sass/**/*.scss'],
        tasks: ['hologram']
      },
      livereload: {
        options: {
          livereload: 1337
        },
        files: [
          'build/styleguide/**/*',
        ]
      }
    },

    // https://github.com/micahgodbolt/grunt-phantomcss/tree/alt-runner
    phantomcss: {
       options: {
         mismatchTolerance: 0.05,
         logLevel: 'error',
         cleanupComparisonImages: true,
       },
       sass: {
         options: {
           screenshots: 'baselines',
           results: 'results',
           viewportSize: [1280, 800],
         },
         src: [
            './sass/**/' + target + '-test.js'
         ]
       },
     },

  });


  grunt.loadNpmTasks('@micahgodbolt/grunt-phantomcss');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-hologram');

  grunt.registerTask('default', [
    'shell:bundler',
    'shell:bower',
    'bower_concat',
    'compass:dev',
    'hologram',
    'connect:server',
    'watch'
  ]);


  grunt.registerTask('test', function(tests, isNew) {
    if (tests == undefined) {
      grunt.config.set('phantomcss.sass.src', 'sass/**/*-test.js');
    }
    else if (tests == 'new') {
      grunt.task.run('_testClean:' + '*' );
      grunt.config.set('phantomcss.sass.src', 'sass/**/*-test.js');
    }
    else if (tests == 'clean') {
      grunt.task.run('_testClean:' + '*' );
      return;
    }
    else {
      if (isNew == 'new') {
        grunt.task.run('_testClean:' + tests );
      };
      grunt.config.set('phantomcss.sass.src', 'sass/**/' + tests + '-test.js');
    }
    grunt.task.run('phantomcss');
  });



  // testClean is a private method that will wipe out the baseline folder adjacent to the test file you pass in via the param
  // grunt testClean:featured-item will remove the baseline folder adjacent to featured-item-test.js
  grunt.registerTask('_testClean', function(option) {
    if (option == undefined) {
      grunt.fail.fatal('A test file must be specified for testClean. You can also pass "*" to remove all baselines ');
    };
    grunt.file.expand(['sass/**/' + option + '-test.js']).forEach(function(filepath) {
      var directory;
      directory = require('path').dirname(filepath);
      grunt.file.delete(directory + '/baseline');
    })
  });



};
