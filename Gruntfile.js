/**
 * grunt打包脚本
 * 模板文件由gexiaowei<ganxiaowei@gmail.com>提供
 */

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['src/*.js']
        },
        clean: {
            all: ['dist/']
        },
        uglify: {
            all: {
                options: {
                    sourceMap: true
                },
                files: [{
                    'dist/angular-request.js': ['src/base64.js', 'src/angular-base64.js', 'src/packet.js', 'src/angular-packet.js', 'src/angular-request.js'],
                    'dist/request.js': ['src/base64.js', 'src/packet.js', 'src/request.js']
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['jshint', 'clean', 'uglify:all']);

};