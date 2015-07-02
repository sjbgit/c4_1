/**
 * Created by sbunke on 6/22/2015.
 */
angular.module('services')
    .factory('socket', ['$rootScope', 'SOCKET_URL', function ($rootScope, SOCKET_URL) {
        var socket = io.connect(SOCKET_URL.URL); //'http://bppcount1.azurewebsites.net:80/');
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            }
            //how and when to disconnect?
        };
    }]);