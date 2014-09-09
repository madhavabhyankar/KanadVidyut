kanadPhotonModule.factory('productService', ['$http', '$q',
    //{
    //    name:'',
    //    catagory: '',
    //    brochureLink: '',
    //    image: [],
    //    description:''
    //}
    function ($http, $q) {
        var catagories = [
            /*0*/
            {
                name: 'Digital Hemoglobinometer', description: '<span style="font-weight: bold; font-style: italic; text-decoration: underline">Digital Haemoglobinometer (HEMA)</span>\
<div>a) Solid State light source (LED s source) based hemoglobin measurement.<br/>\
b) Very steady and easy to calibrate against known value of Hb. <br/>\
c) Very easy to use.<br/>\
d) Powder coated metal box and very small in size. <br/>\
e) Works on Dry batteries for hours ( Battery box provided)</div>', image: ''
            },
            /*1*/
            {
                name: 'Biochemistry Analyzer', description: '<span style="font-weight: bold; font-style: italic; text-decoration: underline">Biochemistry Analyzer (Kanad Photon range)</span>\
<div>a) <b>KANAD PHOTON Biochemistry Analyzers</b> provide Solid State Light Source (LEDs) based Semi-Auto Clinical Chemistry Analyzer which can perform all Kinetic , Fixed time, End point tests, turbidity measurements (like ASO, CRP, HbA1c etc.) in linear & Multi-point calibration modes. Thus you can measure, <ul><li>Liver functions tests</li><li>Serum Lipid tests</li><li>Kidney functions tests</li><li>Thyroid tests</li><li>Allergy factors & Rheumatoid factors</li><li>Immunoassay (ELISA) readings</li><li>Electrolytes (like Na+, K+, Cl-, Ca, Mg)</li><li>Hemoglobin (Hb)</li><li>Routine Biochemical test (like Glucose, Cholesterol, Bilirubin etc)</li></ul><br/>b) Lowest reagent volume of <b>250 µl ( 0.250ml) only.</b> <br/>c) Zero Maintenance, No Filters, No Lamp change & Powder Coated Metal Body. <br/>d) <b>Very stable & long lasting Solid state Light sources (LEDs sources)</b><br/>e) Completely OPEN SYSTEM for reagent use.<br/>f) Very easy to use.<br/>f) Up to 10 hrs of working on 12V Motorcycle battery. <br/>g)  Very small footprint of less than 1ft X 1ft</div>', image: ''
            },
            /*2*/
            {
                name: 'Dry Bath Incubator', description: '<span style="font-weight: bold; font-style: italic; text-decoration: underline">Dry Bath Incubator (DB 18)</span>\
<div>a) Uniquely Designed heater block with 18 cuvette holes to fit Semi-micro Cuvettes, Square Cuvettes& Round Cuvettes.<br/>\
b) Also used for reagent vials especially for smaller volumes.<br/>\
c) Microprocessor based temperature stabilization for 37 (+/-1)Deg C.</div>', image: ''
            },
            /*3*/
            {
                name: 'Digital Colorimeter', description: '<span style="font-weight: bold; font-style: italic; text-decoration: underline">Digital Colorimter (HANS)</span>\
<div>a) HANS Digital Colorimeter is one of the best known and Oldest Brands of Digital Colorimeters in India. Its an LEDs source based colorimeter (photometer).<br/>b) Used for Measurement of End Point Biochemistry Tests & Hemoglobin<br/>c) Routine Photo-metric testing ;  water testing, turbidity testing, bacterial growth testing, Solid testing etc.<br/>d) Powder coated metal box and very small in size.<br/>e) Works on Dry batteries for hours ( Battery box provided)</div>', image: ''
            }
        ];
        var products = {
            'hema': {
                name: 'HEMA',
                catagory: catagories[0].name,
                brochureLink: '\\Documents\\HEMA.pdf',
                image: ['\\Images\\HEMA.jpg'],
                description: ['For Direct Hb Results.', 'No Maintenance', 'With AUTOZERO.', 'With Hb, CAL and Absorbance modes.', 'Numeric Entry of Known Hb for CAL mode.', 'Can Use Round or Square Cuvettes.', 'Drabkin, SLS, AHD or other non poison methods']
            },
            'kp7': {
                name: 'Kanad Photon 7',
                catagory: catagories[1].name,
                brochureLink: '\\Documents\\KP_7P New.pdf',
                image: ['\\Images\\Kanad Photon 7P.jpg', '\\Images\\Kanad Photon 7P_1.jpg'],
                description: ['ZERO MAINTENANCE', '5 YEARS OPTICAL WARRANTY', '10 TIMES MORE LIFE THAN HALOGEN LAMP', 'EXCEELENT REPEATABILITY & PRECISION']
            },
            'kp35': {
                name: 'Kanad Photon 35',
                catagory: catagories[3].name,
                brochureLink: '\\Documents\\Kanadphoton 35_1.pdf',
                image: ['\\Images\\Kanad Photon 35.jpg'],
                description: ['Very easy to program and run test', 'All type of cuvetts', '9 Wavelength: 450,430,465,505,565,585,630,700', 'Open system', '35 User defined programs', 'Very low power consumption']
            },
            'kp391': {
                name: 'Kanad Photon 391',
                catagory: catagories[3].name,
                brochureLink: '\\Documents\\KP 391.pdf',
                image: ['\\Images\\KP 391.jpg'],
                description: ['HIGH PRECISION ABSORBANCE (O. D.) MODE', 'AUTOZERO BY SWITCH', 'WAVELENGTH SELECTION BY SWITCH', 'NINE WAVELENGTHS: 405, 430, 465, 505, 530, 565, 585, 630 & 700 nms', 'ALPHA-NUMERIC BACKLIT DISPLAY', 'SOLID STATE, LIFE-LONG LIGHT SOURCE', 'SMALL REAGENT VOLUME', '[ FACTOR, CONCENTRATION & ABSORBANCE MODES ]']
            },
            'kp393': {
                name: 'Kanad Photon 393',
                catagory: catagories[3].name,
                brochureLink: '\\Documents\\KP 393.pdf',
                image: ['\\Images\\KanadPhoton 393.jpg'],
                description: ['HIGHER PRECISION IN ABSORBANCE MODE', 'AUTOZERO BY SWITCH', 'WAVELENGTH SELECTION BY SWITCH', 'NINE WAVELENGTHS: 405,430,465,505,530,565,585,630,700', 'ALPHA-NUMERIC BACKLIT DISPLAY', 'SOLID STATE, LIFE-LONG LIGHT SOURCE', 'SMALL REAGENT VOLUME', 'KEYBOARD FOR NUMBERS AND FACTOR, CONCENTRATION & ABSORBANCE MODES']
            },
            'kp9mpc': {
                name: 'Kanad Photon 9MPC',
                catagory: catagories[1].name,
                brochureLink: '\\Documents\\KP_9MPC.pdf',
                image: ['\\Images\\Kanad Photon 9MPC.jpg', '\\Images\\Kanad Photon 9MPC_2.jpg'],
                description: ['ZERO MAINTENANCE', '5 YEARS OPTICAL WARRANTY', '10 TIMES MORE LIFE THAN HALOGEN LAMP', 'EXCEELENT REPEATABILITY & PRECISION', '4 in 1 performer *Biochemistry *Turbidimetry *Electrolytes *ELISA readings', 'Full Clinical Chemistry End Point, Fixed Time, Kinetic Multi-Point Calibration']
            },
            'kp8mpc': {
                name: 'Kanad Photon 8MPC',
                catagory: catagories[1].name,
                brochureLink: '\\Documents\\KP_8 New.pdf',
                image: ['\\Images\\Kanad Photon 8MPC.jpg'],
                description: ['ZERO MAINTENANCE', '5 YEARS OPTICAL WARRANTY', '10 TIMES MORE LIFE THAN HALOGEN LAMP', 'EXCEELENT REPEATABILITY & PRECISION']
            },

            'kp6p': {
                name: 'Kanad Photon 6P',
                catagory: catagories[1].name,
                brochureLink: '\\Documents\\Kanad photon 6P.pdf',
                image: ['\\Images\\Kanad Photon 6P.jpg'],
                description: ['desc pt 1', 'desc pt 2', 'dec pt 3']
            },

            'dbi': {
                name: 'Dry bath Incubator',
                catagory: catagories[2].name,
                brochureLink: '\\Documents\\Kanad Dry Bath Incubator DB18_1.pdf',
                image: ['\\Images\\Dry bath Incubator.jpg'],
                description: ['Dry Bath Incubator with 18', 'Cuvettes/test tubes Capacity', 'Square ( 12.5mm X 12.5mm) & Round ( Dia. 12mm ) both types accommodated', 'Microprocessor controlled precise Temp up to 37°C.']
            }
            //'hans291':{
            //    name: 'HANS 291',
            //    catagory: catagories[3].name,
            //    brochureLink: '',
            //    image: ['\\Images\\HANS 291.jpg'],
            //    description:''
            //},
            //'hans293':{
            //    name: 'HANS 293',
            //    catagory: catagories[3].name,
            //    brochureLink: '',
            //    image: ['\\Images\\HANS 293.jpg'],
            //    description:  ['desc pt 1', 'desc pt 2', 'dec pt 3']
            //}
        };
        _getProductCatatories = function () {
            var deferred = $q.defer();
            deferred.resolve(catagories);
            return deferred.promise;
        };
        _getProductForCatagory = function (catagory) {
            var deferred = $q.defer();
            var prods = _.filter(products, function (p) {
                return p.catagory === catagory;
            });

            deferred.resolve(prods);

            return deferred.promise;
        };
        _getAllProducts = function () {
            var deferred = $q.defer();

            deferred.resolve(products);

            return deferred.promise;
        }
        _getSlideShowProducts = function () {
            var deferred = $q.defer();
            var retProduct = [
                products['kp391'], products['hema'], products['dbi'], products['kp393'], products['kp35'], products['kp6p'], products['kp7'], products['kp8mpc'], products['kp9mpc']
            ];

            deferred.resolve(retProduct);
            return deferred.promise;
        }
        return {
            getProductCatatories: _getProductCatatories,
            getProductForCatagory: _getProductForCatagory,
            getAllProducts: _getAllProducts,
            getSlideShowProducts: _getSlideShowProducts
        };
    }
])