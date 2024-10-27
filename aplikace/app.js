var app = angular.module('calculator', ["ui.bootstrap"]);

app.controller("form", ["$scope", function($scope) {

    $scope.Math = window.Math;

    $scope.okresy = Object.keys(okresy);
    $scope.obce   = Object.keys(obce);
    $scope.stavby = Object.keys(stavby);

    $scope.viewOkresy = $scope.okresy;
    $scope.viewObce = $scope.obce;

    $scope.$watch("okres", function(o, n) {
        if (o) {
            // Skontroluj jestli je okres validní nebo ne
            if ($scope.okresy.includes(o)) {
                // Kontrola jestli je zadána obec a kontrola jestli se obec nachází v okresu
                if ($scope.obec && !okresy[o].includes($scope.obec)) {
                    console.log("Obec se nenachází v zadaném okresu")
                    $scope.obec = null
                    $scope.viewObce = $scope.okresy[o] || $scope.obce;
                }
                $scope.okres = o
                $scope.viewObce = $scope.okresy[o] || $scope.obce;
                return
            }
            $scope.okres = null
            console.log($scope.viewOkresy, $scope.viewObce)
        }
        $scope.viewOkresy = $scope.okresy;
    });

    $scope.$watch("obec", function(o, n) {
        if (o) {
            // Skontroluj jestli je obec validní nebo ne
            if ($scope.obce.includes(o)) {
                // Kontrola jestli je zadán okres a kontrola jestli zadaná obec patří do okresu
                if ($scope.okres && !obce[o].includes($scope.okres)) {
                    console.log("Okres nepatří k zadané obci")
                    $scope.okres = null
                    $scope.viewOkresy = $scope.obce[o] || $scope.okresy;
                }
                $scope.obec = o
                $scope.viewOkresy = $scope.obce[o] || $scope.okresy;
                return
            }
            $scope.obec = null
            console.log($scope.viewOkresy, $scope.viewObce)
        }
        $scope.viewObce = $scope.obce;
    });

    $scope.onFocus = function (e) {
        $(e.target).trigger("input");
        $(e.target).trigger("change"); // for IE
    };

    $scope.recalculate = function() {
        if (!$scope.stavbyList) {
            $scope.stavbyList = [{}]; // Vloží prázdnou stavbu pokud je stránka načtena prvně
        }
        for (stavba in $scope.stavbyList) {
            stavba = $scope.stavbyList[stavba];
            console.log(stavba)
            if (stavba.druhStavby) {
                if (stavby[stavba.druhStavby]) {
                    stavba.jednotky = Object.values(stavby[stavba.druhStavby]);
                    if (!stavba.poctyJednotek) {
                        stavba.poctyJednotek = {};
                        stavba.kr = 0.0
                        stavba.dl = 0.0
                    }
                    for (j in stavba.jednotky) {
                        var jednotka = stavba.jednotky[j];
                        if (stavba.poctyJednotek[jednotka]) {
                            koeficient = stavba.koeficient / 100 || 1 // Redukční koeficient
                            pocet = stavba.poctyJednotek[jednotka]
                            stavba.kr = (pocet / jednotka.metric) * jednotka.kr * koeficient // Dlouhodobé stáni
                            stavba.dl = (pocet / jednotka.metric) * jednotka.dl * koeficient // Krátkodobé stání
                        }
                    }
                } else {
                    stavba.druhStavby = ""; stavba.kr = 0.0; stavba.dl = 0.0; stavba.poctyJednotek = {}; stavba.koeficient = null // Pokud je vybrána skupina tak vyčisti počítadlo
                }
            }
        }
        $scope.kr = Math.round($scope.stavbyList.filter((o) => o.druhStavby != "").reduce((sum, stavba) => sum + (stavba.kr || 0.0), 0))
        $scope.dl = Math.round($scope.stavbyList.filter((o) => o.druhStavby != "").reduce((sum, stavba) => sum + (stavba.dl || 0.0), 0))
    };

    $scope.$watch("stavbyList", $scope.recalculate, true);

}]);