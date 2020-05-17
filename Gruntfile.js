"use strict";

module.exports = function (grunt) {
  grunt.initConfig({
    dir: {
      webapp: "webapp",
      dist: "dist",
      bower_components: "bower_components",
      prod: "../public",
    },

    connect: {
      options: {
        port: 7070,
        hostname: "localhost",
        livereload: 35829,
        middleware: function (connect, options, defaultMiddleware) {
          var proxy = require("grunt-connect-proxy/lib/utils").proxyRequest;
          return [proxy].concat(defaultMiddleware);
        },
      },
      src: {},
      dist: {},
      proxies: [
        {
          context: "/api",
          host: "localhost",
          port: 2222,
          https: false,
          xforward: false,
        },
      ],
    },

    openui5_connect: {
      options: {
        resources: [],
      },
      src: {
        options: {
          appresources: "<%= dir.webapp %>",
        },
      },
      dist: {
        options: {
          appresources: "<%= dir.dist %>",
        },
      },
    },

    openui5_preload: {
      component: {
        options: {
          resources: {
            cwd: "<%= dir.webapp %>",
            prefix: "integrtr/platform",
          },
          dest: "<%= dir.dist %>",
        },
        components: true,
      },
    },

    clean: {
      dist: "<%= dir.dist %>/",
      prod: "<%= dir.prod %>/",
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: "<%= dir.webapp %>",
            src: ["**"],
            dest: "<%= dir.dist %>",
          },
        ],
      },
      prod: {
        files: [
          {
            expand: true,
            cwd: "<%= dir.dist %>",
            src: ["**", "!test.html", "!test/**"],
            dest: "<%= dir.prod %>",
          },
        ],
      },
    },

    eslint: {
      webapp: ["<%= dir.webapp %>"],
    },

    open: {
      root: {
        path: "http://localhost:7070/index.html",
        options: {
          delay: 500,
        },
      },
    },

    watch: {
      webapp: {
        files: "<%= dir.webapp %>/**",
        //tasks: ["eslint"]
      },
      livereload: {
        options: {
          livereload: "<%= connect.options.livereload %>",
        },
        files: ["<%= dir.webapp %>/**"],
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-openui5");
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-open");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-connect-proxy");

  // Server task
  grunt.registerTask("serve", function (target) {
    grunt.task.run("configureProxies:" + (target || "src"));
    //grunt.task.run('openui5_connect:' + (target || 'src') + ':keepalive');
    grunt.task.run("openui5_connect:" + (target || "src:livereload"));
  });

  // Linting task
  grunt.registerTask("lint", ["eslint"]);

  // Build task 	- copies it to dist only
  grunt.registerTask("build", ["clean", "openui5_preload", "copy:dist"]);

  // ProdBuild task - copies to public as well ( use with --force)
  grunt.registerTask("prodbuild", ["clean", "openui5_preload", "copy"]);

  // Default task
  grunt.registerTask("default", ["lint", "clean", "build", "serve:dist"]);
  //grunt.registerTask('default', ['lint', 'clean', 'build', 'serve:dist']);

  // Develop task (live-reloading)
  grunt.registerTask("develop", ["serve:dist", "open", "watch"]);
};
