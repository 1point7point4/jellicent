'use strict';

const {resolve} = require("path");
const browserify = require("browserify");
const {format} = require("prettier");
const derequire = require("derequire");

const filenames = {
  min: "jellicent.pre-min.js",
  test: "jellicent-test.js"
};

const bannerTemplate = (
  `/*! jellicent v<%= pkg.version %> <%= grunt.template.today("mmmm dd, yyyy") %> */`
);

module.exports = function(grunt) {
  const srcFilePath = require.resolve('../../source/index.js');

  grunt.registerTask(
    'browserify',
    'Compile the source with Browserify',
    function(mode) {
      const filename = filenames[mode] || "jellicent.js";

      // This file will not exist until it has been built
      const libFilePath = resolve(`lib/${filename}`);

      // Reading and writing files is asynchronous
      const done = this.async();

      // Render the banner for the top of the file
      const banner = grunt.template.process(bannerTemplate);

      // Invoke Browserify programatically to bundle the code
      let browserified = browserify(srcFilePath, {

        /* If no module system is being used, define the module as a global
          variable 'jellicent'.
        */
        standalone: "jellicent"
      });

      if (mode === "min") {
        browserified = browserified.exclude("../../docs/reference/data.json");
      }

      const babelifyOpts = { plugins: ['static-fs'] };

      if (mode === "test") {
        babelifyOpts.envName = 'test';
      }

      const bundle = browserified.transform('babelify', babelifyOpts).bundle();

      // Start the generated output with the banner comment,
      let code = banner + '\n';

      // Then read the bundle into memory so we can run it through derequire
      bundle
        .on('data', function(data) {
          code += data;
        })
        .on('end', function() {

          // "code" is complete: create the distributable UMD build by running
          // the bundle through derequire
          // (Derequire changes the bundle's internal "require" function to
          // something that will not interfere with this module being used
          // within a separate browserify bundle.)
          code = derequire(code);

          // and prettify the code
          if (mode !== "min") {
            code = format(code, {
              singleQuote: true,
              printWidth: 80 + 12,
              parser: "babel"
            });
          }

          // finally, write it to disk
          grunt.file.write(libFilePath, code);

          // Print a success message
          grunt.log.writeln(
            '>>'.green + ' Bundle ' + ('lib/' + filename).cyan + ' created.'
          );

          // Complete the task
          done();
        });
    }
  );
};
