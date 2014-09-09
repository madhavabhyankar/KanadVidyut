var downloadsController = [
    '$scope',
    function($scope) {
        $scope.catalogs = {
            'complete': {
                displayName: 'Complete Catalog',
                catPdf: '\\Documents\\Kanad Catalog.pdf'
            },
            'colorimeter': {
                displayName: 'Digital Colorimeters Catalog',
                catPdf: '\\Documents\\Kanad Colorimeter Catalogue A4.pdf'
            },
            'analyzer': {
                displayName: 'Kanad Photon Biochemistry Analyzers Catalog',
                catPdf: '\\Documents\\Kanad Photon Analyzer catalog.pdf'
            }
        };
    }
];