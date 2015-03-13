angular.module("Prometheus.directives").directive('gaugeChart', ["$location", "$timeout", "WidgetHeightCalculator", "VariableInterpolator", "YAxisUtilities", function($location, $timeout, WidgetHeightCalculator, VariableInterpolator, YAxisUtilities) {
  return {
    restrict: "A",
    scope: {
      graphSettings: '=',
      aspectRatio: '=',
      vars: '='
    },
    link: function(scope, element, attrs) {
      var $el = $(element[0]);

      function redrawGraph() {
        if (!scope.gaugeData || !scope.graphSettings.max) {
          return;
        }

        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        var graphWidth = $el.width();
        $el.css('height', graphHeight);

        $el.find('.gauge_chart').empty();

        new Prometheus.Graph.Gauge({
          element: $el.find(".gauge_chart").get(0),
          width: graphWidth,
          height: graphHeight,
          value: scope.gaugeData,
          max: scope.graphSettings.max,
          units: scope.graphSettings.units,
          danger: scope.graphSettings.danger/100,
          warning: scope.graphSettings.warning/100,
        }).render();
      }

      scope.$watch('graphSettings.legendFormatString', redrawGraph);
      scope.$on('redrawGraphs', function(e, data) {
        if (data) {
          // How should an improper query be handled?
          scope.gaugeData = data;
        }
        redrawGraph();
      });
    },
  };
}]);
