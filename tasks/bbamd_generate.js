/*
 * grunt-bbamd_generate
 * https://github.com/jmanuelrp/bb-amd-generator
 *
 * Copyright (c) 2013 JManuel Ruiz
 * Licensed under the MIT license.
 */

'use strict';

var path      = require('path');
var swig      = require('swig');
var inflected = require('inflected');

swig.setFilter('classify', function (input) {
  return inflected.classify(input);
});

swig.setFilter('singularize', function (input) {
  return inflected.singularize(input);
});

swig.setFilter('pluralize', function (input) {
  return inflected.pluralize(input);
});

swig.setFilter('titleize', function (input) {
  return inflected.titleize(input);
});

module.exports = function (grunt) {

  grunt.registerMultiTask('bbamd_generate', 'Backbone AMD generator.', function ( name ) {

    var options = this.options({
      appname: null,
      source: 'js/backbone',
      mixins: false,
      setAMDName: false
    });

    var elements = (function() {
      var elements = [
        { tplname: 'view.swig'       ,extension: '.js'   ,name: 'view'       },
        { tplname: 'model.swig'      ,extension: '.js'   ,name: 'model'      },
        { tplname: 'collection.swig' ,extension: '.js'   ,name: 'collection' },
        { tplname: 'router.swig'     ,extension: '.js'   ,name: 'router'     },
        { tplname: 'module.swig'     ,extension: '.js'   ,name: 'module'     },
        { tplname: 'template.swig'   ,extension: '.swig' ,name: 'template'   }
      ];

      var _get = function(name) {
        if (typeof name === 'undefined' || !name)
        {
          return null;
        }

        for (var i = 0; i < elements.length; i++) {
          if( elements[i].name === name )
          {
            return elements[i];
          }
        }

        return null;
      };

      return {
        has: function(name) {
          return (_get(name)!==null)? true : false;
        },
        get: function(name) {
          return _get(name);
        }
      };
    })();

    var ElementCreator = function (el, options) {
      var template, tplpath;

      tplpath = path.join(__dirname, '..', 'templates', 'javascript', el.tplname);
      template = grunt.file.read( tplpath );

      return {
        make: function( name ) {
          var filepath, content, message, data;

          if( typeof name === 'undefined' ){
            grunt.fail.warn('The name has not been specified.');
            name = 'name';
          }

          filepath = path.join(
            options.source,
            inflected.pluralize(el.name),
            (el.name==='collection'?inflected.pluralize(name):name)+el.extension
          );

          if( grunt.file.exists(filepath) ){
            grunt.fail.warn('File already exists ('+ filepath +').');
          }
 
          content = swig.render(template, { locals: {
            app: options.appname,
            mix: options.mixins,
            amd: options.setAMDName,
            name: name,
            classname: inflected.classify(name)
          }});

          grunt.file.write(filepath, content);

          message = 'Great! '+ name +' '+ el.name +' has been created ('+ filepath +').';
          grunt.log.writeln(message);

        }
      };
    };

    var f = new ElementCreator(elements.get(this.target), options);
    f.make( name );
  });

};
