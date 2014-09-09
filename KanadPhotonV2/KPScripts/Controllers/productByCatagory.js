var productByCatagory = ['$scope', '$stateParams', 'productService',
function ($scope, $stateParams, productService) {
    $scope.catagory = $stateParams.catagory;
    productService.getProductForCatagory($stateParams.catagory).then(function (result) {
        $scope.products = result;
    }, function() {

    });

    //    [
    //    { name: "Product ABC", broshureLink: '..\testlink\productabc.pdf' },
    //    { name: "Product ABC", broshureLink: '..\testlink\productabc.pdf' },
    //    { name: "Product ABC", broshureLink: '..\testlink\productabc.pdf' },
    //    { name: "Product ABC", broshureLink: '..\testlink\productabc.pdf' },
    //    { name: "Product ABC", broshureLink: '..\testlink\productabc.pdf' },
    //    { name: "Product ABC", broshureLink: '..\testlink\productabc.pdf' },
    //    { name: "Product ABC", broshureLink: '..\testlink\productabc.pdf' },
    //    { name: "Product ABC", broshureLink: '..\testlink\productabc.pdf' },
    //    { name: "Product ABC", broshureLink: '..\testlink\productabc.pdf' }
    //];
}]