kanadPhotonModule.factory('emailService', ['$http', '$q',

function ($http, $q) {

    _sendEmail = function (subject, firmName, contactEmail, contactName, contactPhone, query, originationDetails) {
        var deferred = $q.defer();
        $http.post('/Email/SendMail', {
            subject: subject,
            firmName: firmName,
            contactEmail: contactEmail,
            contactName: contactName,
            contactPhone: contactPhone,
            query: query,
            originationDetails: originationDetails
        })
            .then(function () {
                deferred.resolve();
            }, function (e) {
                deferred.reject(e);
            });

        return deferred.promise;
    };
    return {
        sendEmail: _sendEmail
    };
}])