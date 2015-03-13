angular.module("Prometheus.controllers").controller('GaugeCtrl',
                                                    ["$scope",
                                                      "$http",
                                                      "$timeout",
                                                      "SharedWidgetSetup",
                                                      "URLGenerator",
                                                      function($scope,
                                                               $http,
                                                               $timeout,
                                                               SharedWidgetSetup,
                                                               URLGenerator) {
  SharedWidgetSetup($scope);
  $scope.errorMessages = [];

  // Query for the data.
  $scope.refreshGraph = function() {
    var exp = $scope.graph.expression;
    var server = $scope.serversById[exp.serverID || 1];
    if (server === undefined) {
      return;
    }
    $scope.requestInFlight = true;
    $http.get(URLGenerator(server.url, '/api/query'), {
      params: {
        expr: exp.expression
      }
    }).then(function(payload) {
      var data = payload.data;
      var errMsg;
      switch(data.Type || data.type) {
        case 'error':
          errMsg = "Expression " + exp.expression + ": " + (data.Value || data.value);
          $scope.errorMessages.push(errMsg);
          break;
        case 'vector':
          var inc = Math.round((Math.random() - 0.5) * 200);
          var d = parseFloat(data.value[0].value);
          d += inc;

          $scope.$broadcast('redrawGraphs', d);
          $scope.errorMessages = [];
          break;
        default:
          errMsg = 'Expression ' + exp.expression + ': Result type "' + (data.Type || data.type) + '" cannot be graphed."';
          $scope.errorMessages.push(errMsg);
      }
    }, function(data, status, b) {
      var errMsg = "Expression " + exp.expression  + ": Server returned status " + status + ".";
      $scope.errorMessages.push(errMsg);
    }).finally(function() {
      $scope.requestInFlight = false;
    });
  };

  var refresh;
  function refreshLoop() {
    refresh = $timeout(function() {
      $scope.refreshGraph();
      refreshLoop();
    }, ($scope.graph.refresh*1000) || 1000);
  }

  $scope.refreshGraph();
  refreshLoop();
  $scope.$watch('graph.refresh', function() {
      $timeout.cancel(refresh);
      refreshLoop();
  });


  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);
