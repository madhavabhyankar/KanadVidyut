

kanadPhotonModule.controller('headerController', ['$scope', '$location',
function($scope, $location) {
    $scope.showMail = function() {
        $location.path('/ContactUs');
    }
    $scope.showPhoneAndFax= function() {
        alert("showing fax and phone");
    }
}])

kanadPhotonModule.controller('navController', ['$scope', '$location', 'productService',

    function ($scope, $location, productService) {
        $scope.isCollapsed = true;
        productService.getProductCatatories().then(
            function(result) {
                $scope.catagories = result;
            }, function() {
                //error;
            });
        
    }

])