var contactUsController = ['$scope', '$location', 'emailService',
function ($scope, $location, emailService) {
    $scope.clientInformation = {};
    $scope.submitContactInformation = function () {


        
        var originationDetails = $scope.ipFunction();

        emailService.sendEmail("Query via Contact US From",
            $scope.clientInformation.firmName,
            $scope.clientInformation.contactEmail,
            $scope.clientInformation.contactName,
            $scope.clientInformation.contactPhone,
            $scope.clientInformation.contactQuery,
            originationDetails
                ).then(function () {
            alert("Your query has been submitted, we will follow up shortly.");
            $location.path("/");

        }, function (e) {
            alert("There was an error submitting your query");
        });

    }
    $scope.ipFunction = function () {
        if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
        else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

        xmlhttp.open("GET", "http://api.hostip.info/get_html.php", false);
        xmlhttp.send();
        return xmlhttp.responseText;
    }
}]