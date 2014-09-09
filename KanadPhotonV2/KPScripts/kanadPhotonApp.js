

var kanadPhotonModule = angular.module('kanadPhotonApp', ['ui.bootstrap', 'ui.router', 'angulartics', 'angulartics.google.analytics']);

kanadPhotonModule.config(['$locationProvider', function ($location) {
    $location.hashPrefix('!');
}]);
kanadPhotonModule.config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: '../KPTemplates/Home/home.min.html',
        controller: 'homeController'
    });
    $stateProvider.state('home_2', {
        url: '',
        templateUrl: '../KPTemplates/Home/home.min.html',
        controller: 'homeController'
    });
    $stateProvider.state('contact', {
        url: '/ContactUs',
        templateUrl: '../KPTemplates/ContactUs/contactus.min.html',
        controller: 'contactUsController'
    });
    $stateProvider.state('downloads', {
        url: '/Downloads',
        templateUrl: '../KPTemplates/Downloads/downloads.min.html',
        controller: 'downloadsController'
    });

    $stateProvider.state('products', {
        url: '/products/:catagory',
        templateUrl: '../KPTemplates/Products/productByCatagory.min.html',
        controller: 'productByCatagory'
    });

    $stateProvider.state('aboutUs', {
        url: '/AboutUs',
        templateUrl: '../KPTemplates/AboutUs/aboutUs.min.html',
        controller: 'aboutUsController'
    });

}])