(function () {
  angular
      .module('selectCity', [])
      .controller('SelectCityCtrl', function ($scope) {
      })
      .directive('selectCity', function ($http, $q, $compile) {

        var cityURL = 'data/city-data.js', templateURL = 'template/template.html', delay;
        delay = $q.defer();

        $http.get(cityURL).success(function (data) {
          return delay.resolve(data);
        });

        return {
          restrict: 'A',
          scope: {ngModel: '='},
          link: function (scope, element) {
            scope.province = null;
            scope.region = null;
            scope.city = null;
            scope.details = null;

            var popup = {
              domNode: null,
              resize: function () {
                if (!!popup.domNode) {
                  popup.domNode.css({
                    top: element.offset().top + element.height() * 2,
                    left: element.offset().left
                  });
                }
              },
              init: function () {
                element.on('click', function (event) {

                  angular.element('.city-select-container').hide();

                  popup.domNode.show();
                  popup.resize();

                  //IE doesn't support event.preventDefault and event.stopPropagation
                  if (event.preventDefault && event.stopPropagation) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                  else {
                    window.event.returnValue = false;
                  }

                });

                angular.element(document).on('click', function () {
                  popup.domNode.hide();
                });

                popup.domNode.on('click', function (event) {

                  if (event.preventDefault && event.stopPropagation) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                  else {
                    window.event.returnValue = false;
                  }
                });
              }
            };

            return delay.promise.then(function (data) {
              $http.get(templateURL).success(function (template) {
                var $template = $compile(template)(scope);
                angular.element('body').append($template);
                popup.domNode = angular.element($template[2]);//2 index is the dom node
                scope.provinces = data;

                popup.init();
              });
              scope.select = {
                selectProvince: function (province) {
                  scope.province = province;
                  scope.city = scope.region = scope.details = null;
                },
                selectCity: function (city) {
                  scope.city = city;
                  scope.region = scope.details = null;
                },
                selectRegion: function (region) {
                  scope.region = region;
                  scope.details = null;
                }
              };
              scope.clear = function () {
                scope.ngModel = scope.province = scope.city = scope.region = scope.details = null;
                popup.domNode.hide();
              };
              scope.submit = function () {
                popup.domNode.hide();
              };
              scope.$watch('province', function (newV) {
                var i, result = [];
                if (newV) {
                  //Load the cities
                  for (i = 0; i < data.length; i++) {
                    if (data[i].p === newV) {
                      result.push(scope.cities = data[i].c);
                    }
                  }
                  return result;
                } else {
                  return scope.cities = null;
                }
              });
              scope.$watch('city', function (newV) {
                var i, result = [];
                if (newV) {
                  //Load the regions
                  for (i = 0; i < scope.cities.length; i++) {
                    if (scope.cities[i].n === newV) {
                      result.push(scope.regions = scope.cities[i].a);
                    }
                  }
                  return result;
                } else {
                  return scope.regions = null;
                }
              });

              return scope.$watch(function () {
                //Fix the two-way data binding issue
                if (scope.province || scope.city || scope.region || scope.details) {
                  scope.ngModel = '';
                }

                if (scope.province) {
                  scope.ngModel += scope.province;
                }
                if (scope.city) {
                  scope.ngModel += " " + scope.city;
                }
                if (scope.region) {
                  scope.ngModel += " " + scope.region;
                }
                if (scope.details) {
                  scope.ngModel += " " + scope.details;
                }
                return popup.resize();
              });
            });
          }
        };
      });
})();
