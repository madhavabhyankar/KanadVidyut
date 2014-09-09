var homeController = ['$scope', '$location','$sce','productService',
    function ($scope, $location, $sce,productService) {
        $scope.slideshowInterval = 5000;
        $scope.slides = [];
        $scope.showContactInformation = false;
        $scope.showMailInfo = false;
        $scope.showPhoneInfo = false;

        //$scope.slides.push({ image: 'Images/hans-253.jpg', text: "Hans 251", details:"Details about Hans 251" });
        //$scope.slides.push({ image:  'Images/hans-253.jpg', text: 'Hans 253', details: "Details about Hans 253"});
        //$scope.slides.push({ image: 'Images/analyser.gif', text: 'Analyser', details: "Details about Analyser" });

        productService.getSlideShowProducts().then(
            function(result) {
                _.each(result, function (data) {
                    if (data.image.length > 0) {
                        $scope.slides.push({ image: data.image[0], text: data.name, details: data.description, brochureLink: data.brochureLink });
                    }
                });
            },
            function() {});
        productService.getProductCatatories().then(function (result) {
            $scope.catagories = []
            _.each(result, function(cat) {
                var newObj = { name: cat.name, description: $sce.trustAsHtml(cat.description), image: cat.image };
                $scope.catagories.push(newObj);
            });
            //$scope.catagories = result;
        }, function() {
            //error
        });
        
        //$scope.testimonials = [
        //    { header: "Wow!", content: "This project was fantastic!", author: "annon", firm: "Dummy Firm" },
        //    { header: "Beautiful!", content: "Well build", author: "user", firm: "Test Firm" }
        //];
        $scope.hideContactInformation = function() {
            $scope.showContactInformation = false;
            $scope.showMailInfo = false;
            $scope.showPhoneInfo = false;
            $scope.showSnailMailInfo = false;
        };
        $scope.showMail = function () {
            $scope.showContactInformation = true;
            $scope.showMailInfo = true;
            $scope.showPhoneInfo = false;
        };
        $scope.showPhoneAndFax = function() {
            $scope.showContactInformation = true;
            $scope.showMailInfo = false;
            $scope.showPhoneInfo = true;
        };
       
    }]