var app = angular.module('calculator', ["ui.bootstrap"]);

app.controller("form", ["$scope", function($scope) {

    $scope.Math = window.Math;

    $scope.okresy = Object.keys(obce);
    $scope.stavby = Object.keys(stavby);

    $scope.$watch("okres", function(o, n){
        $scope.pocetObyvatel = null;
        $scope.obec = null;
        if (o){
            $scope.obce = Object.keys(obce[o]);
        }
    });

    $scope.$watch("obec", function(o, n){
        $scope.pocetObyvatel = null;
        if (o){
            $scope.pocetObyvatel = obce[$scope.okres][o][0];
            $scope.pocetVozidel = obce[$scope.okres][o][1];
        }
    });

    $scope.recalculate = function(){
        //console.log("recalculating...");
        if (!$scope.soucinitelAutomobilizaceRucne) {
            if ($scope.pocetObyvatel && $scope.pocetVozidel) {
                $scope.stupenAutomobilizace = Math.round(1000 / $scope.pocetObyvatel * $scope.pocetVozidel);
                $scope.soucinitelAutomobilizace = Math.round(100 * ($scope.stupenAutomobilizace / 400)) / 100;
            } else {
                $scope.stupenAutomobilizace = null;
                $scope.soucinitelAutomobilizace = null;
            }
        }

        var transport;

        if (!$scope.transports) {
            $scope.transports= [{}];
        }

        $scope.transportTypes = [
            {id: "bus", name: "Bus"},
            {id: "tram", name: "Tramvaj"},
            {id: "metro", name: "Metro"}
        ];
        var spolehlivost = {bus: 1.8, tram: 1.4, metro: 1.2};
        $scope.indexDostupnosti = 0;
        for (t in $scope.transports) {
            transport = $scope.transports[t];

            if (transport.FrekvenceSpoju) {
                transport.CekaciDoba = Math.round(10 * 0.5 * spolehlivost[transport.type.id] * 60 / transport.FrekvenceSpoju) / 10;
            } else {
                transport.CekaciDoba = null;
            }

            if (transport.DochazkovaVzdalenost) {
                transport.DobaDochazky = Math.round(10 * (transport.DochazkovaVzdalenost / 1.4 / 60)) / 10;
            } else {
                transport.DobaDochazky = null;
            }

            if (transport.DobaDochazky !== null && transport.CekaciDoba !== null) {
                transport.SoucinitelNastupniDoby = transport.CekaciDoba + transport.DobaDochazky;
                transport.MernaFrekvenceSpoju = Math.round(10 * (60 / transport.SoucinitelNastupniDoby)) / 10;
            } else {
                transport.SoucinitelNastupniDoby = null;
                transport.MernaFrekvenceSpoju = null;
            }

            $scope.indexDostupnosti += transport.MernaFrekvenceSpoju;
        }

        if ($scope.indexDostupnosti < 10){
            $scope.stupenDostupnosti = 1;
            $scope.charakterUzemiDoporuceny = "A";
        }else if($scope.indexDostupnosti < 20){
            $scope.stupenDostupnosti = 2;
            $scope.charakterUzemiDoporuceny = "A";
        }else if($scope.indexDostupnosti < 30){
            $scope.stupenDostupnosti = 3;
            $scope.charakterUzemiDoporuceny = "B";
        }else{
            $scope.stupenDostupnosti = 4;
            $scope.charakterUzemiDoporuceny = "C";
        }

        $scope.soucinitelRedukcePoctuStani = null;
        if ($scope.charakterUzemi && $scope.pocetObyvatel) {
            if ($scope.pocetObyvatel < 5000){
                $scope.skupina = 1
            }else if($scope.pocetObyvatel < 50000) {
                $scope.skupina = 2
            }else{
                $scope.skupina = 3
            }


            if ($scope.charakterUzemi.toUpperCase() === "A") {
                $scope.soucinitelRedukcePoctuStani = 1;
            }
            if ($scope.charakterUzemi.toUpperCase() === "B") {
                if ($scope.skupina == 2) {
                    $scope.soucinitelRedukcePoctuStani = 0.8;
                }
                if ($scope.skupina == 3) {
                    $scope.soucinitelRedukcePoctuStani = 0.6;
                }
            }
            if ($scope.charakterUzemi.toUpperCase() === "C") {
                if ($scope.skupina == 2) {
                    $scope.soucinitelRedukcePoctuStani = 0.4;
                }
                if ($scope.skupina == 3) {
                    $scope.soucinitelRedukcePoctuStani = 0.25;
                }
            }
        }

        if (!$scope.stavbyList) {
            $scope.stavbyList = [{}];
        }
        $scope.celkovyPocetStani = 0;
        for (stavba in $scope.stavbyList) {
            stavba = $scope.stavbyList[stavba];

            if (stavba.druhStavby) {
                var indexOfDruhStavby = Object.keys(stavby).indexOf(stavba.druhStavby);
                stavba.odstavna = 1 <= indexOfDruhStavby && indexOfDruhStavby <= 6;
                if (stavby[stavba.druhStavby]) {
                    stavba.jednotky = Object.keys(stavby[stavba.druhStavby]);
                    stavba.jednotkyNa1 = stavby[stavba.druhStavby];
                    if (!stavba.poctyJednotek) {
                        stavba.poctyJednotek = {};
                    }
                    if (!stavba.jednotkyNa1Value) {
                        stavba.jednotkyNa1Value = {};
                    }
                    stavba.pocetOdstavnychStani = 0;
                    for (j in stavba.jednotky) {
                        var jednotka = stavba.jednotky[j];
                        if (!stavba.jednotkyNa1Value[jednotka]) {
                            if (stavba.jednotkyNa1[jednotka][1]) {
                                stavba.jednotkyNa1Value[jednotka] = stavba.jednotkyNa1[jednotka][0];
                            } else {
                                stavba.jednotkyNa1Value[jednotka] = stavba.jednotkyNa1[jednotka];
                            }
                        }
                        if (stavba.poctyJednotek[jednotka]) {
                            stavba.pocetOdstavnychStani += Math.round(100 * stavba.poctyJednotek[jednotka] / stavba.jednotkyNa1Value[jednotka]) / 100;
                        }
                    }
                    if (stavba.odstavna) {
                        $scope.celkovyPocetStani += stavba.pocetOdstavnychStani * $scope.soucinitelAutomobilizace;
                    }else{
                        $scope.celkovyPocetStani += stavba.pocetOdstavnychStani * $scope.soucinitelAutomobilizace * $scope.soucinitelRedukcePoctuStani;
                    }
                } else {
                    stavba.jednotky = [];
                    stavba.poctyJednotek = {};
                    stavba.pocetOdstavnychStani = null;
                }
            }
        }

        $scope.celkovyPocetStani = Math.round(100 * $scope.celkovyPocetStani) / 100;
    };

    $scope.$watch("pocetObyvatel", $scope.recalculate);
    $scope.$watch("soucinitelAutomobilizace", $scope.recalculate);
    $scope.$watch("soucinitelAutomobilizaceRucne", $scope.recalculate);
    $scope.$watch("pocetVozidel", $scope.recalculate);
    $scope.$watch("charakterUzemi", $scope.recalculate);
    $scope.$watch("stavbyList", $scope.recalculate, true);
    $scope.$watch("transports", $scope.recalculate, true);
}]);